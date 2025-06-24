const fs = require("fs").promises;
const path = require("path");
const {
  exportMigration,
  convertToSanityDocument,
  generateDocumentId,
  generateNDJSON,
} = require("../export-migration");

// Mock fs.promises
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
  },
}));

describe("Export Migration Script", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateDocumentId", () => {
    it("should generate correct document ID", () => {
      expect(generateDocumentId("person", "john-doe")).toBe("person.john-doe");
      expect(generateDocumentId("blog", "my-post")).toBe("blog.my-post");
      expect(generateDocumentId("category", "insurance")).toBe(
        "category.insurance"
      );
    });
  });

  describe("generateNDJSON", () => {
    it("should generate valid NDJSON format", () => {
      const documents = [
        { _id: "1", name: "John" },
        { _id: "2", name: "Jane" },
      ];

      const result = generateNDJSON(documents);
      const lines = result.split("\n");

      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0])).toEqual({ _id: "1", name: "John" });
      expect(JSON.parse(lines[1])).toEqual({ _id: "2", name: "Jane" });
    });

    it("should handle empty documents array", () => {
      const result = generateNDJSON([]);
      expect(result).toBe("");
    });
  });

  describe("convertToSanityDocument", () => {
    const mockAssets = {
      "https://example.com/image.jpg": {
        _id: "image.abc123",
        url: "https://example.com/image.jpg",
        filename: "image.jpg",
      },
      "https://example.com/gallery1.jpg": {
        _id: "image.def456",
        url: "https://example.com/gallery1.jpg",
        filename: "gallery1.jpg",
      },
    };

    it("should convert basic content to Sanity document", () => {
      const content = {
        type: "person",
        slug: "john-doe",
        data: {
          name: "John Doe",
          title: "CEO",
          bio: "A great leader",
        },
      };

      const result = convertToSanityDocument(content, mockAssets);

      expect(result).toEqual({
        _id: "person.john-doe",
        _type: "person",
        _createdAt: expect.any(String),
        _updatedAt: expect.any(String),
        _rev: "1",
        name: "John Doe",
        title: "CEO",
        bio: "A great leader",
      });
    });

    it("should handle image references", () => {
      const content = {
        type: "blog",
        slug: "my-post",
        data: {
          title: "My Post",
          image: "https://example.com/image.jpg",
        },
      };

      const result = convertToSanityDocument(content, mockAssets);

      expect(result.image).toEqual({
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image.abc123",
        },
      });
    });

    it("should handle gallery images", () => {
      const content = {
        type: "blog",
        slug: "my-post",
        data: {
          title: "My Post",
          gallery: [
            "https://example.com/gallery1.jpg",
            "https://example.com/missing.jpg",
          ],
        },
      };

      const result = convertToSanityDocument(content, mockAssets);

      expect(result.gallery).toEqual([
        {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: "image.def456",
          },
        },
      ]);
    });

    it("should handle author references", () => {
      const content = {
        type: "blog",
        slug: "my-post",
        data: {
          title: "My Post",
          author: "john-doe",
        },
      };

      const result = convertToSanityDocument(content, mockAssets);

      expect(result.author).toEqual({
        _type: "reference",
        _ref: "person.john-doe",
      });
    });

    it("should handle category references", () => {
      const content = {
        type: "blog",
        slug: "my-post",
        data: {
          title: "My Post",
          category: "insurance",
        },
      };

      const result = convertToSanityDocument(content, mockAssets);

      expect(result.category).toEqual({
        _type: "reference",
        _ref: "category.insurance",
      });
    });

    it("should handle missing assets gracefully", () => {
      const content = {
        type: "blog",
        slug: "my-post",
        data: {
          title: "My Post",
          image: "https://example.com/missing.jpg",
        },
      };

      const result = convertToSanityDocument(content, mockAssets);

      expect(result.image).toBe("https://example.com/missing.jpg");
    });
  });

  describe("exportMigration", () => {
    const mockContent = [
      {
        type: "person",
        slug: "john-doe",
        data: {
          name: "John Doe",
          title: "CEO",
        },
      },
      {
        type: "blog",
        slug: "my-post",
        data: {
          title: "My Post",
          author: "john-doe",
        },
      },
    ];

    const mockAssets = {
      "https://example.com/image.jpg": {
        _id: "image.abc123",
        url: "https://example.com/image.jpg",
      },
    };

    it("should export migration successfully", async () => {
      // Mock readdir to return content files
      fs.readdir.mockResolvedValue([
        "person-john-doe.json",
        "blog-my-post.json",
      ]);

      // Mock readFile for content files
      fs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockContent[0]))
        .mockResolvedValueOnce(JSON.stringify(mockContent[1]))
        .mockResolvedValueOnce(JSON.stringify(mockAssets));

      const result = await exportMigration();

      expect(result).toEqual({
        documents: 2,
        assets: 1,
        outputFile: expect.stringContaining("data.ndjson"),
        assetsFile: expect.stringContaining("assets.json"),
      });

      expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });

    it("should handle missing processed directory", async () => {
      fs.readdir.mockRejectedValue({ code: "ENOENT" });
      fs.readFile.mockResolvedValue(
        JSON.stringify({
          "https://example.com/image1.jpg": { _id: "image.1" },
          "https://example.com/image2.jpg": { _id: "image.2" },
          "https://example.com/image3.jpg": { _id: "image.3" },
        })
      );

      const result = await exportMigration();

      expect(result.documents).toBe(0);
      expect(result.assets).toBe(3);
    });

    it("should handle missing assets file", async () => {
      // Create valid content for both files
      const validContent1 = {
        type: "person",
        slug: "john-doe",
        data: { name: "John Doe", title: "CEO" },
      };
      const validContent2 = {
        type: "blog",
        slug: "my-post",
        data: { title: "My Post", author: "john-doe" },
      };

      fs.readdir.mockResolvedValue([
        "person-john-doe.json",
        "blog-my-post.json",
      ]);
      fs.readFile
        .mockResolvedValueOnce(JSON.stringify(validContent1))
        .mockResolvedValueOnce(JSON.stringify(validContent2))
        .mockRejectedValue({ code: "ENOENT" });

      const result = await exportMigration();
      expect(result.documents).toBe(2);
      expect(result.assets).toBe(0);
    });

    it("should handle file read errors", async () => {
      const validContent = {
        type: "blog",
        slug: "my-post",
        data: { title: "My Post", author: "john-doe" },
      };

      fs.readdir.mockResolvedValue([
        "person-john-doe.json",
        "blog-my-post.json",
      ]);
      fs.readFile
        .mockRejectedValueOnce(new Error("Read error"))
        .mockResolvedValueOnce(JSON.stringify(validContent))
        .mockResolvedValueOnce(JSON.stringify(mockAssets));

      const result = await exportMigration();
      expect(result.documents).toBe(1);
    });

    it("should handle file write errors", async () => {
      fs.readdir.mockResolvedValue(["person-john-doe.json"]);
      fs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockContent[0]))
        .mockResolvedValueOnce(JSON.stringify(mockAssets));
      fs.writeFile.mockRejectedValueOnce(new Error("Write error"));

      await expect(exportMigration()).rejects.toThrow("Write error");
    });

    it("should filter out non-JSON files", async () => {
      // Create valid content for both JSON files
      const validContent1 = {
        type: "person",
        slug: "john-doe",
        data: { name: "John Doe", title: "CEO" },
      };
      const validContent2 = {
        type: "blog",
        slug: "my-post",
        data: { title: "My Post", author: "john-doe" },
      };

      fs.readdir.mockResolvedValue(["person.json", "invalid.txt", "blog.json"]);
      fs.readFile
        .mockResolvedValueOnce(JSON.stringify(validContent1))
        .mockResolvedValueOnce(JSON.stringify(validContent2))
        .mockResolvedValueOnce(JSON.stringify(mockAssets));

      const result = await exportMigration();
      expect(result.documents).toBe(2);
    });

    it("should handle invalid JSON files gracefully", async () => {
      fs.readdir.mockResolvedValue(["valid.json", "invalid.json"]);
      fs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockContent[0]))
        .mockImplementationOnce(() => {
          throw new Error("Invalid JSON");
        })
        .mockResolvedValueOnce(JSON.stringify(mockAssets));

      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const result = await exportMigration();
      expect(result.documents).toBe(1);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
