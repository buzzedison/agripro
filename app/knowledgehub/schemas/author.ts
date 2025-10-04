import { defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Authors',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    },
    {
      name: 'role',
      title: 'Role / Title',
      type: 'string',
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
    },
    {
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'expertProfile',
      title: 'Linked Expert Profile',
      type: 'reference',
      to: [{ type: 'expert' }],
      description: 'Optional link to an Expert profile to share data across the site.',
    },
    {
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
        { name: 'twitter', title: 'Twitter', type: 'url' },
        { name: 'website', title: 'Website', type: 'url' },
      ],
    },
    {
      name: 'featured',
      title: 'Featured Author',
      type: 'boolean',
      initialValue: false,
    },
  ],
})
