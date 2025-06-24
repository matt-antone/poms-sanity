# Product Requirements Document: Tina CMS to Sanity CMS Migration

## Introduction/Overview

This document outlines the migration of a Next.js website from Tina CMS (using MDX format) to Sanity CMS. The source site is a professional services website for Poms Associates, featuring blog posts, webinars, staff profiles, services, and static pages. The migration will preserve all existing content while leveraging Sanity's advanced content management capabilities, real-time editing, and improved developer experience.

**Problem Statement:** The current Tina CMS setup uses MDX files stored in the repository, which limits collaboration, lacks real-time editing capabilities, and requires technical knowledge for content updates. The migration to Sanity CMS will provide a more user-friendly content management experience with visual editing, real-time collaboration, and better content organization.

**Goal:** Successfully migrate all content from Tina CMS MDX format to Sanity CMS while maintaining SEO, URL structure, and improving the content editing experience.

## Goals

1. **Content Preservation:** Migrate 100% of existing content (blog posts, webinars, staff profiles, services, pages) without data loss
2. **SEO Maintenance:** Preserve all existing URLs, meta tags, and structured data to maintain search engine rankings
3. **Enhanced Content Management:** Provide visual block-based editing and real-time collaboration capabilities
4. **Improved Performance:** Leverage Sanity's CDN and optimization features for better site performance
5. **Future-Proof Architecture:** Establish a scalable content management system for future growth
6. **User Experience:** Maintain or improve the current user experience while enhancing the content editing workflow

## User Stories

### Content Editors

- **As a content editor**, I want to edit content visually without touching code so that I can update the website efficiently
- **As a content editor**, I want to see real-time previews of my changes so that I can ensure content looks correct before publishing
- **As a content editor**, I want to collaborate with team members in real-time so that we can work together on content updates
- **As a content editor**, I want to manage media assets easily so that I can add and organize images and documents without technical knowledge

### Developers

- **As a developer**, I want a more robust content management system so that I can focus on building features rather than content management
- **As a developer**, I want better content versioning and rollback capabilities so that I can safely manage content changes
- **As a developer**, I want improved performance and caching so that the website loads faster for users

### Site Visitors

- **As a site visitor**, I want the website to load quickly so that I can access information efficiently
- **As a site visitor**, I want all existing content to remain accessible so that I can find the information I need
- **As a site visitor**, I want the same user experience so that I don't need to relearn how to navigate the site

## Migration Approach: Sanity CLI Dataset Import

### Overview

The migration will use Sanity's CLI dataset import/export functionality to ensure data integrity and proper format compliance. This approach involves creating a migration folder that exactly replicates the structure and format produced by `sanity dataset export`.

### Migration Structure

The migration folder will contain:

```
migration/
├── data.ndjson          # All document data in newline-delimited JSON format
├── assets.json          # All asset metadata (images, files)
├── images/              # All image files referenced in the data
├── files/               # All file assets (PDFs, etc.)
└── README.md           # Migration documentation
```

### Migration Process

1. **Content Extraction & Transformation**

   - Parse all MDX files from source site
   - Convert MDX content to Sanity document format
   - Map content types to Sanity schema types
   - Generate unique document IDs and references

2. **Asset Migration**

   - Download all images from Cloudinary URLs
   - Convert to local files with proper naming
   - Update all image references in content
   - Download and include PDF files and other assets

3. **Data Structure Creation**

   - Generate `data.ndjson` with all documents
   - Create `assets.json` with asset metadata
   - Ensure proper reference mapping between documents
   - Validate data format against Sanity requirements

4. **Import Process**
   - Use `sanity dataset import` command
   - Import into target Sanity project
   - Verify data integrity post-import
   - Test content rendering and functionality

### Technical Requirements

#### Data Format Compliance

- **Document Format:** Each line in `data.ndjson` must be valid JSON representing a Sanity document
- **Asset References:** All assets must use `_sanityAsset` format: `"image@file://./images/filename.jpg"`
- **Reference Format:** Internal references must use `_ref` and `_type: "reference"` format
- **Metadata:** All documents must include `_id`, `_type`, `_createdAt`, `_updatedAt`, and `_rev` fields

#### Sanity Import Best Practices

