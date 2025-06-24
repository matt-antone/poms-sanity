# Tina CMS to Sanity CMS Migration Guide

This guide covers the complete migration process from Tina CMS to Sanity CMS, including content processing, asset migration, and data validation.

## Overview

The migration process consists of four main steps:

1. **Content Processing** - Convert MDX files to Sanity document format
2. **Asset Download** - Download and organize all media assets
3. **Migration Export** - Generate NDJSON format for Sanity CLI import
4. **Validation** - Verify migration data integrity

## Quick Start

### Option 1: Complete Workflow (Recommended)

Run the complete migration with a single command:

```bash
node run-migration.js
```

This will execute all migration steps in sequence and provide a comprehensive summary.

### Option 2: Individual Scripts

Run each step individually for more control:

```bash
# Step 1: Process content
node process-content.js

# Step 2: Download assets
node download-assets.js

# Step 3: Export migration data
node export-migration.js

# Step 4: Validate migration
node validate-migration.js
```

## Migration Scripts

### 1. Content Processing (`process-content.js`)

Converts MDX files from the source site to Sanity document format.

**Features:**

- Parses MDX frontmatter and content
- Converts to Portable Text blocks
- Handles different content types (posts, pages, people)
- Generates proper Sanity document structure
- Processes image references

**Usage:**

```bash
node process-content.js
```

**Output:**

- `data.ndjson` - Processed documents in NDJSON format
- Console summary of processed files

### 2. Asset Download (`download-assets.js`)

Scans content for asset URLs and downloads them locally.

**Features:**

- Scans all MDX files for image and file URLs
- Downloads assets to organized directories
- Generates asset metadata with Sanity-compatible IDs
- Handles various image formats and file types
- Provides detailed progress reporting

**Usage:**

```bash
node download-assets.js
```

**Output:**

- `images/` - Downloaded image files
- `files/` - Downloaded document files
- `assets.json` - Asset metadata and mappings

### 3. Migration Export (`export-migration.js`)

Combines processed content with asset metadata for final export.

**Features:**

- Loads processed content from previous steps
- Integrates asset references
- Converts to proper Sanity document format
- Generates NDJSON for CLI import
- Handles document relationships and references

**Usage:**

```bash
node export-migration.js
```

**Input:**

- `processed/` - Directory with processed content files
- `assets.json` - Asset metadata

**Output:**

- `data.ndjson` - Final migration data
- `assets.json` - Updated asset metadata

### 4. Validation (`validate-migration.js`)

Validates migration data for integrity and Sanity compatibility.

**Features:**

- Validates document structure and required fields
- Checks reference integrity
- Verifies asset references
- Validates NDJSON format
- Provides detailed error reporting

**Usage:**

```bash
node validate-migration.js
```

**Output:**

- Validation report with errors and warnings
- Summary of documents and assets
- Pass/fail status

## Complete Workflow (`run-migration.js`)

The complete workflow script orchestrates all migration steps:

**Features:**

- Runs all migration steps in sequence
- Provides progress reporting for each step
- Validates completion before proceeding
- Comprehensive error handling and troubleshooting
- Final summary with next steps

**Usage:**

```bash
# Basic usage
node run-migration.js

# With cleanup of intermediate files
node run-migration.js --cleanup

# Custom source directory
node run-migration.js --source ../custom-content

# Show help
node run-migration.js --help
```

## Configuration

### Source Directory Structure

The migration expects the following source structure:

```
poms2024/src/content/
├── blog/           # Blog posts
├── staff/          # Staff profiles
├── webinars/       # Webinar content
├── pages/          # Static pages
├── services/       # Service pages
├── about/          # About pages
└── media/          # Media content
```

### Output Structure

After migration, you'll have:

```
migration/
├── data.ndjson           # Final migration data
├── assets.json           # Asset metadata
├── images/               # Downloaded images
├── files/                # Downloaded files
├── processed/            # Intermediate processed content
└── MIGRATION-GUIDE.md    # This guide
```

## Content Type Mapping

The migration maps Tina CMS content types to Sanity document types:

