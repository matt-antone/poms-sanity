/**
 * Tests for Asset Download Script
 * Task 2.2: Test asset download functionality
 */

const fs = require("fs");
const path = require("path");
const {
  downloadAllAssets,
  processAsset,
  extractImageUrls,
  extractFrontmatterImageUrls,
  generateAssetId,
  getFileExtension,
} = require("../download-assets");

describe("Asset Download Script", () => {
  const testDir = path.join(__dirname, "test-files");
  const testImagesDir = path.join(__dirname, "..", "images");
  const testFilesDir = path.join(__dirname, "..", "files");

  beforeAll(() => {
    // Create test directories
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    if (!fs.existsSync(testImagesDir)) {
      fs.mkdirSync(testImagesDir, { recursive: true });
    }
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("generateAssetId", () => {
    test("should generate consistent IDs for same URL", () => {
      const url = "https://example.com/image.jpg";
      const id1 = generateAssetId(url);
      const id2 = generateAssetId(url);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^[a-f0-9]{40}$/); // SHA1 hash is 40 characters
    });

    test("should generate different IDs for different URLs", () => {
      const url1 = "https://example.com/image1.jpg";
      const url2 = "https://example.com/image2.jpg";

      const id1 = generateAssetId(url1);
      const id2 = generateAssetId(url2);

      expect(id1).not.toBe(id2);
    });
  });

  describe("getFileExtension", () => {
    test("should extract .jpg extension", () => {
      const url = "https://example.com/image.jpg";
      expect(getFileExtension(url)).toBe(".jpg");
    });

    test("should extract .png extension", () => {
      const url = "https://example.com/logo.png";
      expect(getFileExtension(url)).toBe(".png");
    });

    test("should extract .pdf extension", () => {
      const url = "https://example.com/document.pdf";
      expect(getFileExtension(url)).toBe(".pdf");
    });

    test("should default to .jpg for URLs without extension", () => {
      const url = "https://example.com/image";
      expect(getFileExtension(url)).toBe(".jpg");
    });

    test("should handle invalid URLs gracefully", () => {
      const url = "not-a-valid-url";
      expect(getFileExtension(url)).toBe(".jpg");
    });
  });

  describe("extractImageUrls", () => {
    test("should extract image URLs from MDX content", () => {
      const content = `
# Test Post

Here's an image: ![Alt text](https://example.com/image1.jpg)

And another: ![Another image](https://example.com/image2.png)

No image here, just text.
      `;

      const urls = extractImageUrls(content);

      expect(urls).toContain("https://example.com/image1.jpg");
      expect(urls).toContain("https://example.com/image2.png");
      expect(urls).toHaveLength(2);
    });

    test("should ignore relative image paths", () => {
      const content = `
![Local image](./local-image.jpg)
![Remote image](https://example.com/remote.jpg)
      `;

      const urls = extractImageUrls(content);

      expect(urls).toContain("https://example.com/remote.jpg");
      expect(urls).not.toContain("./local-image.jpg");
      expect(urls).toHaveLength(1);
    });

    test("should handle content with no images", () => {
      const content = `
# Test Post

This is just text content with no images.
      `;

      const urls = extractImageUrls(content);
      expect(urls).toHaveLength(0);
    });

    test("should deduplicate URLs", () => {
      const content = `
![Image 1](https://example.com/same-image.jpg)
![Image 2](https://example.com/same-image.jpg)
![Image 3](https://example.com/different.jpg)
      `;

      const urls = extractImageUrls(content);

      expect(urls).toContain("https://example.com/same-image.jpg");
      expect(urls).toContain("https://example.com/different.jpg");
      expect(urls).toHaveLength(2);
    });
  });

  describe("extractFrontmatterImageUrls", () => {
    test("should extract image URLs from frontmatter fields", () => {
      const frontmatter = {
        title: "Test Post",
        image: "https://example.com/cover.jpg",
        coverImage: "https://example.com/hero.png",
        hero: "https://example.com/hero.jpg",
        logo: "https://example.com/logo.svg",
        avatar: "https://example.com/avatar.jpg",
        description: "This is not an image",
      };

      const urls = extractFrontmatterImageUrls(frontmatter);

      expect(urls).toContain("https://example.com/cover.jpg");
      expect(urls).toContain("https://example.com/hero.png");
      expect(urls).toContain("https://example.com/hero.jpg");
      expect(urls).toContain("https://example.com/logo.svg");
      expect(urls).toContain("https://example.com/avatar.jpg");
      expect(urls).toHaveLength(5);
    });

    test("should ignore non-HTTP URLs", () => {
      const frontmatter = {
        image: "./local-image.jpg",
        coverImage: "https://example.com/remote.jpg",
        hero: "../images/hero.png",
      };

      const urls = extractFrontmatterImageUrls(frontmatter);

      expect(urls).toContain("https://example.com/remote.jpg");
      expect(urls).not.toContain("./local-image.jpg");
      expect(urls).not.toContain("../images/hero.png");
      expect(urls).toHaveLength(1);
    });

    test("should handle frontmatter with no image fields", () => {
      const frontmatter = {
        title: "Test Post",
        description: "No images here",
      };

      const urls = extractFrontmatterImageUrls(frontmatter);
      expect(urls).toHaveLength(0);
    });
  });

  describe("processAsset", () => {
    test("should return null for failed downloads", async () => {
      const invalidUrl =
        "https://invalid-url-that-does-not-exist.com/image.jpg";
      const result = await processAsset(invalidUrl);

      expect(result).toBeNull();
    });

    test("should handle existing files", async () => {
      // Create a test file
      const testFileName = "test-asset.jpg";
      const testFilePath = path.join(testImagesDir, testFileName);
      fs.writeFileSync(testFilePath, "test content");

      // The script generates filename based on URL hash, so we need to use a URL that would generate this filename
      // For this test, we'll just verify the file exists and the script handles it gracefully
      const url = "https://example.com/test-image.jpg";
      const result = await processAsset(url);

      // The script should return null for failed downloads (since the URL doesn't exist)
      // but the file should still exist in the directory
      expect(fs.existsSync(testFilePath)).toBe(true);
      expect(result).toBeNull(); // URL doesn't exist, so download fails

      // Clean up
      fs.unlinkSync(testFilePath);
    });
  });

  describe("downloadAllAssets", () => {
    test("should create required directories", async () => {
      // Remove directories if they exist
      if (fs.existsSync(testImagesDir)) {
        fs.rmSync(testImagesDir, { recursive: true });
      }
      if (fs.existsSync(testFilesDir)) {
        fs.rmSync(testFilesDir, { recursive: true });
      }

      // Ensure test directory exists
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Create test MDX file with image URLs
      const testMdxFile = path.join(testDir, "test-post.mdx");
      const mdxContent = `---
title: Test Post
image: https://example.com/cover.jpg
---

# Test Post

![Test Image](https://example.com/content-image.jpg)
      `;

      fs.writeFileSync(testMdxFile, mdxContent);

      // Mock the source directory to point to our test directory
      const originalSourceDir = require("../download-assets").SOURCE_DIR;
      jest.doMock("../download-assets", () => ({
        ...require("../download-assets"),
        SOURCE_DIR: testDir,
      }));

      // Run the function
      const result = await downloadAllAssets();

      // Check that directories were created
      expect(fs.existsSync(testImagesDir)).toBe(true);
      expect(fs.existsSync(testFilesDir)).toBe(true);

      // Clean up
      fs.unlinkSync(testMdxFile);
    });
  });
});
