import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'vimeoBlock',
  title: 'Vimeo Video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Vimeo URL',
      type: 'url',
      validation: Rule => Rule.required().uri({ scheme: ['https'] })
    }),
    defineField({
      name: 'vimeoId',
      title: 'Vimeo ID (auto-extracted)',
      type: 'string',
      readOnly: true,
      description: 'Auto-extracted from the URL for reference.'
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          { title: '16:9', value: '16:9' },
          { title: '4:3', value: '4:3' },
          { title: '1:1', value: '1:1' }
        ],
        layout: 'radio'
      },
      initialValue: '16:9',
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: false,
      description: 'Should the video autoplay? (default: false)'
    }),
    defineField({
      name: 'controls',
      title: 'Show Controls',
      type: 'boolean',
      initialValue: true,
      description: 'Show player controls? (default: true)'
    }),
    defineField({
      name: 'responsive',
      title: 'Responsive',
      type: 'boolean',
      initialValue: true,
      description: 'Should the embed be responsive? (default: true)'
    }),
    defineField({
      name: 'className',
      title: 'Custom CSS Classes',
      type: 'string',
      description: 'Optional Tailwind CSS classes for custom styling.'
    })
  ],
  preview: {
    select: {
      url: 'url',
      aspectRatio: 'aspectRatio'
    },
    prepare(selection) {
      const { url, aspectRatio } = selection
      return {
        title: url ? `Vimeo: ${url}` : 'Vimeo Video',
        subtitle: aspectRatio ? `Aspect Ratio: ${aspectRatio}` : undefined
      }
    }
  }
}) 