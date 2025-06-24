#!/usr/bin/env node

/**
 * Complete Migration Workflow Script
 *
 * This script orchestrates the entire migration process from Tina CMS to Sanity CMS:
 * 1. Process MDX content using process-content.js
 * 2. Download assets using download-assets.js
 * 3. Export migration data using export-migration.js
 * 4. Validate migration data using validate-migration.js
 */

const fs = require("fs").promises;
const path = require("path");
const { spawn } = require("child_process");

// Import our migration modules
const { processAllContent } = require("./process-content");
const { downloadAssets } = require("./download-assets");
const { exportMigration } = require("./export-migration");
const { validateMigration } = require("./validate-migration");

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, "..", "poms2024", "src", "content"),
  processedDir: path.join(__dirname, "processed"),
  outputDir: __dirname,
  cleanupAfter: false, // Set to true to cleanup intermediate files
};

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Run a command and return a promise
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

/**
 * Step 1: Process content from MDX to Sanity format
 */
async function processContent() {
  console.log("🔄 Step 1: Processing MDX content...");

  try {
    // Ensure processed directory exists
    await ensureDir(CONFIG.processedDir);

    // Use the existing process-content.js functionality
    const result = await processAllContent();

    console.log(`✅ Content processing completed:`);
    console.log(`   - Processed ${result.processedFiles.length} files`);
    console.log(`   - Generated ${result.documents.length} documents`);

    return result;
  } catch (error) {
    console.error("❌ Content processing failed:", error.message);
    throw error;
  }
}

/**
 * Step 2: Download assets
 */
async function downloadAllAssets() {
  console.log("\n🔄 Step 2: Downloading assets...");

  try {
    const result = await downloadAssets();

    console.log(`✅ Asset download completed:`);
    console.log(`   - Downloaded ${result.successful} assets`);
    console.log(`   - Failed downloads: ${result.failed}`);
    console.log(`   - Total unique URLs: ${result.totalUrls}`);

    return result;
  } catch (error) {
    console.error("❌ Asset download failed:", error.message);
    throw error;
  }
}

/**
 * Step 3: Export migration data
 */
async function exportMigrationData() {
  console.log("\n🔄 Step 3: Exporting migration data...");

  try {
    const result = await exportMigration();

    console.log(`✅ Migration export completed:`);
    console.log(`   - Documents: ${result.documents}`);
    console.log(`   - Assets: ${result.assets}`);
    console.log(`   - Output file: ${result.outputFile}`);
    console.log(`   - Assets file: ${result.assetsFile}`);

    return result;
  } catch (error) {
    console.error("❌ Migration export failed:", error.message);
    throw error;
  }
}

/**
 * Step 4: Validate migration data
 */
async function validateMigrationData() {
  console.log("\n🔄 Step 4: Validating migration data...");

  try {
    const result = await validateMigration();

    if (result.success) {
      console.log(`✅ Migration validation passed:`);
      console.log(`   - Documents: ${result.summary.documents.total}`);
      console.log(`   - Assets: ${result.summary.assets.total}`);
      console.log(`   - Status: ${result.summary.validation.status}`);
    } else {
      console.log(`❌ Migration validation failed:`);
      console.log(`   - Errors: ${result.errors.length}`);
      for (const error of result.errors.slice(0, 5)) {
        console.log(`     • ${error}`);
      }
      if (result.errors.length > 5) {
        console.log(`     ... and ${result.errors.length - 5} more errors`);
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Migration validation failed:", error.message);
    throw error;
  }
}

/**
 * Cleanup intermediate files
 */
async function cleanup() {
  if (!CONFIG.cleanupAfter) return;

  console.log("\n🧹 Cleaning up intermediate files...");

  try {
    // Remove processed directory
    await fs.rmdir(CONFIG.processedDir, { recursive: true });
    console.log("✅ Cleanup completed");
  } catch (error) {
    console.warn("⚠️  Cleanup failed:", error.message);
  }
}

/**
 * Display final summary and next steps
 */
function displaySummary(results) {
  console.log("\n" + "=".repeat(60));
  console.log("🎉 MIGRATION COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));

  console.log("\n📊 Summary:");
  console.log(
    `   Content files processed: ${results.content.processedFiles.length}`
  );
  console.log(`   Documents generated: ${results.export.documents}`);
  console.log(`   Assets downloaded: ${results.assets.successful}`);
  console.log(
    `   Validation status: ${results.validation.summary.validation.status}`
  );

  console.log("\n📁 Output files:");
  console.log(`   • ${results.export.outputFile}`);
  console.log(`   • ${results.export.assetsFile}`);
  console.log(`   • ${path.join(__dirname, "images")} (directory)`);
  console.log(`   • ${path.join(__dirname, "files")} (directory)`);

  console.log("\n🚀 Next steps:");
  console.log("   1. Set up your Sanity project and dataset");
  console.log("   2. Install Sanity CLI: npm install -g @sanity/cli");
  console.log(
    "   3. Import data: sanity dataset import data.ndjson <your-dataset>"
  );
  console.log("   4. Upload assets to Sanity's CDN");
  console.log("   5. Update asset references in your documents");

  console.log("\n💡 Tips:");
  console.log("   • Test the import on a development dataset first");
  console.log("   • Backup your existing data before importing");
  console.log("   • Verify all content renders correctly in Sanity Studio");
}

/**
 * Main migration workflow
 */
async function runMigration() {
  const startTime = Date.now();

  console.log("🚀 Starting complete migration workflow...");
  console.log(`   Source: ${CONFIG.sourceDir}`);
  console.log(`   Output: ${CONFIG.outputDir}`);

  try {
    // Check if source directory exists
    try {
      await fs.access(CONFIG.sourceDir);
    } catch (error) {
      throw new Error(`Source directory not found: ${CONFIG.sourceDir}`);
    }

    // Run migration steps
    const results = {};

    results.content = await processContent();
    results.assets = await downloadAllAssets();
    results.export = await exportMigrationData();
    results.validation = await validateMigrationData();

    // Check if validation passed
    if (!results.validation.success) {
      throw new Error(
        "Migration validation failed. Please fix errors before proceeding."
      );
    }

    // Cleanup if requested
    await cleanup();

    // Display summary
    displaySummary(results);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Total time: ${duration}s`);

    return results;
  } catch (error) {
    console.error("\n💥 Migration failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   • Check that all source files exist");
    console.log("   • Verify network connectivity for asset downloads");
    console.log("   • Review error messages above for specific issues");
    console.log("   • Run individual scripts to isolate problems");

    throw error;
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Migration Workflow Script

Usage: node run-migration.js [options]

Options:
  --help, -h          Show this help message
  --cleanup           Remove intermediate files after completion
  --source <path>     Specify custom source directory
  --output <path>     Specify custom output directory

Examples:
  node run-migration.js
  node run-migration.js --cleanup
  node run-migration.js --source ../custom-content
`);
    return;
  }

  if (args.includes("--cleanup")) {
    CONFIG.cleanupAfter = true;
  }

  const sourceIndex = args.indexOf("--source");
  if (sourceIndex !== -1 && args[sourceIndex + 1]) {
    CONFIG.sourceDir = path.resolve(args[sourceIndex + 1]);
  }

  const outputIndex = args.indexOf("--output");
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    CONFIG.outputDir = path.resolve(args[outputIndex + 1]);
  }

  try {
    await runMigration();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  runMigration,
  processContent,
  downloadAllAssets,
  exportMigrationData,
  validateMigrationData,
  CONFIG,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
