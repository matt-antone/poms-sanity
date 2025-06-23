# Outstanding Questions for Tina CMS to Sanity CMS Migration

## 1. Technical Implementation Questions

### Vimeo Block Specifics

- **Embed Parameters:** What specific Vimeo embed parameters should be supported (autoplay, controls, privacy settings, etc.)?
  no autoplay, show controls. that's it
- **URL Parsing:** Should we support both full Vimeo URLs and ID-only inputs?
  either
- **Responsive Behavior:** What responsive sizing options are needed?
  this is already defined by the source site's blocks

### Form Integration

- **FormButton Component:** How should the FormButton component be integrated with the existing consultation form system?
  not sure it need to be added
- **Form Validation:** What validation rules should be applied to forms?
  validation rules are set by the source site
- **Form Submission:** How should form submissions be handled (email, webhook, etc.)?
  also handle the same way the source site is handling

### Content Relationships

- **Staff References:** How should blog posts reference staff members (authors)?
  let's create a staff type in Sanity for staff members
- **Category System:** Should we maintain the existing category system or implement a new taxonomy?
  try to migrate to the target site's use of taxonomy
- **Cross-References:** How should content cross-references be handled?
  use the sanity referece mechanism

## 2. Migration Strategy Questions

### Content Validation

- **Validation Level:** What level of content validation should be implemented during migration?
  100%
- **Data Quality:** How should we handle incomplete or malformed content?
  logs with detailed information
- **Required Fields:** Which fields should be required vs. optional?
  use the source site as reference. i will update as need post migration

### Rollback Strategy

- **Rollback Approach:** What is the preferred approach for rolling back if issues are discovered post-migration?
  none. we'll be deploying to a fresh account
- **Backup Frequency:** How often should backups be created during migration?
  0
- **Recovery Time:** What is the acceptable recovery time if rollback is needed?
  0

### Migration Phasing

- **Content Priority:** Which content types should be migrated first?
  simplest to most complex
- **Testing Strategy:** How should we test the migration before going live?
  i control the live switch, so no
- **Go-Live Strategy:** Should we migrate all content at once or in phases?
  all at once

## 3. Operational Questions

### Content Editor Training

- **Training Requirements:** What training will be needed for content editors to use the new Sanity interface?
  none
- **Training Timeline:** When should training be conducted relative to the migration?
  never
- **Training Materials:** What documentation and training materials are needed?
  basic how to's on all sanity types

### Content Approval Workflow

- **Approval Process:** Should we implement content approval workflows in Sanity, or maintain the current publishing process?4
  no
- **User Roles:** What specific permissions should different user roles have?
  none
- **Publishing Process:** How should the publishing workflow be structured?
  i will publish so no need

### Ongoing Maintenance

- **Backup Strategy:** How should we handle ongoing backups of Sanity content vs. the current Git-based approach?
- **Content Updates:** How should content updates be managed post-migration?
- **Version Control:** Should we maintain any form of version control for content?

## 4. Performance and SEO Questions

### Performance Testing

- **Performance Metrics:** How should we measure and validate performance improvements?
  no need
- **Baseline Metrics:** What are the current performance baselines to compare against?
  none
- **Acceptable Thresholds:** What are acceptable performance thresholds?
  none

### SEO Monitoring

- **SEO Tools:** What tools and metrics should we use to monitor SEO impact during and after migration?
  already implemented in source site
- **SEO Preservation:** How should we ensure all existing SEO elements are preserved?
  i need 100% coverage
- **Structured Data:** How should structured data be handled in the new system?
  no structured data except for breadcrumbs

## 5. Customization and Flexibility

### Block Customization

- **Customization Level:** How much customization should be allowed for each block type in the Sanity Studio?
  let's try to reduce the amount of fields for converted blocks by eliminating fields that are not used by any instance of the block in content
- **Editor Experience:** How should we balance flexibility with ease of use for content editors?
  yes
- **Template System:** Should we implement template systems for common content patterns?
  no

### Future Extensibility

- **New Content Types:** How should the system accommodate new content types in the future?
  normal sanity/nextjs workflows
- **Third-Party Integrations:** What third-party integrations should be planned for?
  none
- **Scalability:** How should the system scale as content volume grows?
  it won't ever get large enough to be a concern. but the plan is to reduce build time by only allow x number of static pages.

## 6. Business and Stakeholder Questions

### Timeline and Resources

- **Project Timeline:** Is the proposed 10-week timeline realistic given available resources?
  no. needs to be done in a week
- **Resource Allocation:** What team members and skills are needed for the migration?
  Matt
- **Budget Considerations:** Are there budget constraints that affect the migration approach?
  none

### Stakeholder Requirements

- **Content Editor Feedback:** What feedback have content editors provided about the current system?
  none. new system
- **Business Requirements:** Are there any business requirements that affect the migration approach?
  none
- **Success Criteria:** What are the specific success criteria for the migration?
  100% content retention, 1:1 match of front end look and feel.

1. Content Priority for Migration
   Which content type should we migrate first? (Blog posts, webinars, staff profiles, or static pages?)
   Should we start with the simplest content or the most critical content? (e.g., start with staff profiles vs. start with webinars that have Vimeo blocks)
   A: start with the simplest content or the most critical content

2. Vimeo Block Implementation Details
   Should the Vimeo block support both full URLs and ID-only inputs? (e.g., https://vimeo.com/426336972 vs. just 426336972)
   A: both
   What should be the default aspect ratio? (16:9, 4:3, or responsive?)
   A: the source block should have this information

3. Content Relationships
   How should we handle blog posts that reference staff members? (Create a reference field in blog posts pointing to staff documents?)
   A: yes. Create a reference field in blog posts pointing to staff documents.
   Should we maintain the existing category system or create a new taxonomy? (If new, what should the structure be?)
   maintain the existing category system

4. Migration Testing Strategy
   How should we validate the migration during the 1-week timeline? (Sample content first, then full migration?)
   A: sure
   What's the go-live strategy? (Deploy to staging first, or direct to production?)
   A: all go-live will be manual. no need for you to deploy

5. Resource Allocation
   Will you be working on this full-time for the week? (This affects how much we can accomplish)
   yes
   Do you have access to the source site's data for analysis? (This helps with accurate migration planning)
   yes /poms2024

6. Technical Dependencies
   Are there any specific Sanity Studio customizations needed? (Beyond the Vimeo block)
   you tell me
   Should we prioritize certain pages over others? (e.g., homepage and key landing pages first)
   no.

These are the final questions that could help us create the most efficient 1-week migration plan. The PRD is quite comprehensive, but these details would help us prioritize the work effectively within the tight timeline.
Would you like to address any of these, or do you feel the PRD is complete enough to proceed with the migration?
