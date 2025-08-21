import { defineType } from 'sanity'

export default defineType({
  name: 'whitepaper',
  title: 'Whitepapers',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text'
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'downloadUrl',
      title: 'PDF Download URL',
      type: 'url'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Market Research',
          'Technical Analysis',
          'Industry Report',
          'Case Study',
          'Trend Analysis'
        ]
      }
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }
  ]
}) 