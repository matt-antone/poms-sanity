/**
 * Environment Variables Test Suite
 * Tests for task 1.8: Set up target site environment variables for Sanity integration
 */

describe("Environment Variables Configuration", () => {
  const requiredEnvVars = {
    // Sanity Configuration
    NEXT_PUBLIC_SANITY_PROJECT_ID: "string",
    NEXT_PUBLIC_SANITY_DATASET: "string",
    NEXT_PUBLIC_SANITY_API_VERSION: "string",
    NEXT_PUBLIC_SANITY_API_READ_TOKEN: "string",
    SANITY_API_TOKEN: "string",
    NEXT_PUBLIC_SITE_URL: "string",

    // Algolia Search
    ALGOLIA_SEARCH_ADMIN_KEY: "string",
    NEXT_PUBLIC_ALGOLIA_APP_ID: "string",
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: "string",

    // Supabase (if still needed)
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "string",
    NEXT_PUBLIC_SUPABASE_URL: "string",

    // Build Configuration
    ANALYZE: "string",
    NODE_VERSION: "string",

    // Vercel/Backup
    BACKUP_SECRET: "string",
  };

  const deprecatedEnvVars = [
    "CLOUDINARY_URL",
    "TINA_BRANCH",
    "TINA_SEARCH_TOKEN",
    "TINA_TOKEN",
  ];

  describe("Required Environment Variables", () => {
    Object.entries(requiredEnvVars).forEach(([varName, expectedType]) => {
      it(`should have ${varName} configured`, () => {
        const value = process.env[varName];
        expect(value).toBeDefined();
        expect(typeof value).toBe(expectedType);
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Deprecated Environment Variables", () => {
    deprecatedEnvVars.forEach((varName) => {
      it(`should NOT have ${varName} configured`, () => {
        const value = process.env[varName];
        expect(value).toBeUndefined();
      });
    });
  });

  describe("Sanity Configuration Validation", () => {
    it("should have valid Sanity project ID format", () => {
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      expect(projectId).toMatch(/^[a-z0-9]+$/);
      expect(projectId.length).toBeGreaterThan(0);
    });

    it("should have valid Sanity dataset name", () => {
      const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
      expect(["production", "development", "test"]).toContain(dataset);
    });

    it("should have correct Sanity API version", () => {
      const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
      expect(apiVersion).toBe("2024-10-28");
    });

    it("should have valid Sanity API tokens", () => {
      const readToken = process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN;
      const writeToken = process.env.SANITY_API_TOKEN;

      expect(readToken).toMatch(/^sk[a-zA-Z0-9]+$/);
      expect(writeToken).toMatch(/^sk[a-zA-Z0-9]+$/);
      expect(readToken).not.toBe(writeToken);
    });
  });

  describe("URL Configuration", () => {
    it("should have valid site URL format", () => {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      expect(siteUrl).toMatch(/^https?:\/\/.+/);
    });
  });

  describe("Algolia Configuration", () => {
    it("should have valid Algolia configuration", () => {
      const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
      const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
      const adminKey = process.env.ALGOLIA_SEARCH_ADMIN_KEY;

      expect(appId).toMatch(/^[A-Z0-9]+$/);
      expect(searchKey).toMatch(/^[a-f0-9]+$/);
      expect(adminKey).toMatch(/^[a-f0-9]+$/);
    });
  });
});
