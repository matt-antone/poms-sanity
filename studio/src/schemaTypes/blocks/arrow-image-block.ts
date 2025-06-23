// @ts-ignore: Sanity types are not available
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'arrowImageBlock',
  title: 'Arrow Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: (Rule: any) => Rule.required()
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
      description: 'Alternative text for accessibility.'
    }),
    defineField({
      name: 'direction',
      title: 'Arrow Direction',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' }
        ],
        layout: 'radio'
      },
      validation: (Rule: any) => Rule.required(),
      description: 'Direction the arrow points (left or right).'
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
      media: 'image',
      direction: 'direction',
      alt: 'alt'
    },
    prepare(selection: any) {
      const { media, direction, alt } = selection
      return {
        title: `Arrow Image (${direction || 'unset'})`,
        subtitle: alt,
        media
      }
    }
  }
}) 