# Tina CMS to Sanity Migration

This folder contains the migration data structured exactly like a Sanity dataset export, ready for import using `sanity dataset import`.

## Structure

The migration follows the exact format produced by `sanity dataset export`:

- `data.ndjson` - Contains all document data in newline-delimited JSON format
- `assets.json` - Contains all asset metadata (images, files)
- `images/` - Contains all image files referenced in the data
- `files/` - Contains all file assets (PDFs, etc.)

## Content Types Migrated

### Documents

- **Blog Posts** (`post`) - All blog articles from Tina CMS
- **Staff Profiles** (`person`) - Team member profiles
- **Services** (`page`) - Service pages and content
- **Webinars** (`page`) - Webinar content pages
- **Static Pages** (`page`) - About, contact, and other static pages
- **Settings** (`settings`) - Site configuration and navigation
- **Home** (`home`) - Homepage content

### Assets

- **Images** - All images from Cloudinary URLs converted to local files
- **Files** - PDFs and other documents

## Migration Process

1. **Content Extraction**: All MDX content has been parsed and converted to Sanity document format
2. **Asset Migration**: Cloudinary images downloaded and converted to local files
3. **Reference Mapping**: All internal references updated to use Sanity document IDs
4. **Schema Alignment**: Content structured to match target Sanity schema

## Import Instructions

```bash
# Navigate to the Sanity studio directory
cd studio

# Import the migration data
sanity dataset import ../migration production
```

## Notes

- All document IDs have been preserved where possible
- Image assets have been downloaded and converted to local files
- References between documents have been updated to use Sanity format
- Content structure matches the target Sanity schema exactly
