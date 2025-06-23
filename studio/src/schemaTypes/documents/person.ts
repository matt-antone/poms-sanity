// @ts-ignore: Sanity types are not available
import { UserIcon } from '@sanity/icons'
// @ts-ignore: Sanity types are not available
import { defineField, defineType } from 'sanity'

/**
 * Person schema.  Define and edit the fields for the 'person' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const person = defineType({
  name: 'person',
  title: 'Person',
  icon: UserIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      description: 'Professional title or position',
    }),
    defineField({
      name: 'position',
      title: 'Position',
      type: 'string',
      description: 'Alternative field for job title/position',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      description: 'Contact email address',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'Contact phone number',
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (rule: any) => {
            // Custom validation to ensure alt text is provided if the image is present. https://www.sanity.io/docs/validation
            return rule.custom((alt: any, context: any) => {
              if ((context.document?.image as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
      ],
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'blockContent',
      description: 'Professional biography or description',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        isUnique: (value: any, context: any) => context.defaultIsUnique(value, context),
      },
      validation: (rule: any) => rule.required(),
    }),
  ],
  // List preview configuration. https://www.sanity.io/docs/previews-list-views
  preview: {
    select: {
      name: 'name',
      title: 'title',
      image: 'image',
    },
    prepare(selection: any) {
      return {
        title: selection.name,
        subtitle: selection.title,
        media: selection.image,
      }
    },
  },
})
