/**
 * Migration Directory Structure Test Suite
 * Tests for task 1.1: Create migration directory structure with proper Sanity export format
 */

const fs = require("fs");
const path = require("path");

describe("Migration Directory Structure", () => {
  const migrationDir = path.join(__dirname, "..");

  describe("Required Directories", () => {
    const requiredDirs = ["images", "files"];

    requiredDirs.forEach((dirName) => {
      it(`should have ${dirName} directory`, () => {
        const dirPath = path.join(migrationDir, dirName);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });
  });

  describe("Required Files", () => {
    const requiredFiles = ["data.ndjson", "assets.json"];

    requiredFiles.forEach((fileName) => {
      it(`should have ${fileName} file`, () => {
        const filePath = path.join(migrationDir, fileName);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });
  });

  describe("Data File Format", () => {
    it("should have valid data.ndjson format", () => {
      const dataPath = path.join(migrationDir, "data.ndjson");
      const content = fs.readFileSync(dataPath, "utf8");

      // Should not be empty
      expect(content.trim()).toBeTruthy();

      // Should contain valid JSON lines (skip comment lines)
      const lines = content.trim().split("\n");
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          expect(() => JSON.parse(trimmedLine)).not.toThrow();
        }
      });
    });

    it("should have valid assets.json format", () => {
      const assetsPath = path.join(migrationDir, "assets.json");
      expect(fs.existsSync(assetsPath)).toBe(true);

      const content = fs.readFileSync(assetsPath, "utf8");
      const assets = JSON.parse(content);

      expect(assets).toHaveProperty("images");
      expect(assets).toHaveProperty("files");
      expect(assets).toHaveProperty("metadata");
      expect(Array.isArray(assets.images)).toBe(true);
      expect(Array.isArray(assets.files)).toBe(true);
      expect(typeof assets.metadata).toBe("object");
    });
  });

  describe("Directory Permissions", () => {
    it("should have writable directories", () => {
      const dirs = ["images", "files"];
      dirs.forEach((dirName) => {
        const dirPath = path.join(migrationDir, dirName);
        const stats = fs.statSync(dirPath);
        expect(stats.mode & 0o200).toBeTruthy(); // Check if writable
      });
    });
  });
});
