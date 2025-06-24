/**
 * Asset Download Script for Tina CMS to Sanity CMS Migration
 * Task 2.2: Create asset download script
 *
 * This script downloads all images and assets from Cloudinary URLs and stores them
 * locally in the images/ directory for Sanity CLI import.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const http = require("http");

// Configuration
const SOURCE_DIR = path.join(__dirname, "..", "poms2024", "src", "content");
const OUTPUT_DIR = path.join(__dirname);
const IMAGES_DIR = path.join(__dirname, "images");
const FILES_DIR = path.join(__dirname, "files");

// Asset tracking
const assetMetadata = {
  images: [],
  files: [],
};

// Helper function to download a file from URL
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https:") ? https : http;

    const request = protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        resolve(filePath);
      });

      fileStream.on("error", (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    });

    request.on("error", (err) => {
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

// Helper function to generate SHA1 hash for filename
function generateAssetId(url) {
  return crypto.createHash("sha1").update(url).digest("hex");
}

// Helper function to get file extension from URL
function getFileExtension(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = path.extname(pathname);
    return extension || ".jpg"; // Default to .jpg if no extension found
  } catch (error) {
    return ".jpg"; // Default fallback
  }
}

// Helper function to extract image URLs from MDX content
function extractImageUrls(content) {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urls = new Set();
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const [fullMatch, alt, src] = match;
    if (src.startsWith("http")) {
      urls.add(src);
    }
  }

  return Array.from(urls);
}

// Helper function to extract image URLs from frontmatter
function extractFrontmatterImageUrls(frontmatter) {
  const urls = [];

  // Check common image fields in frontmatter
  const imageFields = ["image", "coverImage", "hero", "logo", "avatar"];

  for (const field of imageFields) {
    if (frontmatter[field] && frontmatter[field].startsWith("http")) {
      urls.push(frontmatter[field]);
    }
  }

  return urls;
}

// Helper function to parse frontmatter from MDX (reused from process-content.js)
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    return { frontmatter: {}, content: content.trim() };
  }

  const frontmatterStr = frontmatterMatch[1];
  const mdxContent = frontmatterMatch[2];

  // Parse YAML-like frontmatter
  const frontmatter = {};
  const lines = frontmatterStr.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: mdxContent.trim() };
}

// Helper function to process a single asset
async function processAsset(url, assetType = "image") {
  try {
    const assetId = generateAssetId(url);
    const extension = getFileExtension(url);
    const fileName = `${assetId}${extension}`;

    // Determine target directory
    const targetDir = assetType === "image" ? IMAGES_DIR : FILES_DIR;
    const filePath = path.join(targetDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ Asset already exists: ${fileName}`);
      return {
        _id: assetId,
        _type: assetType,
        originalUrl: url,
        fileName: fileName,
        filePath: filePath,
      };
    }

    // Download the file
    console.log(`Downloading: ${url}`);
    await downloadFile(url, filePath);

    // Get file stats
    const stats = fs.statSync(filePath);

    const assetData = {
      _id: assetId,
      _type: assetType,
      originalUrl: url,
      fileName: fileName,
      filePath: filePath,
      size: stats.size,
      downloadedAt: new Date().toISOString(),
    };

    console.log(
      `✓ Downloaded: ${fileName} (${(stats.size / 1024).toFixed(1)} KB)`
    );
    return assetData;
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error.message);
    return null;
  }
}

// Main function to scan and download all assets
async function downloadAllAssets() {
  const allUrls = new Set();
  const processedFiles = [];

  console.log("Starting asset discovery and download...");

  // Ensure directories exist
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created images directory: ${IMAGES_DIR}`);
  }

  if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
    console.log(`Created files directory: ${FILES_DIR}`);
  }

  // Content type directories to scan
  const contentTypes = [
    "blog",
    "staff",
    "webinars",
    "pages",
    "services",
    "about",
    "media",
  ];

  // Scan all content directories for assets
  for (const contentType of contentTypes) {
    const sourcePath = path.join(SOURCE_DIR, contentType);

    if (!fs.existsSync(sourcePath)) {
      console.log(`Skipping ${contentType} - directory not found`);
      continue;
    }

    console.log(`Scanning ${contentType} files for assets...`);

    // Recursively find all MDX files
    function findMdxFiles(dir) {
      const files = [];
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          files.push(...findMdxFiles(itemPath));
        } else if (item.endsWith(".mdx")) {
          files.push(itemPath);
        }
      }

      return files;
    }

    const mdxFiles = findMdxFiles(sourcePath);

    for (const filePath of mdxFiles) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const { frontmatter, content: mdxContent } = parseFrontmatter(content);

        // Extract URLs from content
        const contentUrls = extractImageUrls(mdxContent);
        contentUrls.forEach((url) => allUrls.add(url));

        // Extract URLs from frontmatter
        const frontmatterUrls = extractFrontmatterImageUrls(frontmatter);
        frontmatterUrls.forEach((url) => allUrls.add(url));

        processedFiles.push(filePath);
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }
  }

  console.log(`\nFound ${allUrls.size} unique asset URLs`);

  // Download all assets
  const downloadPromises = Array.from(allUrls).map((url) =>
    processAsset(url, "image")
  );
  const results = await Promise.allSettled(downloadPromises);

  // Process results
  const successfulDownloads = results
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);

  const failedDownloads = results.filter(
    (result) => result.status === "rejected" || !result.value
  ).length;

  // Generate assets.json metadata
  const assetsJson = {
    images: successfulDownloads.filter((asset) => asset._type === "image"),
    files: successfulDownloads.filter((asset) => asset._type === "file"),
    metadata: {
      totalAssets: successfulDownloads.length,
      totalImages: successfulDownloads.filter(
        (asset) => asset._type === "image"
      ).length,
      totalFiles: successfulDownloads.filter((asset) => asset._type === "file")
        .length,
      failedDownloads: failedDownloads,
      processedFiles: processedFiles.length,
      generatedAt: new Date().toISOString(),
    },
  };

  // Write assets.json
  const assetsPath = path.join(OUTPUT_DIR, "assets.json");
  fs.writeFileSync(assetsPath, JSON.stringify(assetsJson, null, 2));

  console.log(`\nAsset download complete!`);
  console.log(`- Scanned ${processedFiles.length} MDX files`);
  console.log(`- Found ${allUrls.size} unique asset URLs`);
  console.log(`- Successfully downloaded ${successfulDownloads.length} assets`);
  console.log(`- Failed downloads: ${failedDownloads}`);
  console.log(`- Images directory: ${IMAGES_DIR}`);
  console.log(`- Files directory: ${FILES_DIR}`);
  console.log(`- Assets metadata written to: ${assetsPath}`);

  return {
    assets: successfulDownloads,
    metadata: assetsJson.metadata,
    assetsJson: assetsJson,
  };
}

// Export functions for testing
module.exports = {
  downloadAllAssets,
  processAsset,
  extractImageUrls,
  extractFrontmatterImageUrls,
  generateAssetId,
  getFileExtension,
};

// Run if called directly
if (require.main === module) {
  downloadAllAssets().catch(console.error);
}
