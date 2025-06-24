const fs = require("fs").promises;
const path = require("path");
const {
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
} = require("../validate-migration");

// Mock fs.promises
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn(),
  },
}));

describe("Migration Validation Script", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isValidISODate", () => {
    it("should validate correct ISO dates", () => {
      expect(isValidISODate("2023-12-25T10:30:00.000Z")).toBe(true);
      expect(isValidISODate("2023-01-01T00:00:00.000Z")).toBe(true);
    });

    it("should reject invalid dates", () => {
      expect(isValidISODate("2023-12-25")).toBe(false);
      expect(isValidISODate("invalid-date")).toBe(false);
      expect(isValidISODate("2023-13-01T00:00:00.000Z")).toBe(false);
    });
  });

  describe("loadNDJSONData", () => {
    it("should load and parse valid NDJSON data", async () => {
      const mockData = `{"_id":"test1","_type":"post","title":"Test"}
{"_id":"test2","_type":"person","name":"John"}`;

      fs.readFile.mockResolvedValue(mockData);

      const result = await loadNDJSONData();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ _id: "test1", _type: "post", title: "Test" });
      expect(result[1]).toEqual({
        _id: "test2",
        _type: "person",
        name: "John",
      });
    });

    it("should handle missing data file", async () => {
      fs.readFile.mockRejectedValue({ code: "ENOENT" });

      await expect(loadNDJSONData()).rejects.toThrow("Data file not found");
    });

    it("should handle invalid JSON", async () => {
      const mockData = `{"_id":"test1","_type":"post","title":"Test"}
{invalid json}`;

      fs.readFile.mockResolvedValue(mockData);

      await expect(loadNDJSONData()).rejects.toThrow("Invalid JSON on line 2");
    });
  });

  describe("loadAssetsData", () => {
    it("should load assets data", async () => {
      const mockAssets = {
        "https://example.com/image.jpg": { _id: "image.123" },
      };
      fs.readFile.mockResolvedValue(JSON.stringify(mockAssets));

      const result = await loadAssetsData();
      expect(result).toEqual(mockAssets);
    });

    it("should handle missing assets file", async () => {
      fs.readFile.mockRejectedValue({ code: "ENOENT" });

      const result = await loadAssetsData();
      expect(result).toEqual({});
    });

    it("should handle invalid JSON in assets file", async () => {
      fs.readFile.mockResolvedValue("invalid json");

      await expect(loadAssetsData()).rejects.toThrow(
        "Failed to load assets file"
      );
    });
  });

  describe("validateDocumentStructure", () => {
    it("should validate correct document structure", () => {
      const validDoc = {
        _id: "post.123",
        _type: "post",
        _createdAt: "2023-12-25T10:30:00.000Z",
        _updatedAt: "2023-12-25T10:30:00.000Z",
        _rev: "1",
        title: "Test Post",
        slug: {
          _type: "slug",
          current: "test-post",
        },
        publishedAt: "2023-12-25T10:30:00.000Z",
      };

      const errors = validateDocumentStructure(validDoc, 0);
      expect(errors).toHaveLength(0);
    });

    it("should detect missing required Sanity fields", () => {
      const invalidDoc = {
        title: "Test Post",
      };

      const errors = validateDocumentStructure(invalidDoc, 0);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((e) => e.includes("Missing required Sanity field"))
      ).toBe(true);
    });

    it("should detect invalid document type", () => {
      const invalidDoc = {
        _id: "invalid.123",
        _type: "invalid_type",
        _createdAt: "2023-12-25T10:30:00.000Z",
        _updatedAt: "2023-12-25T10:30:00.000Z",
        _rev: "1",
      };

      const errors = validateDocumentStructure(invalidDoc, 0);
      expect(errors.some((e) => e.includes("Invalid document type"))).toBe(
        true
      );
    });

    it("should detect invalid slug structure", () => {
      const invalidDoc = {
        _id: "post.123",
        _type: "post",
        _createdAt: "2023-12-25T10:30:00.000Z",
        _updatedAt: "2023-12-25T10:30:00.000Z",
        _rev: "1",
        title: "Test Post",
        slug: "invalid-slug-format",
        publishedAt: "2023-12-25T10:30:00.000Z",
      };

      const errors = validateDocumentStructure(invalidDoc, 0);
      expect(errors.some((e) => e.includes("Slug should be an object"))).toBe(
        true
      );
    });

    it("should detect invalid date formats", () => {
      const invalidDoc = {
        _id: "post.123",
        _type: "post",
        _createdAt: "invalid-date",
        _updatedAt: "2023-12-25T10:30:00.000Z",
        _rev: "1",
        title: "Test Post",
        slug: {
          _type: "slug",
          current: "test-post",
        },
        publishedAt: "2023-12-25T10:30:00.000Z",
      };

      const errors = validateDocumentStructure(invalidDoc, 0);
      expect(errors.some((e) => e.includes("Invalid date format"))).toBe(true);
    });
  });

  describe("findReferences", () => {
    it("should find reference objects", () => {
      const doc = {
        author: {
          _type: "reference",
          _ref: "person.123",
        },
        category: {
          _type: "reference",
          _ref: "category.456",
        },
      };

      const refs = findReferences(doc);
      expect(refs).toHaveLength(2);
      expect(refs.map((r) => r._ref)).toEqual(["person.123", "category.456"]);
    });

    it("should find nested references", () => {
      const doc = {
        body: [
          {
            _type: "block",
            children: [
              {
                _type: "span",
                marks: [],
                text: "Hello",
              },
            ],
          },
        ],
        relatedPosts: [
          {
            _type: "reference",
            _ref: "post.789",
          },
        ],
      };

      const refs = findReferences(doc);
      expect(refs).toHaveLength(1);
      expect(refs[0]._ref).toBe("post.789");
    });

    it("should handle documents with no references", () => {
      const doc = {
        _id: "post.123",
        title: "Test Post",
        body: "Some content",
      };

      const refs = findReferences(doc);
      expect(refs).toHaveLength(0);
    });
  });

  describe("findAssetReferences", () => {
    it("should find asset references", () => {
      const doc = {
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: "image.abc123",
          },
        },
        gallery: [
          {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: "image.def456",
            },
          },
        ],
      };

      const assetRefs = findAssetReferences(doc);
      expect(assetRefs).toHaveLength(2);
      expect(assetRefs.map((r) => r._ref)).toEqual([
        "image.abc123",
        "image.def456",
      ]);
    });

    it("should handle documents with no asset references", () => {
      const doc = {
        _id: "post.123",
        title: "Test Post",
        body: "Some content",
      };

      const assetRefs = findAssetReferences(doc);
      expect(assetRefs).toHaveLength(0);
    });
  });

  describe("validateReferences", () => {
    it("should validate existing references", () => {
      const documents = [
        {
          _id: "post.123",
          _type: "post",
          author: {
            _type: "reference",
            _ref: "person.456",
          },
        },
        {
          _id: "person.456",
          _type: "person",
          name: "John Doe",
        },
      ];

      const errors = validateReferences(documents);
      expect(errors).toHaveLength(0);
    });

    it("should detect missing reference targets", () => {
      const documents = [
        {
          _id: "post.123",
          _type: "post",
          author: {
            _type: "reference",
            _ref: "person.nonexistent",
          },
        },
      ];

      const errors = validateReferences(documents);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("Reference to non-existent document");
    });
  });

  describe("validateAssetReferences", () => {
    it("should validate existing asset references", async () => {
      const documents = [
        {
          _id: "post.123",
          image: {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: "image.abc123",
            },
          },
        },
      ];

      const assets = {
        "https://example.com/image.jpg": {
          _id: "image.abc123",
        },
      };

      const errors = await validateAssetReferences(documents, assets);
      expect(errors).toHaveLength(0);
    });

    it("should detect missing asset references", async () => {
      const documents = [
        {
          _id: "post.123",
          image: {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: "image.nonexistent",
            },
          },
        },
      ];

      const assets = {};

      const errors = await validateAssetReferences(documents, assets);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("Reference to non-existent asset");
    });
  });

  describe("validateAssetFiles", () => {
    it("should validate existing asset files", async () => {
      const assets = {
        "https://example.com/image.jpg": {
          _id: "image.abc123",
          localPath: "/path/to/image.jpg",
        },
      };

      fs.access.mockResolvedValue();

      const errors = await validateAssetFiles(assets);
      expect(errors).toHaveLength(0);
    });

    it("should detect missing asset files", async () => {
      const assets = {
        "https://example.com/image.jpg": {
          _id: "image.abc123",
          localPath: "/path/to/missing.jpg",
        },
      };

      fs.access.mockRejectedValue(new Error("File not found"));

      const errors = await validateAssetFiles(assets);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("Asset file not found");
    });

    it("should skip assets without local paths", async () => {
      const assets = {
        "https://example.com/image.jpg": {
          _id: "image.abc123",
          // no localPath
        },
      };

      const errors = await validateAssetFiles(assets);
      expect(errors).toHaveLength(0);
    });
  });

  describe("validateNDJSONFormat", () => {
    it("should validate unique document IDs", () => {
      const documents = [
        { _id: "post.123", _type: "post" },
        { _id: "post.456", _type: "post" },
      ];

      const errors = validateNDJSONFormat(documents);
      expect(errors).toHaveLength(0);
    });

    it("should detect duplicate document IDs", () => {
      const documents = [
        { _id: "post.123", _type: "post" },
        { _id: "post.123", _type: "post" },
      ];

      const errors = validateNDJSONFormat(documents);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("Duplicate document ID");
    });
  });

  describe("generateSummary", () => {
    it("should generate correct summary", () => {
      const documents = [
        { _type: "post" },
        { _type: "post" },
        { _type: "person" },
      ];

      const assets = {
        url1: { localPath: "/path1" },
        url2: {},
        url3: { localPath: "/path3" },
      };

      const errors = ["error1"];

      const summary = generateSummary(documents, assets, errors);

      expect(summary.documents.total).toBe(3);
      expect(summary.documents.byType.post).toBe(2);
      expect(summary.documents.byType.person).toBe(1);
      expect(summary.assets.total).toBe(3);
      expect(summary.assets.withLocalFiles).toBe(2);
      expect(summary.validation.errors).toBe(1);
      expect(summary.validation.status).toBe("FAIL");
    });

    it("should show PASS status with no errors", () => {
      const summary = generateSummary([], {}, []);
      expect(summary.validation.status).toBe("PASS");
    });
  });

  describe("validateMigration integration", () => {
    it("should handle successful validation", async () => {
      const mockNDJSON = `{"_id":"post.123","_type":"post","_createdAt":"2023-12-25T10:30:00.000Z","_updatedAt":"2023-12-25T10:30:00.000Z","_rev":"1","title":"Test","slug":{"_type":"slug","current":"test"},"publishedAt":"2023-12-25T10:30:00.000Z"}`;
      const mockAssets = {};

      fs.readFile
        .mockResolvedValueOnce(mockNDJSON)
        .mockResolvedValueOnce(JSON.stringify(mockAssets));

      const result = await validateMigration();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summary.documents.total).toBe(1);
    });

    it("should handle validation errors", async () => {
      const mockNDJSON = `{"_id":"invalid","title":"Test"}`;
      const mockAssets = {};

      fs.readFile
        .mockResolvedValueOnce(mockNDJSON)
        .mockResolvedValueOnce(JSON.stringify(mockAssets));

      const result = await validateMigration();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle missing data file", async () => {
      fs.readFile.mockRejectedValue({ code: "ENOENT" });

      await expect(validateMigration()).rejects.toThrow("Data file not found");
    });
  });
});