Based on [Sanity's official import documentation](https://www.sanity.io/docs/content-lake/importing-data), the following best practices must be followed:

**NDJSON Format Requirements:**

- **Newline-Delimited JSON:** Each document must be on a separate line in the `data.ndjson` file
- **Valid JSON per Line:** Each line must contain a complete, valid JSON object representing a Sanity document
- **No Line Breaks:** JSON objects must not contain actual line breaks within the document

**Asset Handling with \_sanityAsset:**

- **Image Assets:** Use `_sanityAsset: "image@file:///absolute/path/to/image.jpg"` format
- **File Assets:** Use `_sanityAsset: "file@file:///absolute/path/to/document.pdf"` format
- **HTTP URLs:** Use `_sanityAsset: "image@https://example.com/image.jpg"` for remote assets
- **Absolute Paths:** File URIs must be absolute paths, not relative paths
- **Asset Type Prefix:** Always prefix with `image@` or `file@` to specify asset type

**Import Command Usage:**

```bash
# Basic import
sanity dataset import data.ndjson <target-dataset>

# Import with options
sanity dataset import data.ndjson <target-dataset> --replace --allow-failing-assets

# Import compressed archive
sanity dataset import staging.tar.gz production
```

**Import Options:**

- **`--replace`:** Overwrite existing documents with same `_id`
- **`--missing`:** Only create documents that don't exist
- **`--allow-failing-assets`:** Continue import even if some assets are missing

**Reference Handling:**

- **Weak References:** During import, all references are automatically set to weak (`_weak: true`)
- **Strong References:** After all documents are imported, weak references are automatically flipped to strong
- **Import Order:** Documents can be imported in any order due to weak reference handling

**Asset File Organization:**

- **Images Directory:** Store all image files in `images/` directory
- **Files Directory:** Store all file assets (PDFs, etc.) in `files/` directory
- **File Naming:** Use asset `_id` as filename (without extension) for CLI compatibility
- **Directory Structure:** Match the structure expected by Sanity CLI import

**Pre-Import Considerations:**

- **Webhook Disabling:** Disable any webhooks that could cause high traffic during import
- **Rate Limiting:** Large imports may trigger API rate limits
- **Asset Availability:** Ensure all referenced assets are accessible at the specified paths
- **Dataset Backup:** Create backup of target dataset before import

**Post-Import Validation:**

- **Document Count:** Verify all expected documents were imported
- **Asset References:** Check that all asset references resolve correctly
- **Content Rendering:** Test that content displays properly in Sanity Studio
- **Reference Integrity:** Verify all document references are working correctly

#### Asset Handling

- **Image Files:** All images must be downloaded and stored locally in `images/` directory
- **File Assets:** PDFs and other files must be stored in `files/` directory
- **Naming Convention:** Files must use SHA1 hash-based naming for consistency
- **Metadata:** Each asset must have complete metadata in `assets.json`

#### Content Type Mapping

| Source Content Type | Sanity Document Type | Schema Location                                  |
| ------------------- | -------------------- | ------------------------------------------------ |
| Blog Posts          | `post`               | `studio/src/schemaTypes/documents/post.ts`       |
| Staff Profiles      | `person`             | `studio/src/schemaTypes/documents/person.ts`     |
| Services/Pages      | `page`               | `studio/src/schemaTypes/documents/page.ts`       |
| Webinars            | `page`               | `studio/src/schemaTypes/documents/page.ts`       |
| Settings            | `settings`           | `studio/src/schemaTypes/singletons/settings.tsx` |
| Home                | `home`               | `studio/src/schemaTypes/singletons/home.ts`      |

### Migration Scripts

#### Content Processing Script

```javascript
// migration/process-content.js
// - Parse MDX files from source site
// - Convert MDX content to Sanity document format
// - Generate unique document IDs and references
// - Map content types to Sanity schema types
```

#### Asset Download Script

```javascript
// migration/download-assets.js
// - Download all images from Cloudinary URLs
// - Convert to local files with SHA1 hash naming
// - Store files in images/ directory for CLI import
// - Generate asset metadata for assets.json
```

#### Migration Export Script

```javascript
// migration/export-migration.js
// - Generate data.ndjson with all documents in CLI format
// - Create assets.json with complete asset metadata
// - Ensure proper reference mapping between documents
// - Create migration folder structure for sanity dataset import
```

#### Migration Validation Script

```javascript
// migration/validate-migration.js
// - Validate all JSON documents against Sanity schema
// - Ensure all asset references use _sanityAsset format
// - Verify all internal references exist
// - Check data format compliance with Sanity CLI requirements
```

### Validation & Testing

#### Pre-Import Validation

- **Data Format:** Validate all JSON documents against Sanity schema
- **Asset References:** Ensure all asset references are valid
- **Document References:** Verify all internal references exist
- **Required Fields:** Check all required fields are present

#### Post-Import Testing

- **Content Rendering:** Test all content types render correctly
- **Asset Display:** Verify images and files display properly
- **Navigation:** Test all internal links and references
- **SEO Elements:** Verify meta tags and structured data

### Rollback Plan

- **Backup:** Create backup of target Sanity dataset before import
- **Incremental Import:** Import content in phases for easier rollback
- **Validation Points:** Test after each major content type import
- **Documentation:** Maintain detailed logs of all changes

## Frontend Design Replication Requirements

### Design Philosophy

The target website must replicate the visual design, layout, and user experience of the source site (poms2024) while using the organizational patterns and code structure of the target site (poms-sanity). This means:

- **Visual Design:** 100% replication of the source site's appearance, colors, typography, and layout
- **Code Organization:** Use the target site's component structure, file organization, and coding patterns
- **Functionality:** Maintain all existing functionality while improving the underlying architecture

### Source Site Design Analysis

#### Color Scheme and Typography

```css
/* Source site color variables to replicate */
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 247, 255, 255;
  --nav-item-color: 213, 42, 16;
  --nav-menu-bg-color: 252, 255, 255;
  --nav-menu-hover-color: 247, 247, 247;
  --theme-primary: 3, 98, 116; /* Teal blue */
  --theme-secondary: 210, 55, 39; /* Red orange */
  --theme-headings: var(--theme-primary);
  --theme-links: var(--theme-secondary);
}
```

#### Layout Components to Replicate

##### 1. **Header Component**

- **Source Pattern:** Fixed header with logo, main navigation, and mobile navigation
- **Key Features:**
  - Logo with dynamic sizing based on aspect ratio
  - Main navigation with dropdown menus
  - Mobile hamburger menu
  - Backdrop blur effect
  - Z-index layering for proper stacking
- **Target Implementation:** Update `nextjs-app/app/components/Header.tsx` to match source design

##### 2. **Footer Component**

- **Source Pattern:** Two-column layout with company info and navigation
- **Key Features:**
  - Company address and contact information
  - Navigation links (About, Our Team, Privacy)
  - Copyright notice with dynamic year
  - Responsive layout (stacked on mobile, side-by-side on desktop)
- **Target Implementation:** Update `nextjs-app/app/components/Footer.tsx` to match source design

##### 3. **Container Component**

- **Source Pattern:** Responsive container with specific max-widths and padding
- **Key Features:**
  - Max-width progression: 95% → md:2xl → lg:3xl → xl:4xl → 2xl:6xl
  - Horizontal padding: px-8 on mobile, removed on medium screens
  - Centered layout with mx-auto
- **Target Implementation:** Create or update container utility in target site

##### 4. **Title Component**

- **Source Pattern:** Page titles with breadcrumb navigation and structured data
- **Key Features:**
  - Large typography: text-4xl lg:text-6xl
  - Uppercase styling with bold font weight
  - Breadcrumb navigation with proper formatting
  - JSON-LD structured data for SEO
  - Responsive text truncation
- **Target Implementation:** Create `nextjs-app/app/components/Title.tsx` based on source

##### 5. **Layout Blocks**

- **Source Pattern:** Consistent spacing and layout patterns
- **Key Features:**
  - `.layout-block` class with py-8 md:py-12 spacing
  - `.page-title` class with mb-8 margin
  - Responsive padding and margins
- **Target Implementation:** Apply consistent layout classes throughout target site

#### Page-Specific Layouts to Replicate

##### 1. **Homepage Layout**

- **Source Pattern:** Block-based layout with hero, features, content sections
- **Key Features:**
  - Hero section with background elements
  - Icon grid for features/partners
  - Content blocks with proper spacing
  - Recent posts/events sections
- **Target Implementation:** Update `nextjs-app/app/page.tsx` to use Sanity blocks with source styling

##### 2. **Blog Post Layout**

- **Source Pattern:** Title, related people, content with floating image
- **Key Features:**
  - Title component with breadcrumbs
  - Related people component
  - Prose styling for content
  - Floating image overlay (Triangle component)
  - Proper z-index layering
- **Target Implementation:** Update `nextjs-app/app/blog/[slug]/page.tsx` to match source design

##### 3. **Webinar Layout**

- **Source Pattern:** Event-specific layout with date, registration, and video
- **Key Features:**
  - Event date display
  - Registration links
  - Vimeo video embedding
  - Event-specific metadata
- **Target Implementation:** Update `nextjs-app/app/webinars/[slug]/page.tsx` to match source design

##### 4. **Staff Profile Layout**

- **Source Pattern:** Profile-focused layout with image, bio, and contact info
- **Key Features:**
  - Profile image with proper sizing
  - Contact information display
  - Bio content with proper typography
  - Position and title display
- **Target Implementation:** Create staff profile pages with source styling

#### Component Replication Strategy

##### 1. **Navigation Components**

- **MainNavigation:** Replicate dropdown menu behavior and styling
- **MobileNavigation:** Replicate hamburger menu and mobile overlay
- **Breadcrumbs:** Replicate breadcrumb navigation with proper formatting

##### 2. **Content Components**

- **Prose:** Replicate typography styling for rich text content
- **RelatedPeople:** Replicate staff relationship display
- **Triangle:** Replicate floating image overlay effect
- **Logo:** Replicate logo display with proper sizing

##### 3. **Form Components**

- **ConsultationForm:** Replicate form styling and behavior
- **Button:** Replicate button styling with theme colors
- **FormButton:** Replicate CTA button styling

#### Styling Implementation Approach

##### 1. **Tailwind CSS Version Migration**

**Source Site:** Tailwind CSS v3.3.0 (older implementation)
**Target Site:** Tailwind CSS v4.1.5 (latest version)

**Key Differences to Address:**

###### **Syntax Changes**

```css
/* Source Site (v3.3.0) - OLD SYNTAX */
.container {
  @apply px-8 mde:px-0 w-full max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl mx-auto;
}

/* Target Site (v4.1.5) - NEW SYNTAX */
.container {
  @apply px-8 w-full max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl mx-auto;
  /* Note: 'mde:' breakpoint doesn't exist in v4, use 'md:' instead */
}
```

###### **Deprecated Features**

- **Custom Breakpoints:** Source uses `mde:` which doesn't exist in v4
- **Arbitrary Values:** Syntax may have changed for arbitrary values
- **CSS Variables:** Different approach to CSS custom properties
- **Plugin System:** Different plugin configuration syntax

###### **Migration Strategy**

1. **Audit Source Classes:** Identify all Tailwind classes used in source
2. **Map to v4 Syntax:** Convert deprecated syntax to v4 equivalents
3. **Test Visual Consistency:** Ensure design matches after conversion
4. **Update Configuration:** Modify Tailwind config for v4 compatibility

##### 2. **CSS Variables Migration**

```css
/* Source site color variables to replicate */
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 247, 255, 255;
  --nav-item-color: 213, 42, 16;
  --nav-menu-bg-color: 252, 255, 255;
  --nav-menu-hover-color: 247, 247, 247;
  --theme-primary: 3, 98, 116; /* Teal blue */
  --theme-secondary: 210, 55, 39; /* Red orange */
  --theme-headings: var(--theme-primary);
  --theme-links: var(--theme-secondary);
}
```

##### 3. **Tailwind Configuration**

- **Colors:** Map source CSS variables to Tailwind color palette
- **Typography:** Configure font families and sizes to match source
- **Spacing:** Maintain source site's spacing scale
- **Components:** Create reusable component classes

##### 4. **Responsive Design**

- **Breakpoints:** Maintain source site's responsive breakpoints
- **Mobile-First:** Ensure mobile experience matches source
- **Desktop:** Maintain desktop layout and interactions

#### Tailwind CSS Migration Specifics

##### **Version-Specific Changes**

###### **1. Breakpoint System**

```css
/* Source Site (v3.3.0) */
.mde\:px-0 {
  /* Custom breakpoint 'mde' */
}

/* Target Site (v4.1.5) */
.md\:px-0 {
  /* Use standard 'md' breakpoint */
}
```

###### **2. Arbitrary Value Syntax**

```css
/* Source Site (v3.3.0) */
.max-w-\[95\%\] {
  /* Arbitrary percentage */
}

/* Target Site (v4.1.5) */
.max-w-\[95\%\] {
  /* Same syntax, but verify compatibility */
}
```

###### **3. CSS Custom Properties**

```css
/* Source Site (v3.3.0) */
.text-\[rgb\(var\(--theme-primary\)\)\] {
  /* RGB function with CSS vars */
}

/* Target Site (v4.1.5) */
.text-\[rgb\(var\(--theme-primary\)\)\] {
  /* Verify this still works */
}
```

##### **Migration Process**

###### **Phase 1: Class Audit**

1. **Extract All Classes:** Use tools to extract all Tailwind classes from source
2. **Identify Deprecated:** Mark classes that need v4 conversion
3. **Create Mapping:** Document old → new class mappings

###### **Phase 2: Configuration Update**

1. **Tailwind Config:** Update `tailwind.config.js` for v4 syntax
2. **Custom Properties:** Ensure CSS variables work with v4
3. **Plugin Compatibility:** Verify all plugins work with v4

###### **Phase 3: Component Migration**

1. **Update Components:** Convert each component to v4 syntax
2. **Visual Testing:** Compare before/after screenshots
3. **Responsive Testing:** Verify all breakpoints work correctly

###### **Phase 4: Optimization**

1. **Purge Unused:** Remove unused classes with v4 purge
2. **Performance:** Optimize CSS bundle size
3. **Validation:** Ensure no visual regressions

##### **Common Migration Patterns**

###### **Container Component Migration**

```tsx
// Source Site (v3.3.0)
const Container: React.FC<IContainerProps> = (props) => {
  return (
    <div
      className={`px-8 mde:px-0 w-full max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl mx-auto ${
        props.className || ""
      }`}
    >
      {props.children}
    </div>
  );
};

// Target Site (v4.1.5)
const Container: React.FC<IContainerProps> = (props) => {
  return (
    <div
      className={`px-8 w-full max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl mx-auto ${
        props.className || ""
      }`}
    >
      {props.children}
    </div>
  );
};
```

###### **Color System Migration**

```css
/* Source Site (v3.3.0) - globals.css */
:root {
  --theme-primary: 3, 98, 116;
  --theme-secondary: 210, 55, 39;
}

/* Target Site (v4.1.5) - tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        'theme-primary':'rgb(3,98,116)','theme-secondary': "rgb(210, 55, 39)";
      }
    }
  }
}
```

##### **Testing Strategy**

###### **Visual Regression Testing**

1. **Screenshot Comparison:** Compare source vs target screenshots
2. **Pixel-Perfect Matching:** Ensure exact visual replication
3. **Responsive Testing:** Test all breakpoints and screen sizes
4. **Interactive Testing:** Verify hover states and animations

###### **Performance Testing**

1. **CSS Bundle Size:** Ensure v4 doesn't increase bundle size
2. **Build Time:** Monitor build performance impact
3. **Runtime Performance:** Test page load and interaction performance

###### **Compatibility Testing**

1. **Browser Testing:** Test across all target browsers
2. **Device Testing:** Test on mobile and tablet devices
3. **Accessibility Testing:** Ensure WCAG compliance maintained

#### shadcn/ui Component Migration

##### **Version Differences**

**Source Site:** Custom components with basic styling (no formal shadcn/ui)
**Target Site:** Modern shadcn/ui v1.x with Radix UI primitives

**Key Differences:**

###### **Component Architecture**

```tsx
// Source Site - Custom Button Component
const Button = ({
  type,
  className = "",
  onClick = null,
  children = "Button",
}: any) => {
  return (
    <button
      type={type}
      className={`py-1 px-2 bg-secondary text-lg text-white ${className}`}
      onClick={onClick}
      aria-label={children}
    >
      {children}
    </button>
  );
};

// Target Site - shadcn/ui Button Component
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all...",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        // ... more variants
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        // ... more sizes
      },
    },
  }
);
```

###### **Styling Approach**

- **Source Site:** Direct Tailwind classes with custom CSS variables
- **Target Site:** Class Variance Authority (CVA) with design system tokens
- **Theme System:** Source uses custom CSS variables, target uses shadcn/ui theme system

##### **Migration Strategy**

###### **Phase 1: Component Analysis**

1. **Audit Source Components:** Identify all custom components that need migration
2. **Map to shadcn/ui:** Determine which shadcn/ui components can replace custom ones
3. **Custom Components:** Identify components that need custom implementation
4. **Styling Mapping:** Map source styling to shadcn/ui variants

###### **Phase 2: Component Migration**

1. **Button Components:** Migrate custom buttons to shadcn/ui Button with variants
2. **Form Components:** Migrate forms to shadcn/ui Form components
3. **Navigation:** Migrate navigation to shadcn/ui NavigationMenu
4. **Dialog/Modal:** Migrate modals to shadcn/ui Dialog
5. **Dropdown:** Migrate dropdowns to shadcn/ui DropdownMenu

###### **Phase 3: Styling Adaptation**

1. **Theme Integration:** Adapt source colors to shadcn/ui theme system
2. **Variant Creation:** Create custom variants to match source styling
3. **Responsive Design:** Ensure responsive behavior matches source
4. **Accessibility:** Maintain or improve accessibility standards

##### **Component Migration Patterns**

###### **Button Migration**

```tsx
// Source Site - Custom Button
<Button
  type="submit"
  className="bg-secondary text-white"
  onClick={handleSubmit}
>
  Submit Form
</Button>

// Target Site - shadcn/ui Button
<Button
  type="submit"
  variant="secondary"
  size="default"
  onClick={handleSubmit}
>
  Submit Form
</Button>
```

###### **Form Migration**

```tsx
// Source Site - Custom Form
<form className="space-y-4">
  <input
    type="text"
    className="w-full px-3 py-2 border rounded"
    placeholder="Enter name"
  />
  <Button type="submit">Submit</Button>
</form>

// Target Site - shadcn/ui Form
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

###### **Navigation Migration**

```tsx
// Source Site - Custom Navigation
<nav className="flex space-x-4">
  <Link href="/about" className="nav-item">About</Link>
  <Link href="/services" className="nav-item">Services</Link>
</nav>

// Target Site - shadcn/ui NavigationMenu
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>About</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink asChild>
          <Link href="/about">About Us</Link>
        </NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

##### **Theme System Migration**

###### **Color System Adaptation**

```tsx
// Source Site - CSS Variables
:root {
  --theme-primary: 3, 98, 116;
  --theme-secondary: 210, 55, 39;
}

// Target Site - shadcn/ui Theme
const theme = {
  colors: {
    primary: {
      DEFAULT: "rgb(3, 98, 116)",
      foreground: "rgb(255, 255, 255)",
    },
    secondary: {
      DEFAULT: "rgb(210, 55, 39)",
      foreground: "rgb(255, 255, 255)",
    },
  }
}
```

###### **Component Variants**

```tsx
// Custom Button Variants for Source Styling
const buttonVariants = cva("inline-flex items-center justify-center...", {
  variants: {
    variant: {
      // Match source site styling
      source: "py-1 px-2 bg-secondary text-lg text-white",
      // shadcn/ui variants
      default: "bg-primary text-primary-foreground...",
      secondary: "bg-secondary text-secondary-foreground...",
    },
  },
});
```

##### **Custom Component Preservation**

###### **Components to Keep Custom**

1. **Logo Component:** Maintain source site's logo implementation
2. **Triangle Component:** Keep floating image overlay effect
3. **Container Component:** Maintain source site's container system
4. **Title Component:** Keep breadcrumb and structured data functionality

###### **Components to Migrate to shadcn/ui**

1. **Button Components:** Migrate to shadcn/ui Button with custom variants
2. **Form Components:** Migrate to shadcn/ui Form with validation
3. **Navigation:** Migrate to shadcn/ui NavigationMenu
4. **Dialog/Modal:** Migrate to shadcn/ui Dialog
5. **Dropdown:** Migrate to shadcn/ui DropdownMenu

##### **Implementation Priority**

###### **Phase 1: Core UI Components**

1. **Button System:** Migrate all buttons to shadcn/ui with source styling
2. **Form System:** Migrate forms to shadcn/ui with validation
3. **Navigation:** Migrate navigation to shadcn/ui NavigationMenu
4. **Theme Setup:** Configure shadcn/ui theme to match source colors

###### **Phase 2: Advanced Components**

1. **Dialog/Modal:** Migrate modals and overlays
2. **Dropdown:** Migrate dropdown menus
3. **Select:** Migrate select components
4. **Carousel:** Migrate to shadcn/ui Carousel if applicable

###### **Phase 3: Custom Components**

1. **Logo:** Maintain custom implementation
2. **Triangle:** Keep custom floating image effect
3. **Container:** Maintain source container system
4. **Title:** Keep custom breadcrumb functionality

##### **Quality Assurance**

###### **Visual Consistency**

1. **Component Testing:** Test each migrated component against source
2. **Interaction Testing:** Verify all interactions work identically
3. **Responsive Testing:** Ensure responsive behavior matches source
4. **Accessibility Testing:** Maintain or improve accessibility

###### **Performance Impact**

1. **Bundle Size:** Monitor impact of shadcn/ui on bundle size
2. **Runtime Performance:** Test component rendering performance
3. **Build Time:** Monitor build time impact
4. **Tree Shaking:** Ensure unused components are properly tree-shaken

#### Visual Consistency Requirements

##### 1. **Typography**

- **Font Family:** Barlow (sans-serif) as used in source
- **Font Weights:** Maintain source site's font weight hierarchy
- **Text Sizes:** Replicate exact text sizing from source
- **Line Heights:** Maintain source site's line height ratios

##### 2. **Colors and Contrast**

- **Primary Colors:** Teal blue (#036274) and red orange (#d23727)
- **Text Colors:** Maintain source site's text color hierarchy
- **Background:** Replicate gradient background effect
- **Contrast:** Ensure accessibility standards are met

##### 3. **Spacing and Layout**

- **Container Widths:** Replicate source site's container max-widths
- **Padding/Margins:** Maintain source site's spacing patterns
- **Grid System:** Replicate source site's grid layouts
- **Component Spacing:** Maintain consistent spacing between components

##### 4. **Interactive Elements**

- **Hover States:** Replicate source site's hover effects
- **Focus States:** Maintain accessibility with proper focus indicators
- **Transitions:** Replicate source site's animation timing
- **Button Styles:** Maintain source site's button appearance

#### Tailwind CSS Class Replication Strategy

##### **Advantage: Both Sites Use Tailwind CSS**

Since both the source site (Tina CMS) and target site (Sanity CMS) use Tailwind CSS, we can achieve 1:1 visual replication by:

###### **1. Direct Class Mapping**

```tsx
// Source Site Classes → Target Site Classes
// Most classes can be copied directly with minimal changes

// Source: Container component
className =
  "px-8 mde:px-0 w-full max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl mx-auto";

// Target: Updated for Tailwind v4 (remove 'mde:' breakpoint)
className =
  "px-8 w-full max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl mx-auto";
```

###### **2. Color System Replication**

```css
/* Source Site CSS Variables → Target Site Tailwind Config */
:root {
  --theme-primary: 3, 98, 116; /* Teal blue */
  --theme-secondary: 210, 55, 39; /* Red orange */
}

/* Target Site: Add to tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        'theme-primary':'rgb(3,98,116)','theme-secondary': "rgb(210, 55, 39)";
      }
    }
  }
}
```

###### **3. Component Class Replication**

```tsx
// Source: Button component
className="py-1 px-2 bg-secondary text-lg text-white"

// Target: shadcn/ui Button with source styling
<Button
  variant="secondary"
  className="py-1 px-2 text-lg" // Override shadcn/ui defaults
>
  Submit
</Button>
```

###### **4. Layout Class Preservation**

```tsx
// Source: Layout blocks
className = "layout-block py-8 md:py-12";

// Target: Same classes work identically
className = "layout-block py-8 md:py-12";
```

##### **Migration Efficiency Benefits**

###### **1. Rapid Visual Replication**

- **Direct Copy:** Most Tailwind classes can be copied directly
- **Minimal Changes:** Only version-specific syntax updates needed
- **Consistent Results:** Tailwind ensures consistent rendering across sites

###### **2. Reduced Development Time**

- **No Custom CSS:** Leverage existing Tailwind utility classes
- **Responsive Design:** Tailwind's responsive prefixes work identically
- **Component Styling:** Use Tailwind classes in shadcn/ui components

###### **3. Maintainable Code**

- **Utility-First:** Consistent with both sites' design approach
- **No Custom CSS:** Reduces maintenance overhead
- **Design System:** Leverage Tailwind's design system consistency

##### **Implementation Strategy**

###### **Phase 1: Class Audit and Mapping**

1. **Extract Classes:** Document all Tailwind classes used in source site
2. **Version Mapping:** Map v3.3.0 classes to v4.1.5 equivalents
3. **Custom Properties:** Map CSS variables to Tailwind config
4. **Component Mapping:** Map source classes to target components

###### **Phase 2: Direct Replication**

1. **Container System:** Copy container classes with version updates
2. **Typography:** Replicate text sizing and spacing classes
3. **Colors:** Map color classes to new theme system
4. **Layout:** Copy layout and spacing classes

###### **Phase 3: Component Integration**

1. **shadcn/ui Overrides:** Use Tailwind classes to override shadcn/ui defaults
2. **Custom Variants:** Create custom variants for source-specific styling
3. **Responsive Design:** Ensure responsive classes work correctly
4. **Interactive States:** Replicate hover, focus, and transition classes

##### **Quality Assurance**

###### **Visual Comparison**

- **Class Verification:** Ensure all source classes are properly mapped
- **Responsive Testing:** Verify responsive behavior matches source
- **Color Accuracy:** Confirm color values match exactly
- **Typography Matching:** Verify font sizes and spacing

###### **Performance Optimization**

- **Class Purging:** Ensure unused classes are removed
- **Bundle Size:** Monitor impact of additional classes
- **Build Time:** Optimize Tailwind compilation

## Technical Architecture

### Current Architecture (Tina CMS)

```
Source Site (poms2024/)
├── src/content/
│   ├── blog/ (12+ MDX files)
│   ├── webinars/ (80+ MDX files)
│   ├── staff/ (25+ MDX files)
│   ├── services/ (MDX files)
│   ├── pages/ (MDX files)
│   └── settings/ (JSON files)
├── src/schema/ (Tina CMS schemas)
├── src/components/ (React components)
└── src/app/ (Next.js pages)
```

### Target Architecture (Sanity CMS)

```
Current Project (poms-sanity/)
├── studio/ (Sanity Studio)
│   ├── src/schemaTypes/
│   │   ├── documents/ (Post, Webinar, Staff, etc.)
│   │   ├── blocks/ (Vimeo, ImageGrid, etc.)
│   │   └── objects/ (BlockContent, etc.)
│   └── src/components/ (Custom Studio components)
├── nextjs-app/ (Next.js frontend)
│   ├── app/ (Pages and components)
│   ├── sanity/lib/ (GROQ queries and client)
│   └── components/blocks/ (Block components)
└── scripts/ (Migration tools)
```

### Data Flow Architecture

1. **Content Creation:** Sanity Studio → Sanity Dataset
2. **Content Delivery:** Sanity Dataset → GROQ Queries → Next.js Pages
3. **Real-time Updates:** Sanity Real-time API → Next.js Live Preview
4. **Asset Management:** Sanity Asset Pipeline → Optimized Images

### Integration Points

- **Algolia Search:** Sanity webhooks → Algolia indexing
- **Cloudinary Migration:** Cloudinary URLs → Sanity Assets
- **SEO Integration:** Sanity metadata → Next.js meta tags
- **Analytics:** Existing analytics → Enhanced with Sanity data

## Data Mapping and Schema Design

### Content Type Mapping

#### Blog Posts

```
Tina MDX → Sanity Document
├── frontmatter.title → title (string, required)
├── frontmatter.metaTitle → metaTitle (string)
├── frontmatter.date → publishedAt (datetime)
├── frontmatter.expiration → expirationDate (datetime)
├── frontmatter.description → excerpt (text)
├── frontmatter.image → mainImage (image)
├── frontmatter.category → category (reference)
├── frontmatter.floatImage → floatImage (image)
├── content → body (portableText)
└── slug → slug (slug, auto-generated)
```

#### Webinars

```
Tina MDX → Sanity Document
├── frontmatter.title → title (string, required)
├── frontmatter.startDate → startDate (datetime)
├── frontmatter.endDate → endDate (datetime)
├── frontmatter.registration → registrationUrl (url)
├── frontmatter.expiration → expirationDate (datetime)
├── frontmatter.description → excerpt (text)
├── frontmatter.image → mainImage (image)
├── content → body (portableText)
└── slug → slug (slug, auto-generated)
```

#### Staff Profiles

```
Tina MDX → Sanity Document
├── frontmatter.name → name (string, required)
├── frontmatter.title → title (string)
├── frontmatter.email → email (email)
├── frontmatter.phone → phone (string)
├── frontmatter.image → image (image)
├── frontmatter.bio → bio (portableText)
├── frontmatter.position → position (string)
└── slug → slug (slug, auto-generated)
```

### Block Component Mapping

#### Vimeo Block (New)

```typescript
interface VimeoBlock {
  _type: "vimeoBlock";
  url: string; // Required
  vimeoId?: string; // Auto-extracted from URL
  aspectRatio?: "16:9" | "4:3" | "1:1";
  autoplay?: boolean;
  controls?: boolean;
  responsive?: boolean;
  className?: string; // Tailwind classes
}
```

#### ImageGrid Block (Existing)

```typescript
interface ImageGridBlock {
  _type: "imageGridBlock";
  title?: string;
  columns: 2 | 3 | 4 | 5 | 6;
  images: {
    image: SanityImageAsset;
    alt: string;
    link?: string;
  }[];
}
```

#### Testimonial Block (Existing)

```typescript
interface TestimonialBlock {
  _type: "testimonialBlock";
  quote: string;
  authorName: string;
  authorImage?: SanityImageAsset;
  authorTitle?: string;
}
```

### Field Validation Rules

#### Required Fields

- **Blog Posts:** title, publishedAt, body
- **Webinars:** title, startDate, body
- **Staff:** name, title
- **All Documents:** slug (auto-generated)

#### Validation Patterns

- **Email:** Standard email validation
- **URL:** Valid URL format
- **Phone:** Optional phone number format
- **Date:** Valid date format with timezone support
- **Image:** Required alt text for accessibility

## Security and Access Control

### Sanity Studio Access

#### User Roles

- **Administrators:** Full access to all content and settings
- **Content Editors:** Access to create/edit content, limited settings access
- **Reviewers:** Read-only access with ability to request changes

#### Content Permissions

- **Blog Posts:** Editors can create/edit, admins can publish/delete
- **Webinars:** Editors can create/edit, admins can publish/delete
- **Staff Profiles:** Editors can create/edit, admins can publish/delete
- **Settings:** Admin-only access

### API Security

#### CORS Configuration

- **Allowed Origins:** Production domain, staging domain, localhost (development)
- **Allowed Methods:** GET, POST, PUT, DELETE (for admin operations)
- **Credentials:** Include for authenticated requests

#### Rate Limiting

- **Public API:** 1000 requests per hour per IP
- **Studio API:** 10000 requests per hour per user
- **Webhook Endpoints:** 100 requests per minute

### Data Protection

#### Content Backup

- **Automated Backups:** Daily backups to Sanity's secure storage
- **Manual Backups:** Before major content changes
- **Rollback Capability:** 30-day retention of content versions

#### Privacy Compliance

- **GDPR Compliance:** Data export and deletion capabilities
- **Data Retention:** Configurable retention policies
- **Audit Logging:** Track all content changes and user actions

## Performance Optimization

### Caching Strategy

#### Next.js Caching

- **Static Generation:** All content pages with ISR (Incremental Static Regeneration)
- **Revalidation:** 1 hour for blog posts, 24 hours for static pages
- **Image Optimization:** Next.js Image component with Sanity image URLs

#### Sanity Caching

- **CDN Caching:** All assets cached on Sanity's global CDN
- **Query Caching:** GROQ query results cached for 5 minutes
- **Studio Caching:** Studio assets cached for 1 hour

### Image Optimization

#### Sanity Image Pipeline

- **Format Optimization:** Automatic WebP/AVIF conversion
- **Size Optimization:** Responsive image sizes (320px, 640px, 1280px, 1920px)
- **Quality Optimization:** 80% quality for optimal file size
- **Lazy Loading:** Automatic lazy loading for images below the fold

#### Migration Strategy

- **Cloudinary to Sanity:** Download and re-upload all images
- **Metadata Preservation:** Maintain alt text and image descriptions
- **URL Mapping:** Create redirect map for old Cloudinary URLs

### Query Optimization

#### GROQ Query Patterns

```groq
// Optimized blog post query
*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  publishedAt,
  excerpt,
  mainImage,
  body,
  "category": category->title,
  "author": author->name
}
```

#### Indexing Strategy

- **Slug Indexing:** All documents indexed by slug for fast lookups
- **Date Indexing:** Blog posts and webinars indexed by date
- **Category Indexing:** Content indexed by category for filtering

## Migration Strategy and Tools

### Automated Migration Pipeline

#### Phase 1: Content Analysis

```javascript
// Analyze MDX files and extract metadata
const analyzeContent = async (contentPath) => {
  const files = await glob(`${contentPath}/**/*.mdx`);
  const analysis = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, "utf8");
      const { data, content: mdxContent } = matter(content);
      return {
        file,
        frontmatter: data,
        contentLength: mdxContent.length,
        hasComponents: /<[A-Z][a-zA-Z]*/.test(mdxContent),
      };
    })
  );
  return analysis;
};
```

#### Phase 2: Content Conversion

```javascript
// Convert MDX to Sanity documents
const convertToSanity = async (mdxFile, schema) => {
  const { data, content } = matter(mdxFile);
  const portableText = await mdxToPortableText(content);

  return {
    _type: schema,
    ...mapFrontmatter(data),
    body: portableText,
    slug: generateSlug(data.title),
  };
};
```

#### Phase 3: Asset Migration

```javascript
// Migrate Cloudinary images to Sanity
const migrateImages = async (cloudinaryUrl) => {
  const imageBuffer = await downloadImage(cloudinaryUrl);
  const sanityAsset = await sanityClient.assets.upload("image", imageBuffer);
  return sanityAsset._id;
};
```

### Validation and Testing

#### Data Validation

```javascript
// Validate migrated content
const validateMigration = async (originalData, migratedData) => {
  const validation = {
    contentPreserved: originalData.content === migratedData.body,
    metadataPreserved: compareMetadata(originalData.frontmatter, migratedData),
    imagesMigrated: await validateImages(
      originalData.images,
      migratedData.images
    ),
    relationshipsPreserved: validateRelationships(originalData, migratedData),
  };
  return validation;
};
```

#### Rollback Strategy

```javascript
// Rollback migration if issues detected
const rollbackMigration = async (backupData) => {
  await sanityClient.delete({
    query: '*[_type in ["post", "webinar", "staff", "service", "page"]]',
  });
  await restoreFromBackup(backupData);
};
```

## Content Editor Training and Documentation

### Sanity Studio Training

#### Basic Operations

- **Creating Content:** How to create new blog posts, webinars, staff profiles
- **Editing Content:** Using the visual editor and block components
- **Media Management:** Uploading and organizing images and documents
- **Publishing Workflow:** Draft, review, and publish process

#### Advanced Features

- **Block Components:** Using and customizing Vimeo, ImageGrid, and other blocks
- **Content Relationships:** Linking related content and managing references
- **SEO Management:** Setting meta titles, descriptions, and structured data
- **Content Validation:** Understanding required fields and validation rules

### Documentation Requirements

#### User Guides

- **Quick Start Guide:** Essential operations for new content editors
- **Block Reference:** Complete guide to all available block components
- **Troubleshooting Guide:** Common issues and solutions
- **Best Practices:** Content creation and management guidelines

#### Technical Documentation

- **Schema Reference:** Complete schema documentation for developers
- **API Documentation:** GROQ query examples and patterns
- **Migration Guide:** Technical details of the migration process
- **Performance Guidelines:** Optimization best practices

## Monitoring and Analytics

### Performance Monitoring

#### Key Metrics

- **Page Load Time:** Target < 2 seconds for all pages
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Build Time:** Target < 5 minutes for full site build
- **API Response Time:** Target < 500ms for GROQ queries

#### Monitoring Tools

- **Vercel Analytics:** Page performance and user experience metrics
- **Sanity Analytics:** Content creation and editing metrics
- **Custom Monitoring:** Error tracking and alerting

### Content Analytics

#### Usage Metrics

- **Content Creation:** Number of new posts, webinars, staff profiles
- **Editing Activity:** Most edited content types and blocks
- **User Adoption:** Content editor engagement and satisfaction
- **Performance Impact:** Build time and deployment frequency

#### SEO Monitoring

- **Search Rankings:** Track keyword positions before and after migration
- **Organic Traffic:** Monitor traffic patterns and identify issues
- **Technical SEO:** Core Web Vitals and page speed scores
- **Structured Data:** Validate schema markup and rich snippets

## Functional Requirements

### 1. Content Migration

1.1. The system must migrate all blog posts (12+ files) with their frontmatter metadata (title, metaTitle, date, expiration, description, image, category, floatImage)
1.2. The system must migrate all webinars (80+ files) with their event-specific metadata (startDate, endDate, registration links, expiration dates)
1.3. The system must migrate all staff profiles (25+ files) with contact information, positions, and profile images
1.4. The system must migrate all service pages with their content and metadata
1.5. The system must migrate all static pages including the homepage with its complex block structure
1.6. The system must preserve all MDX content including embedded React components (Vimeo, ImageGrid, BlockQuote, etc.)
1.7. The system must migrate all image assets from Cloudinary URLs to Sanity's asset management system

### 2. Schema Design

2.1. The system must create Sanity document types for: blog posts, webinars, staff profiles, services, pages, and settings
2.2. The system must implement block-based content editing for pages using Sanity's Portable Text
2.3. The system must support custom React components within content blocks
2.4. The system must maintain all existing metadata fields and relationships
2.5. The system must implement proper validation for required fields and data types

### 3. URL Structure Preservation

3.1. The system must maintain exact URL structure: `/blog/[slug]`, `/webinars/[slug]`, `/services/[slug]`, etc.
3.2. The system must implement proper slug generation based on titles
3.3. The system must handle redirects for any URL changes during migration
3.4. The system must maintain SEO-friendly URLs with proper canonical tags

### 4. Content Relationships

4.1. The system must preserve relationships between blog posts and staff members
4.2. The system must maintain category and tag organization
4.3. The system must support cross-references between content types
4.4. The system must implement proper navigation and menu structures

### 5. Media Management

5.1. The system must migrate all Cloudinary images to Sanity's asset management
5.2. The system must maintain image metadata (alt text, dimensions, etc.)
5.3. The system must support responsive image optimization
5.4. The system must handle document uploads (PDFs, etc.) for webinars

### 6. Search and Discovery

6.1. The system must maintain Algolia search integration
6.2. The system must preserve all searchable content and metadata
6.3. The system must support faceted search by categories, tags, and content types

### 7. Performance and SEO

7.1. The system must maintain or improve page load times
7.2. The system must preserve all existing meta tags and structured data
7.3. The system must implement proper caching strategies
7.4. The system must maintain sitemap generation

## Non-Goals (Out of Scope)

- **Complete UI Redesign:** The migration will maintain the existing design and user interface
- **New Content Types:** The migration will focus on existing content types, not adding new ones
- **Third-Party Integrations:** Existing integrations (Algolia, Cloudinary) will be maintained but not expanded
- **Mobile App Development:** The migration is focused on the web platform only
- **Advanced Analytics:** Basic analytics will be maintained, but advanced features are out of scope
- **E-commerce Features:** The site is informational and does not require e-commerce functionality

## Design Considerations

### Content Editor Experience

- Implement visual block-based editing similar to the current Sanity setup
- Provide real-time preview capabilities
- Support drag-and-drop content organization
- Maintain intuitive navigation within the CMS

### Content Structure

- Use Sanity's Portable Text for rich content editing
- Implement custom block components for specialized content (Vimeo embeds, image grids, etc.)
- Maintain the existing content hierarchy and relationships
- Support both simple and complex page layouts

### Media Handling

- Leverage Sanity's built-in image optimization
- Maintain responsive image support
- Preserve image metadata and alt text
- Support document uploads for webinar materials

## Technical Considerations

### Migration Strategy

- **Automated Migration Script:** Develop a Node.js script to convert MDX files to Sanity documents
- **Data Validation:** Implement comprehensive validation to ensure data integrity
- **Rollback Plan:** Maintain backup of original MDX files during migration
- **Incremental Migration:** Migrate content types in phases to minimize risk

### Sanity Schema Design

- Leverage existing Sanity schema patterns from the current project
- Implement proper field validation and relationships
- Use Sanity's reference fields for content relationships
- Support custom input components for specialized content

### Performance Optimization

- Implement proper GROQ queries for efficient data fetching
- Use Sanity's image URL builder for optimized images
- Leverage Next.js ISR for static generation
- Implement proper caching strategies

### SEO and Metadata

- Preserve all existing meta tags and structured data
- Maintain proper canonical URLs
- Implement dynamic meta tag generation
- Preserve existing sitemap structure

## Content Analysis: Required Sanity Block Equivalents

Based on analysis of the actual MDX content, the following blocks are actively used and require Sanity equivalents:

### **High Priority Blocks (Frequently Used)**

#### 1. **Vimeo Block** (Used in 60+ webinars)

- **Current Usage:** `<Vimeo url="https://vimeo.com/426336972" tailwindClasses="mx-auto" />`
- **Sanity Equivalent:** `vimeoBlock` (to be created)
- **Migration Strategy:** Create dedicated Vimeo block for Vimeo video embeds
- **Fields Needed:**
  - URL (required)
  - Optional CSS classes (tailwindClasses)
  - Responsive sizing options
  - Aspect ratio options (16:9, 4:3, etc.)
  - Autoplay settings
  - Loading behavior (lazy/eager)
- **Implementation Details:**
  - Extract Vimeo ID from URL (supports both full URLs and ID-only)
  - Use Vimeo's responsive embed iframe
  - Maintain existing styling and responsive behavior
  - Support for Vimeo's privacy settings and parameters

#### 2. **ImageGrid Block** (Used in homepage and about pages)

- **Current Usage:** `<ImageGrid title="Just Some of Our Partners" columns="4" images={[...]} />`
- **Sanity Equivalent:** `imageGridBlock` (already exists in current Sanity setup)
- **Migration Strategy:** Direct mapping to existing Sanity block
- **Fields Needed:** Title, columns (2-6), images array with alt text

#### 3. **BlockQuote Block** (Used in homepage testimonials)

- **Current Usage:** `<BlockQuote quote={...} authorName={...} />`
- **Sanity Equivalent:** `testimonialBlock` (already exists in current Sanity setup)
- **Migration Strategy:** Convert to testimonial block format
- **Fields Needed:** Quote text, author name, optional author image

#### 4. **FormButton Block** (Used in homepage CTA)

- **Current Usage:** `<FormButton buttonText="Request Free Consultation" form="consultation" />`
- **Sanity Equivalent:** `callToActionBlock` (already exists in current Sanity setup)
- **Migration Strategy:** Convert to CTA block with form integration
- **Fields Needed:** Button text, form type, styling options

#### 5. **ArrowImage Block** (Used in homepage grid)

- **Current Usage:** `<ArrowImage image={{...}} direction="right" />`
- **Sanity Equivalent:** `customImage` (already exists in current Sanity setup)
- **Migration Strategy:** Convert to custom image with directional styling
- **Fields Needed:** Image, direction (left/right), styling options

### **Page Templates Analysis**

#### **Homepage Template** (`homePage`)

- **Blocks Used:** Hero, IconGrid, Grid, GenericContent (2x), posts (2x)
- **Sanity Equivalents:**
  - Hero → `heroBlock` (exists)
  - IconGrid → `featuresBlock` (exists)
  - Grid → `bentoBlock` (exists)
  - GenericContent → `contentBlock` (exists)
  - posts → Custom query blocks for recent content

#### **Simple Page Template** (`simplePage`)

- **Usage:** Most static pages, service pages
- **Content:** Rich text with embedded components
- **Sanity Equivalent:** `contentBlock` with Portable Text

#### **Post Template** (`post`)

- **Usage:** All blog posts and media articles
- **Content:** Rich text with embedded components
- **Sanity Equivalent:** `contentBlock` with Portable Text

#### **Event Template** (`event`)

- **Usage:** All webinars
- **Content:** Rich text with Vimeo embeds
- **Sanity Equivalent:** `contentBlock` with Portable Text + Vimeo blocks

### **Migration Priority for Blocks**

#### **Phase 1: Core Content Blocks**

1. **Content Block** (Portable Text) - For all rich text content
2. **Vimeo Block** - For webinar videos (60+ instances) - **NEW BLOCK TO CREATE**
3. **ImageGrid Block** - For partner logos and image collections
4. **Testimonial Block** - For quotes and testimonials

#### **Phase 2: Layout Blocks**

1. **Hero Block** - For homepage hero section
2. **Features Block** - For icon grids and feature lists
3. **Bento Block** - For grid layouts
4. **Call to Action Block** - For form buttons and CTAs

#### **Phase 3: Specialized Blocks**

1. **Custom Image Block** - For ArrowImage and other specialized images
2. **Posts Block** - For recent content listings
3. **Logo Parade Block** - For partner logo displays

### **Block Migration Strategy**

#### **1. Content Preservation**

- Convert all MDX content to Sanity Portable Text
- Preserve embedded React components as custom blocks
- Maintain all styling and layout information

#### **2. Component Mapping**

- Map existing Tina components to Sanity blocks
- Create custom Sanity blocks for unique components
- Ensure visual consistency between old and new systems

#### **3. Data Structure**

- Maintain all existing metadata fields
- Preserve content relationships and references
- Ensure proper validation and required fields

#### **4. Styling and Layout**

- Preserve existing Tailwind CSS classes
- Maintain responsive design patterns
- Ensure consistent visual appearance

## Success Metrics

### Content Migration Success

- **100% Content Preservation:** All existing content successfully migrated without data loss
- **Zero Broken Links:** All internal and external links remain functional
- **Complete Media Migration:** All images and documents successfully transferred to Sanity

### Performance Metrics

- **Page Load Time:** Maintain or improve current page load times
- **Core Web Vitals:** Maintain or improve LCP, FID, and CLS scores
- **SEO Rankings:** Maintain existing search engine rankings

### User Experience Metrics

- **Content Editor Satisfaction:** Improved ease of use for content editors
- **Publishing Speed:** Reduced time to publish new content
- **Collaboration Efficiency:** Improved real-time collaboration capabilities

### Technical Metrics

- **Build Time:** Maintain or improve build performance
- **Deployment Success:** Zero deployment failures due to content issues
- **Error Rate:** Maintain low error rates in content delivery

## Open Questions

1. **Vimeo Block Implementation:** What specific Vimeo embed parameters should be supported (autoplay, controls, privacy settings, etc.)?
   - **Answer:** No autoplay, show controls only
2. **Form Integration:** How should the FormButton component be integrated with the existing consultation form system?
   - **Answer:** Not sure if needed to be added
3. **Content Validation:** What level of content validation should be implemented during migration?
   - **Answer:** 100% validation with detailed logging
4. **Rollback Strategy:** What is the preferred approach for rolling back if issues are discovered post-migration?
   - **Answer:** None - deploying to fresh account
5. **Training Requirements:** What training will be needed for content editors to use the new Sanity interface?
   - **Answer:** None - basic how-to's on all Sanity types only
6. **Performance Testing:** How should we measure and validate performance improvements?
   - **Answer:** No need
7. **SEO Monitoring:** What tools and metrics should we use to monitor SEO impact during and after migration?
   - **Answer:** Already implemented in source site, need 100% SEO coverage
8. **Content Approval Workflow:** Should we implement content approval workflows in Sanity, or maintain the current publishing process?
   - **Answer:** No approval workflow needed
9. **Backup Strategy:** How should we handle ongoing backups of Sanity content vs. the current Git-based approach?
   - **Answer:** No backups needed during migration
10. **Block Customization:** How much customization should be allowed for each block type in the Sanity Studio?
    - **Answer:** Reduce fields by eliminating unused fields from converted blocks

## Final Migration Specifications

### Content Priority Strategy

- **Migration Order:** Start with simplest content, then move to most critical content
- **Content Types Priority:** Staff profiles → Blog posts → Static pages → Webinars (with Vimeo blocks)
- **Rationale:** Build confidence with simple content before tackling complex Vimeo block implementation

### Vimeo Block Final Specifications

- **URL Support:** Both full URLs and ID-only inputs (e.g., `https://vimeo.com/426336972` or `426336972`)
- **Embed Parameters:** No autoplay, show controls only
- **Aspect Ratio:** Source block contains this information - extract from existing Vimeo components
- **Responsive Behavior:** Use source site's existing responsive behavior

### Content Relationships Implementation

- **Staff References:** Create reference field in blog posts pointing to staff documents
- **Category System:** Maintain existing category system (migrate as-is)
- **Cross-References:** Use Sanity reference mechanism

### Missing Content Types - Service Pages

- **Service Pages:** Create service document type in Sanity
- **Service Schema:** Include title, description, content, and metadata fields
- **Service Migration:** Migrate all service pages with their content and relationships
- **Service URLs:** Maintain existing service page URL structure

### URL Structure Preservation

- **URL Mapping:** Maintain exact URL structure from source site
- **Slug Generation:** Use source site's slug patterns
- **Redirect Strategy:** No redirects needed (fresh deployment)
- **SEO URLs:** Preserve all existing SEO-friendly URLs

### Media Migration Strategy

- **Cloudinary to Sanity:** Download all Cloudinary images and upload to Sanity
- **Image Metadata:** Preserve alt text, captions, and image descriptions
- **Image Optimization:** Use Sanity's image optimization pipeline
- **Image References:** Update all content to reference Sanity image assets

### ArrowImage Block Implementation

- **Block Type:** Create `arrowImageBlock` in Sanity
- **Fields:** Image, direction (left/right), styling options
- **Migration:** Convert existing ArrowImage components to Sanity blocks
- **Styling:** Maintain source site's directional styling

### Testing Strategy Clarification

- **Sample Testing:** Migrate 1-2 examples of each content type first
- **Validation:** Verify content, styling, and functionality
- **Full Migration:** Proceed with complete migration after validation
- **No Staging:** Direct deployment to production (manual control)

### Performance Validation Approach

- **Baseline:** Document current performance metrics
- **Post-Migration:** Compare performance after migration
- **Acceptance Criteria:** Maintain or improve Core Web Vitals
- **Monitoring:** Use existing performance monitoring tools

### SEO Coverage Definition

- **Meta Tags:** Preserve all existing meta titles, descriptions, and tags
- **Structured Data:** Maintain breadcrumb structured data
- **Canonical URLs:** Preserve canonical URL structure
- **Sitemap:** Maintain existing sitemap structure
- **Content Integrity:** Ensure all SEO-relevant content is preserved

### Migration Testing Strategy
