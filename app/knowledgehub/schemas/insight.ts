import { defineType } from 'sanity'
import FullHeightImageInput from '@/sanity/components/FullHeightImageInput'

export default defineType({
  name: 'insight',
  title: 'Insights',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      }
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Market Trends',
          'Industry Analysis',
          'Technology',
          'Sustainability',
          'Policy Updates',
          'Innovation'
        ]
      }
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    },
    {
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      components: {
        input: FullHeightImageInput,
      },
      options: {
        hotspot: true
      }
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      components: {
        input: FullHeightImageInput,
      },
      options: { hotspot: true },
      description: 'Optional hero image override for the detail page header.',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          components: {
            input: FullHeightImageInput,
          },
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (rule) => rule.required().warning('Add descriptive alt text for accessibility.'),
            },
            {
              name: 'fullWidth',
              title: 'Display Full Width',
              type: 'boolean',
              initialValue: false,
            },
          ],
        },
        {
          type: 'object',
          name: 'quote',
          title: 'Pull Quote',
          fields: [
            { name: 'quote', title: 'Quote', type: 'text', validation: (rule) => rule.required() },
            { name: 'attribution', title: 'Attribution', type: 'string' },
            { name: 'highlight', title: 'Highlight Style', type: 'boolean', initialValue: true },
          ],
        },
        {
          type: 'object',
          name: 'statHighlight',
          title: 'Stat Highlight',
          fields: [
            { name: 'value', title: 'Value', type: 'string', validation: (rule) => rule.required() },
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'context', title: 'Context', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'topics',
      title: 'Topics',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Used to generate related posts.',
    },
    {
      name: 'authors',
      title: 'Primary Authors',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'author' }, { type: 'expert' }],
          options: {
            disableNew: true,
          },
        },
      ],
      validation: (rule) => rule.min(1).warning('Add at least one author when available.'),
    },
    {
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'author' }, { type: 'expert' }],
          options: {
            disableNew: true,
          },
        },
      ],
    },
  ]
}) 