| Source Type | Sanity Type | Description                         |
| ----------- | ----------- | ----------------------------------- |
| blog        | post        | Blog posts and articles             |
| staff       | person      | Staff profiles and bios             |
| webinars    | post        | Webinar content (with Vimeo blocks) |
| pages       | page        | Static pages                        |
| services    | page        | Service pages                       |
| about       | page        | About pages                         |
| media       | post        | Media content                       |

## Document Structure

### Post Documents

```json
{
  "_id": "post.abc123",
  "_type": "post",
  "title": "Post Title",
  "slug": { "_type": "slug", "current": "post-slug" },
  "publishedAt": "2023-12-25T10:30:00.000Z",
  "excerpt": "Post excerpt",
  "body": [
    /* Portable Text blocks */
  ],
  "author": { "_type": "reference", "_ref": "person.def456" },
  "category": { "_type": "reference", "_ref": "category.ghi789" }
}
```

### Person Documents

```json
{
  "_id": "person.abc123",
  "_type": "person",
  "name": "John Doe",
  "title": "Job Title",
  "bio": [
    /* Portable Text blocks */
  ],
  "image": {
    "_type": "image",
    "asset": { "_type": "reference", "_ref": "image.xyz789" }
  }
}
```

### Page Documents

```json
{
  "_id": "page.abc123",
  "_type": "page",
  "title": "Page Title",
  "slug": { "_type": "slug", "current": "page-slug" },
  "heading": "Page Heading",
  "description": [
    /* Portable Text blocks */
  ],
  "coverImage": {
    "_type": "image",
    "asset": { "_type": "reference", "_ref": "image.xyz789" }
  }
}
```

## Asset Handling

### Image Processing

- Downloads images from Cloudinary and other sources
- Generates SHA-1 hashes for consistent naming
- Creates Sanity-compatible asset references
- Maintains original file formats

### Asset References

```json
{
  "_type": "image",
  "asset": {
    "_type": "reference",
    "_ref": "image.sha1hash"
  },
  "alt": "Image description"
}
```

## Troubleshooting

### Common Issues

**Source directory not found**

```bash
Error: Source directory not found: /path/to/poms2024/src/content
```

- Verify the source path is correct
- Ensure the poms2024 directory exists
- Use `--source` flag to specify custom path

**Network errors during asset download**

```bash
Error: Failed to download https://example.com/image.jpg
```

- Check internet connectivity
- Verify asset URLs are accessible
- Some assets may have moved or been deleted

**Validation errors**

```bash
Migration validation FAILED with 5 errors
```

- Review validation output for specific errors
- Common issues: missing required fields, invalid references
- Fix source data or update schemas as needed

### Debug Mode

For detailed debugging, run individual scripts:

```bash
# Enable verbose logging
DEBUG=migration:* node process-content.js

# Check specific validation errors
node validate-migration.js | grep "ERROR"
```

## Next Steps

After successful migration:

1. **Set up Sanity project**

   ```bash
   npm install -g @sanity/cli
   sanity init
   ```

2. **Import data**

   ```bash
   sanity dataset import data.ndjson production
   ```

3. **Upload assets**

   - Use Sanity's asset upload API
   - Update asset references in documents
   - Verify images display correctly

4. **Test and validate**

   - Review content in Sanity Studio
   - Test frontend rendering
   - Verify all links and references work

5. **Deploy**
   - Deploy Sanity Studio
   - Update frontend to use Sanity data
   - Set up production environment

## Testing

The migration includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- __tests__/process-content.test.js
npm test -- __tests__/download-assets.test.js
npm test -- __tests__/export-migration.test.js
npm test -- __tests__/validate-migration.test.js
```

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review test output for specific errors
3. Examine individual script logs
4. Verify source data integrity

## Migration Checklist

- [ ] Source content directory exists and is accessible
- [ ] Network connectivity for asset downloads
- [ ] Sufficient disk space for downloaded assets
- [ ] Sanity project and dataset configured
- [ ] All migration scripts run successfully
- [ ] Validation passes without errors
- [ ] Test import on development dataset
- [ ] Verify content in Sanity Studio
- [ ] Assets display correctly
- [ ] All references and links work
- [ ] Production import completed
- [ ] Frontend updated to use Sanity data
