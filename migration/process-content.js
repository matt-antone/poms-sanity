/**
 * Content Processing Script for Tina CMS to Sanity CMS Migration
 * Task 2.1: Create content processing script
 *
 * This script processes MDX files from the source site and converts them to Sanity format.
 * It handles blog posts, staff profiles, webinars, and static pages.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Configuration
const SOURCE_DIR = path.join(__dirname, "..", "poms2024", "src", "content");
const OUTPUT_DIR = path.join(__dirname);
const IMAGES_DIR = path.join(__dirname, "images");

// Content type mappings
const CONTENT_TYPES = {
  blog: "post",
  staff: "person",
  webinars: "post",
  pages: "page",
  services: "page",
  about: "page",
  media: "post",
};

// Helper function to generate Sanity document ID
function generateDocumentId(content, type) {
  const hash = crypto.createHash("sha1").update(content).digest("hex");
  return `${type}.${hash.substring(0, 8)}`;
}

// Helper function to parse frontmatter from MDX
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

// Helper function to convert MDX content to Portable Text
function mdxToPortableText(mdxContent) {
  // This is a simplified conversion - in a real implementation,
  // you'd want to use a proper MDX parser and convert to Portable Text blocks

  const blocks = [];

  // Split content into lines and process each line
  const lines = mdxContent.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Handle Vimeo components
    const vimeoMatch = trimmed.match(
      /<Vimeo\s+url="([^"]+)"\s*\/?>|<Vimeo\s+url='([^']+)'\s*\/?>/
    );
    if (vimeoMatch) {
      const vimeoId = vimeoMatch[1] || vimeoMatch[2];
      const vimeoUrl = vimeoId.startsWith("http")
        ? vimeoId
        : `https://vimeo.com/${vimeoId}`;

      blocks.push({
        _type: "vimeoBlock",
        url: vimeoUrl,
        vimeoId: vimeoId,
        aspectRatio: "16:9",
        autoplay: false,
        controls: true,
        responsive: true,
      });
      continue;
    }

    // Handle headers
    if (trimmed.startsWith("#")) {
      const level = trimmed.match(/^#+/)[0].length;
      const text = trimmed.replace(/^#+\s*/, "");
      blocks.push({
        _type: "block",
        style: `h${Math.min(level, 6)}`,
        children: [{ _type: "span", text }],
      });
    }
    // Handle regular paragraphs
    else {
      blocks.push({
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: trimmed }],
      });
    }
  }

  return blocks;
}

// Helper function to process images in content using Sanity's _sanityAsset format
function processImages(content, documentId) {
  // Find image references and convert to Sanity image references
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  const images = [];

  while ((match = imageRegex.exec(content)) !== null) {
    const [fullMatch, alt, src] = match;

    // Convert relative paths to absolute file:// URLs
    let imagePath = src;
    if (
      src.startsWith("./") ||
      src.startsWith("../") ||
      !src.startsWith("http")
    ) {
      // Assume images are in the images directory
      const imageFileName = path.basename(src);
      imagePath = path.join(IMAGES_DIR, imageFileName);
      imagePath = `file://${imagePath}`;
    }

    images.push({
      _type: "image",
      _sanityAsset: `image@${imagePath}`,
      alt: alt || "",
    });
  }

  return images;
}

// Helper function to convert image path to Sanity asset format
function convertImageToSanityAsset(imagePath) {
  if (!imagePath) return undefined;

  // Handle HTTP URLs
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return {
      _type: "image",
      _sanityAsset: `image@${imagePath}`,
    };
  }

  // Handle absolute file paths
  if (path.isAbsolute(imagePath)) {
    return {
      _type: "image",
      _sanityAsset: `image@file://${imagePath}`,
    };
  }

  // Handle relative paths - assume they're in the images directory
  const imageFileName = path.basename(imagePath);
  const absolutePath = path.join(IMAGES_DIR, imageFileName);

  return {
    _type: "image",
    _sanityAsset: `image@file://${absolutePath}`,
  };
}

