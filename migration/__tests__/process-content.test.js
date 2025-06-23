/**
 * Tests for Content Processing Script
 * Task 2.1: Test content processing functionality
 */

const fs = require("fs");
const path = require("path");
const {
  processContentFile,
  parseFrontmatter,
  mdxToPortableText,
  generateDocumentId,
  convertImageToSanityAsset,
} = require("../process-content");

describe("Content Processing Script", () => {
  const testDir = path.join(__dirname, "test-files");

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("parseFrontmatter", () => {
    test("should parse valid frontmatter", () => {
      const content = `---
title: Test Post
date: 2024-01-01
author: John Doe
---

This is the content.`;

      const result = parseFrontmatter(content);

      expect(result.frontmatter).toEqual({
        title: "Test Post",
        date: "2024-01-01",
        author: "John Doe",
      });
      expect(result.content).toBe("This is the content.");
    });

    test("should handle content without frontmatter", () => {
      const content = "This is content without frontmatter.";

      const result = parseFrontmatter(content);

      expect(result.frontmatter).toEqual({});
      expect(result.content).toBe("This is content without frontmatter.");
    });

    test("should handle quoted values in frontmatter", () => {
      const content = `---
title: "Test Post with Quotes"
description: 'This is a description'
---

Content here.`;

      const result = parseFrontmatter(content);

      expect(result.frontmatter).toEqual({
        title: "Test Post with Quotes",
        description: "This is a description",
      });
    });
  });

  describe("mdxToPortableText", () => {
    test("should convert headers to portable text", () => {
      const mdxContent = `# Header 1
## Header 2
### Header 3

Regular paragraph.`;

      const result = mdxToPortableText(mdxContent);

      expect(result).toEqual([
        {
          _type: "block",
          style: "h1",
          children: [{ _type: "span", text: "Header 1" }],
        },
        {
          _type: "block",
          style: "h2",
          children: [{ _type: "span", text: "Header 2" }],
        },
        {
          _type: "block",
          style: "h3",
          children: [{ _type: "span", text: "Header 3" }],
        },
        {
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: "Regular paragraph." }],
        },
      ]);
    });

    test("should handle regular paragraphs", () => {
      const mdxContent = `First paragraph.

Second paragraph.`;

      const result = mdxToPortableText(mdxContent);

      expect(result).toEqual([
        {
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: "First paragraph." }],
        },
        {
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: "Second paragraph." }],
        },
      ]);
    });
  });

  describe("generateDocumentId", () => {
    test("should generate consistent IDs for same content", () => {
      const content = "Test content";
      const type = "post";

      const id1 = generateDocumentId(content, type);
      const id2 = generateDocumentId(content, type);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^post\.[a-f0-9]{8}$/);
    });

    test("should generate different IDs for different content", () => {
      const content1 = "Test content 1";
      const content2 = "Test content 2";
      const type = "post";

      const id1 = generateDocumentId(content1, type);
      const id2 = generateDocumentId(content2, type);

      expect(id1).not.toBe(id2);
    });
  });

  describe("convertImageToSanityAsset", () => {
    test("should convert relative image path to Sanity asset format", () => {
      const imagePath = "./images/test.jpg";
      const result = convertImageToSanityAsset(imagePath);

      expect(result).toEqual({
        _type: "image",
        _sanityAsset: expect.stringMatching(
          /^image@file:\/\/.*\/images\/test\.jpg$/
        ),
      });
    });

    test("should handle absolute image paths", () => {
      const imagePath = "/absolute/path/image.jpg";
      const result = convertImageToSanityAsset(imagePath);

      expect(result).toEqual({
        _type: "image",
        _sanityAsset: `image@file://${imagePath}`,
      });
    });

    test("should handle HTTP URLs", () => {
      const imagePath = "https://example.com/image.jpg";
      const result = convertImageToSanityAsset(imagePath);

      expect(result).toEqual({
        _type: "image",
        _sanityAsset: `image@${imagePath}`,
      });
    });

    test("should return undefined for null/undefined paths", () => {
      expect(convertImageToSanityAsset(null)).toBeUndefined();
      expect(convertImageToSanityAsset(undefined)).toBeUndefined();
      expect(convertImageToSanityAsset("")).toBeUndefined();
    });
  });

  describe("processContentFile", () => {
    test("should process a blog post file", () => {
      const testFile = path.join(testDir, "test-post.mdx");
      const content = `---
title: Test Blog Post
date: 2024-01-01
author: John Doe
excerpt: This is a test excerpt
---

# Test Post

This is the content.

![Test Image](./images/test.jpg)`;

      fs.writeFileSync(testFile, content);

      const result = processContentFile(testFile, "post");

      expect(result).toMatchObject({
        _id: expect.stringMatching(/^post\.[a-f0-9]{8}$/),
        _type: "post",
        title: "Test Blog Post",
        publishedAt: "2024-01-01",
        excerpt: "This is a test excerpt",
        slug: {
          _type: "slug",
          current: expect.any(String),
        },
        body: expect.arrayContaining([
          expect.objectContaining({
            _type: "block",
            style: "h1",
            children: [{ _type: "span", text: "Test Post" }],
          }),
        ]),
      });

      // Clean up
      fs.unlinkSync(testFile);
    });

    test("should process a person file", () => {
      const testFile = path.join(testDir, "test-person.mdx");
      const content = `---
name: Jane Smith
jobTitle: Senior Developer
image: ./images/jane.jpg
---

# About Jane

Jane is a senior developer.`;

      fs.writeFileSync(testFile, content);

      const result = processContentFile(testFile, "person");

      expect(result).toMatchObject({
        _id: expect.stringMatching(/^person\.[a-f0-9]{8}$/),
        _type: "person",
        name: "Jane Smith",
        title: "Senior Developer",
        image: {
          _type: "image",
          _sanityAsset: expect.stringMatching(
            /^image@file:\/\/.*\/images\/jane\.jpg$/
          ),
        },
      });

      // Clean up
      fs.unlinkSync(testFile);
    });

    test("should handle missing frontmatter gracefully", () => {
      const testFile = path.join(testDir, "no-frontmatter.mdx");
      const content = "Just content without frontmatter.";

      fs.writeFileSync(testFile, content);

      const result = processContentFile(testFile, "post");

      expect(result).toMatchObject({
        _type: "post",
        title: "Untitled",
      });

      // Clean up
      fs.unlinkSync(testFile);
    });
  });
});
