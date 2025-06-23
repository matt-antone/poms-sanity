/**
 * Sanity Schema Validation Test Suite
 * Tests for tasks 1.2-1.5: Schema creation and validation
 */

const fs = require('fs')
const path = require('path')

describe('Sanity Schema Validation', () => {
  const schemasDir = path.join(__dirname, '..', 'src', 'schemaTypes')

  describe('Vimeo Block Schema (1.2)', () => {
    it('should have vimeo-block.ts file', () => {
      const filePath = path.join(schemasDir, 'blocks', 'vimeo-block.ts')
      expect(fs.existsSync(filePath)).toBe(true)
    })

    it('should have valid vimeo block schema structure', () => {
      const filePath = path.join(schemasDir, 'blocks', 'vimeo-block.ts')
      const content = fs.readFileSync(filePath, 'utf8')

      // Should export a schema definition
      expect(content).toContain('export default')
      expect(content).toContain('defineField')

      // Should have required fields
      expect(content).toContain('vimeoId')
      expect(content).toContain('title')
      expect(content).toContain('description')
    })
  })

  describe('Arrow Image Block Schema (1.3)', () => {
    it('should have arrow-image-block.ts file', () => {
      const filePath = path.join(schemasDir, 'blocks', 'arrow-image-block.ts')
      expect(fs.existsSync(filePath)).toBe(true)
    })

    it('should have valid arrow image block schema structure', () => {
      const filePath = path.join(schemasDir, 'blocks', 'arrow-image-block.ts')
      const content = fs.readFileSync(filePath, 'utf8')

      // Should export a schema definition
      expect(content).toContain('export default')
      expect(content).toContain('defineField')

      // Should have required fields
      expect(content).toContain('image')
      expect(content).toContain('direction')
      expect(content).toContain('alt')
    })
  })

  describe('Post Schema (1.4)', () => {
    it('should have post.ts file with required fields', () => {
      const filePath = path.join(schemasDir, 'documents', 'post.ts')
      expect(fs.existsSync(filePath)).toBe(true)

      const content = fs.readFileSync(filePath, 'utf8')

      // Should have required fields for blog posts
      expect(content).toContain('title')
      expect(content).toContain('slug')
      expect(content).toContain('publishedAt')
      expect(content).toContain('body')
      expect(content).toContain('excerpt')
    })
  })

  describe('Person Schema (1.4)', () => {
    it('should have person.ts file with required fields', () => {
      const filePath = path.join(schemasDir, 'documents', 'person.ts')
      expect(fs.existsSync(filePath)).toBe(true)

      const content = fs.readFileSync(filePath, 'utf8')

      // Should have required fields for staff profiles
      expect(content).toContain('name')
      expect(content).toContain('slug')
      expect(content).toContain('title')
      expect(content).toContain('bio')
      expect(content).toContain('image')
    })
  })

  describe('Page Schema (1.4)', () => {
    it('should have page.ts file with required fields', () => {
      const filePath = path.join(schemasDir, 'documents', 'page.ts')
      expect(fs.existsSync(filePath)).toBe(true)

      const content = fs.readFileSync(filePath, 'utf8')

      // Should have required fields for pages
      expect(content).toContain('title')
      expect(content).toContain('slug')
      expect(content).toContain('description')
    })
  })

  describe('Schema Index Files (1.5)', () => {
    it('should have main schema index file', () => {
      const filePath = path.join(schemasDir, 'index.ts')
      expect(fs.existsSync(filePath)).toBe(true)
    })

    it('should have blocks index file', () => {
      const filePath = path.join(schemasDir, 'blocks', 'index.ts')
      expect(fs.existsSync(filePath)).toBe(true)
    })

    it('should export all schema types', () => {
      const indexPath = path.join(schemasDir, 'index.ts')
      const content = fs.readFileSync(indexPath, 'utf8')

      // Should export the main schema types
      expect(content).toContain('post')
      expect(content).toContain('person')
      expect(content).toContain('page')
      expect(content).toContain('category')
    })

    it('should export block schemas', () => {
      const blocksIndexPath = path.join(schemasDir, 'blocks', 'index.ts')
      const content = fs.readFileSync(blocksIndexPath, 'utf8')

      // Should export the new block schemas (using actual export names)
      expect(content).toContain('vimeo-block')
      expect(content).toContain('arrow-image-block')
    })
  })

  describe('Content Type Mapping Validation (1.5)', () => {
    it('should have category schema for content organization', () => {
      const filePath = path.join(schemasDir, 'documents', 'category.ts')
      expect(fs.existsSync(filePath)).toBe(true)

      const content = fs.readFileSync(filePath, 'utf8')
      expect(content).toContain('title')
      expect(content).toContain('slug')
      expect(content).toContain('description')
    })

    it('should have proper schema relationships', () => {
      // Check that posts can reference categories
      const postPath = path.join(schemasDir, 'documents', 'post.ts')
      const postContent = fs.readFileSync(postPath, 'utf8')
      expect(postContent).toContain('category')

      // Check that posts can reference authors (persons)
      expect(postContent).toContain('author')
    })
  })
})