// Main processing function
function processContentFile(filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter, content: mdxContent } = parseFrontmatter(content);

    // Generate document ID
    const documentId = generateDocumentId(content, contentType);

    // Convert MDX to Portable Text
    const portableText = mdxToPortableText(mdxContent);

    // Process images
    const images = processImages(mdxContent, documentId);

    // Create Sanity document
    const sanityDocument = {
      _id: documentId,
      _type: contentType,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: "1",

      // Common fields
      title: frontmatter.title || frontmatter.name || "Untitled",
      slug: {
        _type: "slug",
        current: frontmatter.slug || frontmatter.path || documentId,
      },

      // Content-specific fields
      ...(contentType === "post" && {
        publishedAt:
          frontmatter.date ||
          frontmatter.publishedAt ||
          new Date().toISOString(),
        excerpt: frontmatter.excerpt || frontmatter.description || "",
        body: portableText,
        author: frontmatter.author
          ? {
              _type: "reference",
              _ref: `person.${crypto.createHash("sha1").update(frontmatter.author).digest("hex").substring(0, 8)}`,
            }
          : undefined,
        category: frontmatter.category
          ? {
              _type: "reference",
              _ref: `category.${crypto.createHash("sha1").update(frontmatter.category).digest("hex").substring(0, 8)}`,
            }
          : undefined,
      }),

      ...(contentType === "person" && {
        name: frontmatter.name || frontmatter.title || "Unknown",
        title: frontmatter.jobTitle || frontmatter.position || "",
        bio: portableText,
        image: convertImageToSanityAsset(frontmatter.image),
      }),

      ...(contentType === "page" && {
        heading: frontmatter.heading || frontmatter.title || "",
        description: portableText,
        coverImage: convertImageToSanityAsset(frontmatter.coverImage),
      }),
    };

    return sanityDocument;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// Main function to process all content
function processAllContent() {
  const documents = [];
  const processedFiles = [];

  console.log("Starting content processing...");

  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created images directory: ${IMAGES_DIR}`);
  }

  // Process each content type directory
  for (const [sourceType, sanityType] of Object.entries(CONTENT_TYPES)) {
    const sourcePath = path.join(SOURCE_DIR, sourceType);

    if (!fs.existsSync(sourcePath)) {
      console.log(`Skipping ${sourceType} - directory not found`);
      continue;
    }

    console.log(`Processing ${sourceType} files...`);

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
      const document = processContentFile(filePath, sanityType);
      if (document) {
        documents.push(document);
        processedFiles.push(filePath);
        console.log(`✓ Processed: ${path.relative(SOURCE_DIR, filePath)}`);
      }
    }
  }

  // Write documents to data.ndjson (newline-delimited JSON format for Sanity import)
  const dataPath = path.join(OUTPUT_DIR, "data.ndjson");
  const dataContent = documents.map((doc) => JSON.stringify(doc)).join("\n");
  fs.writeFileSync(dataPath, dataContent);

  console.log(`\nProcessing complete!`);
  console.log(`- Processed ${processedFiles.length} files`);
  console.log(`- Generated ${documents.length} Sanity documents`);
  console.log(`- Output written to: ${dataPath}`);
  console.log(`- Images directory: ${IMAGES_DIR}`);
  console.log(`\nNext steps:`);
  console.log(`1. Copy image files to: ${IMAGES_DIR}`);
  console.log(`2. Run: sanity dataset import ${dataPath} <your-dataset>`);

  return { documents, processedFiles };
}

// Export functions for testing
module.exports = {
  processContentFile,
  processAllContent,
  parseFrontmatter,
  mdxToPortableText,
  generateDocumentId,
  convertImageToSanityAsset,
};

// Run if called directly
if (require.main === module) {
  processAllContent();
}
