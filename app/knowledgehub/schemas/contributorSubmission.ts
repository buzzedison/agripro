import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contributorSubmission',
  title: 'Contributor Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Working Title',
      validation: Rule => Rule.required().min(6).max(120),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Submitted', value: 'submitted' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'submissionType',
      type: 'string',
      title: 'Submission Type',
      options: {
        list: [
          { title: 'Insight Article', value: 'insight' },
          { title: 'Best Practice', value: 'bestPractice' },
          { title: 'Research Summary', value: 'research' },
          { title: 'Whitepaper', value: 'whitepaper' },
        ],
      },
      initialValue: 'insight',
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      title: 'Short Excerpt',
      validation: Rule => Rule.required().max(250),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            defineField({ name: 'fullWidth', type: 'boolean', title: 'Display Full Width' }),
          ],
        },
        {
          type: 'object',
          name: 'quote',
          title: 'Pull Quote',
          fields: [
            defineField({ name: 'quote', type: 'text', title: 'Quote', validation: Rule => Rule.required() }),
            defineField({ name: 'attribution', type: 'string', title: 'Attribution' }),
          ],
        },
        {
          type: 'object',
          name: 'statHighlight',
          title: 'Stat Highlight',
          fields: [
            defineField({ name: 'value', type: 'string', title: 'Value', validation: Rule => Rule.required() }),
            defineField({ name: 'label', type: 'string', title: 'Label' }),
            defineField({ name: 'context', type: 'text', title: 'Context' }),
          ],
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'contentSnapshot',
      type: 'text',
      title: 'Plain Text Snapshot',
      hidden: true,
    }),
    defineField({
      name: 'draftWordCount',
      type: 'number',
      title: 'Word Count (Draft)',
      hidden: true,
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'topics',
      type: 'array',
      title: 'Topics',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'submissionNotes',
      type: 'text',
      title: 'Note to Editors',
      rows: 3,
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Reviewer Notes',
      type: 'array',
      of: [
        defineField({
          type: 'object',
          name: 'note',
          fields: [
            defineField({
              name: 'createdAt',
              type: 'datetime',
              title: 'Created At',
              initialValue: () => new Date().toISOString(),
            }),
            defineField({ name: 'author', type: 'string', title: 'Reviewer' }),
            defineField({ name: 'message', type: 'text', title: 'Message', rows: 3, validation: Rule => Rule.required() }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'supabaseUserId',
      type: 'string',
      title: 'Supabase User ID',
      hidden: true,
    }),
    defineField({
      name: 'supabaseUserEmail',
      type: 'string',
      title: 'Contributor Email',
      readOnly: true,
    }),
    defineField({
      name: 'contributorName',
      type: 'string',
      title: 'Contributor Name',
      description: 'Display name for the contributor',
    }),
    defineField({
      name: 'primaryAuthor',
      type: 'reference',
      title: 'Primary Author',
      to: [{ type: 'author' }, { type: 'expert' }],
    }),
    defineField({
      name: 'coAuthors',
      type: 'array',
      title: 'Co-Authors',
      of: [{ type: 'reference', to: [{ type: 'author' }, { type: 'expert' }] }],
    }),
    defineField({
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted At',
    }),
    defineField({
      name: 'approvedAt',
      type: 'datetime',
      title: 'Approved At',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published At',
    }),
    defineField({
      name: 'linkedInsight',
      type: 'reference',
      title: 'Published Insight',
      to: [{ type: 'insight' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, status, media } = selection
      return {
        title,
        subtitle: status ? `Status: ${status}` : 'Status: draft',
        media,
      }
    },
  },
})

