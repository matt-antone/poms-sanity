#!/usr/bin/env node

/**
 * Migration Export Script
 *
 * Combines processed content with asset metadata and generates
 * NDJSON format for Sanity CLI import.
 */

const fs = require("fs").promises;
const path = require("path");

// Configuration
const CONFIG = {
  inputDir: path.join(__dirname, "processed"),
  assetsFile: path.join(__dirname, "assets.json"),
  outputFile: path.join(__dirname, "data.ndjson"),
  outputAssetsFile: path.join(__dirname, "assets.json"),
  sourceDir: path.join(__dirname, "..", "poms2024", "src", "content"),
};

/**
 * Load and parse JSON file
 */
async function loadJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * Load processed content files
 */
async function loadProcessedContent() {
  const content = [];

  try {
    const files = await fs.readdir(CONFIG.inputDir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(CONFIG.inputDir, file);
        try {
          const data = await loadJsonFile(filePath);
          if (data) {
            content.push(data);
          }
        } catch (err) {
          console.warn(`⚠️  Skipping invalid or unreadable file: ${filePath}`);
        }
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  return content;
}

/**
 * Load asset metadata
 */
async function loadAssetMetadata() {
  const assets = await loadJsonFile(CONFIG.assetsFile);
  return assets || {};
}

/**
 * Generate Sanity document ID
 */
function generateDocumentId(type, slug) {
  return `${type}.${slug}`;
}

/**
 * Convert content to Sanity document format
 */
function convertToSanityDocument(content, assets) {
  const { type, slug, data } = content;

  // Validate required fields
  if (!type || !slug || !data) {
    console.warn(
      `⚠️  Skipping file: missing required fields (type: ${type}, slug: ${slug}, data: ${!!data})`
    );
    return null;
  }

  // Generate document ID
  const _id = generateDocumentId(type, slug);

  // Base document structure
  const document = {
    _id,
    _type: type,
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: "1",
    ...data,
  };

  // Handle image references
  if (data.image && assets[data.image]) {
    const assetInfo = assets[data.image];
    document.image = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetInfo._id,
      },
    };
  }

  // Handle gallery images
  if (data.gallery && Array.isArray(data.gallery)) {
    document.gallery = data.gallery
      .filter((img) => assets[img])
      .map((img) => ({
        _type: "image",
        asset: {
          _type: "reference",
          _ref: assets[img]._id,
        },
      }));
  }

  // Handle author references
  if (data.author && typeof data.author === "string") {
    document.author = {
      _type: "reference",
      _ref: generateDocumentId("person", data.author),
    };
  }

  // Handle category references
  if (data.category && typeof data.category === "string") {
    document.category = {
      _type: "reference",
      _ref: generateDocumentId("category", data.category),
    };
  }

  return document;
}

/**
 * Generate NDJSON content
 */
function generateNDJSON(documents) {
  return documents.map((doc) => JSON.stringify(doc)).join("\n");
}

/**
 * Main export function
 */
async function exportMigration() {
  console.log("🚀 Starting migration export...");

  try {
    // Load processed content
    console.log("📂 Loading processed content...");
    const content = await loadProcessedContent();
    console.log(`   Loaded ${content.length} content files`);

    // Load asset metadata
    console.log("🖼️  Loading asset metadata...");
    const assets = await loadAssetMetadata();
    console.log(`   Loaded ${Object.keys(assets).length} assets`);

    // Convert to Sanity documents
    console.log("🔄 Converting to Sanity format...");
    const documents = content
      .map((item) => convertToSanityDocument(item, assets))
      .filter(Boolean);
    console.log(`   Converted ${documents.length} documents`);

    // Generate NDJSON
    console.log("📝 Generating NDJSON...");
    const ndjson = generateNDJSON(documents);

    // Write output files
    console.log("💾 Writing output files...");
    await fs.writeFile(CONFIG.outputFile, ndjson, "utf8");
    await fs.writeFile(
      CONFIG.outputAssetsFile,
      JSON.stringify(assets, null, 2),
      "utf8"
    );

    console.log("✅ Migration export completed successfully!");
    console.log(`   Documents: ${documents.length}`);
    console.log(`   Assets: ${Object.keys(assets).length}`);
    console.log(`   Output: ${CONFIG.outputFile}`);
    console.log(`   Assets: ${CONFIG.outputAssetsFile}`);

    return {
      documents: documents.length,
      assets: Object.keys(assets).length,
      outputFile: CONFIG.outputFile,
      assetsFile: CONFIG.outputAssetsFile,
    };
  } catch (error) {
    console.error("❌ Migration export failed:", error);
    throw error;
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  exportMigration()
    .then((result) => {
      console.log("\n📊 Export Summary:");
      console.log(`   Documents exported: ${result.documents}`);
      console.log(`   Assets referenced: ${result.assets}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Export failed:", error);
      process.exit(1);
    });
}

module.exports = {
  exportMigration,
  convertToSanityDocument,
  generateDocumentId,
  generateNDJSON,
};
