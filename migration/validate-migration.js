/**
 * Migration Validation Script for Tina CMS to Sanity CMS Migration
 * Task 2.4: Create migration validation script
 *
 * This script validates the migration export data to ensure it's properly formatted
 * for Sanity CLI import and all references are valid.
 */

const fs = require("fs").promises;
const path = require("path");

// Configuration
const CONFIG = {
  dataFile: path.join(__dirname, "data.ndjson"),
  assetsFile: path.join(__dirname, "assets.json"),
  imagesDir: path.join(__dirname, "images"),
  filesDir: path.join(__dirname, "files"),
};

// Sanity document types that should exist
const VALID_DOCUMENT_TYPES = [
  "post",
  "person",
  "page",
  "category",
  "home",
  "settings",
];

// Required fields for each document type
const REQUIRED_FIELDS = {
  post: ["_id", "_type", "title", "slug", "publishedAt"],
  person: ["_id", "_type", "name", "slug"],
  page: ["_id", "_type", "title", "slug"],
  category: ["_id", "_type", "title", "slug"],
  home: ["_id", "_type", "title"],
  settings: ["_id", "_type", "title"],
};

/**
 * Load and parse NDJSON data file
 */
async function loadNDJSONData() {
  try {
    const content = await fs.readFile(CONFIG.dataFile, "utf8");
    const lines = content.trim().split("\n");
    const documents = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        const doc = JSON.parse(lines[i]);
        documents.push(doc);
      } catch (error) {
        throw new Error(`Invalid JSON on line ${i + 1}: ${error.message}`);
      }
    }

    return documents;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Data file not found: ${CONFIG.dataFile}`);
    }
    throw error;
  }
}

/**
 * Load assets metadata
 */
async function loadAssetsData() {
  try {
    const content = await fs.readFile(CONFIG.assetsFile, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn("⚠️  Assets file not found, skipping asset validation");
      return {};
    }
    throw new Error(`Failed to load assets file: ${error.message}`);
  }
}

/**
 * Validate document structure
 */
function validateDocumentStructure(document, index) {
  const errors = [];

  // Check required Sanity fields
  const requiredSanityFields = [
    "_id",
    "_type",
    "_createdAt",
    "_updatedAt",
    "_rev",
  ];
  for (const field of requiredSanityFields) {
    if (!document[field]) {
      errors.push(`Missing required Sanity field: ${field}`);
    }
  }

  // Validate document type
  if (!VALID_DOCUMENT_TYPES.includes(document._type)) {
    errors.push(`Invalid document type: ${document._type}`);
  }

  // Check type-specific required fields
  const typeRequiredFields = REQUIRED_FIELDS[document._type] || [];
  for (const field of typeRequiredFields) {
    if (!document[field]) {
      errors.push(`Missing required field for ${document._type}: ${field}`);
    }
  }

  // Validate _id format
  if (document._id && !document._id.match(/^[a-zA-Z0-9._-]+$/)) {
    errors.push(`Invalid _id format: ${document._id}`);
  }

  // Validate slug structure
  if (document.slug) {
    if (typeof document.slug === "object") {
      if (!document.slug._type || document.slug._type !== "slug") {
        errors.push("Slug must have _type: 'slug'");
      }
      if (!document.slug.current) {
        errors.push("Slug must have 'current' field");
      }
    } else {
      errors.push("Slug should be an object with _type and current fields");
    }
  }

  // Validate dates
  const dateFields = ["_createdAt", "_updatedAt", "publishedAt"];
  for (const field of dateFields) {
    if (document[field] && !isValidISODate(document[field])) {
      errors.push(`Invalid date format for ${field}: ${document[field]}`);
    }
  }

  return errors.map(
    (error) => `Document ${index + 1} (${document._id || "unknown"}): ${error}`
  );
}

/**
 * Validate references
 */
function validateReferences(documents) {
  const errors = [];
  const documentIds = new Set(documents.map((doc) => doc._id));

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    // Find all reference fields
    const references = findReferences(doc);

    for (const ref of references) {
      if (!documentIds.has(ref._ref)) {
        errors.push(
          `Document ${i + 1} (${doc._id}): Reference to non-existent document: ${ref._ref}`
        );
      }
    }
  }

  return errors;
}

/**
 * Recursively find all references in a document
 */
function findReferences(obj, path = "") {
  const references = [];

  if (obj && typeof obj === "object") {
    if (obj._type === "reference" && obj._ref) {
      references.push(obj);
    } else {
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            references.push(
              ...findReferences(item, `${path}.${key}[${index}]`)
            );
          });
        } else if (typeof value === "object") {
          references.push(...findReferences(value, `${path}.${key}`));
        }
      }
    }
  }

  return references;
}

/**
 * Validate asset references
 */
async function validateAssetReferences(documents, assets) {
  const errors = [];
  const assetIds = new Set(Object.values(assets).map((asset) => asset._id));

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const assetRefs = findAssetReferences(doc);

    for (const assetRef of assetRefs) {
      if (!assetIds.has(assetRef._ref)) {
        errors.push(
          `Document ${i + 1} (${doc._id}): Reference to non-existent asset: ${assetRef._ref}`
        );
      }
    }
  }

  return errors;
}

/**
 * Find all asset references in a document
 */
function findAssetReferences(obj) {
  const assetRefs = [];

  if (obj && typeof obj === "object") {
    if (obj._type === "image" && obj.asset && obj.asset._ref) {
      assetRefs.push(obj.asset);
    } else {
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            assetRefs.push(...findAssetReferences(item));
          });
        } else if (typeof value === "object") {
          assetRefs.push(...findAssetReferences(value));
        }
      }
    }
  }

  return assetRefs;
}

/**
 * Validate asset files exist
 */
async function validateAssetFiles(assets) {
  const errors = [];

  for (const [url, asset] of Object.entries(assets)) {
    if (asset.localPath) {
      try {
        await fs.access(asset.localPath);
      } catch (error) {
        errors.push(
          `Asset file not found: ${asset.localPath} (referenced by ${url})`
        );
      }
    }
  }

  return errors;
}

/**
 * Validate NDJSON format
 */
function validateNDJSONFormat(documents) {
  const errors = [];

  // Check for duplicate IDs
  const ids = new Set();
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    if (ids.has(doc._id)) {
      errors.push(`Duplicate document ID: ${doc._id}`);
    }
    ids.add(doc._id);
  }

  return errors;
}

/**
 * Check if string is valid ISO date
 */
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return (
    date instanceof Date && !isNaN(date) && date.toISOString() === dateString
  );
}

/**
 * Generate validation summary
 */
function generateSummary(documents, assets, errors) {
  const summary = {
    documents: {
      total: documents.length,
      byType: {},
    },
    assets: {
      total: Object.keys(assets).length,
      withLocalFiles: Object.values(assets).filter((a) => a.localPath).length,
    },
    validation: {
      errors: errors.length,
      warnings: 0,
      status: errors.length === 0 ? "PASS" : "FAIL",
    },
  };

  // Count documents by type
  for (const doc of documents) {
    summary.documents.byType[doc._type] =
      (summary.documents.byType[doc._type] || 0) + 1;
  }

  return summary;
}

/**
 * Main validation function
 */
async function validateMigration() {
  console.log("🔍 Starting migration validation...");

  try {
    // Load data
    console.log("📂 Loading migration data...");
    const documents = await loadNDJSONData();
    const assets = await loadAssetsData();

    console.log(`   Loaded ${documents.length} documents`);
    console.log(`   Loaded ${Object.keys(assets).length} assets`);

    // Run validations
    console.log("🔬 Running validations...");
    const allErrors = [];

    // Validate NDJSON format
    console.log("   Validating NDJSON format...");
    allErrors.push(...validateNDJSONFormat(documents));

    // Validate document structure
    console.log("   Validating document structure...");
    for (let i = 0; i < documents.length; i++) {
      allErrors.push(...validateDocumentStructure(documents[i], i));
    }

    // Validate references
    console.log("   Validating document references...");
    allErrors.push(...validateReferences(documents));

    // Validate asset references
    if (Object.keys(assets).length > 0) {
      console.log("   Validating asset references...");
      allErrors.push(...(await validateAssetReferences(documents, assets)));

      // Validate asset files exist
      console.log("   Validating asset files...");
      allErrors.push(...(await validateAssetFiles(assets)));
    }

    // Generate summary
    const summary = generateSummary(documents, assets, allErrors);

    // Output results
    console.log("\n📊 Validation Summary:");
    console.log(`   Documents: ${summary.documents.total}`);
    for (const [type, count] of Object.entries(summary.documents.byType)) {
      console.log(`     ${type}: ${count}`);
    }
    console.log(`   Assets: ${summary.assets.total}`);
    console.log(`   Asset files: ${summary.assets.withLocalFiles}`);

    if (allErrors.length === 0) {
      console.log("\n✅ Migration validation PASSED!");
      console.log("   All documents and assets are valid");
      console.log("   Ready for Sanity CLI import");
    } else {
      console.log(
        `\n❌ Migration validation FAILED with ${allErrors.length} errors:`
      );
      for (const error of allErrors) {
        console.log(`   • ${error}`);
      }
    }

    return {
      success: allErrors.length === 0,
      errors: allErrors,
      summary,
    };
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    throw error;
  }
}

// Export functions for testing
module.exports = {
  validateMigration,
  loadNDJSONData,
  loadAssetsData,
  validateDocumentStructure,
  validateReferences,
  validateAssetReferences,
  validateAssetFiles,
  validateNDJSONFormat,
  findReferences,
  findAssetReferences,
  generateSummary,
  isValidISODate,
};

// CLI entry point
if (require.main === module) {
  validateMigration()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Validation script failed:", error);
      process.exit(1);
    });
}
