import { defineType } from 'sanity'

export default defineType({
  name: 'bestPractices',
  title: 'Best Practices',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'A brief overview of the best practice',
      validation: Rule => Rule.required().min(10).max(500)
    },
    {
      name: 'mainContent',
      title: 'Main Content',
      type: 'array',
      of: [
        { 
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
            {title: 'Code', value: 'code'}
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'}
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean'
                  }
                ]
              },
              {
                title: 'Highlight',
                name: 'highlight',
                type: 'object',
                fields: [
                  {
                    title: 'Highlight Color',
                    name: 'color',
                    type: 'string',
                    options: {
                      list: [
                        {title: 'Orange', value: 'orange'},
                        {title: 'Green', value: 'green'},
                        {title: 'Blue', value: 'blue'},
                        {title: 'Red', value: 'red'}
                      ]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            }
          ]
        },
        {
          type: 'file',
          name: 'pdfEmbed',
          title: 'PDF Document',
          options: {
            accept: '.pdf'
          },
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Document Title',
              validation: Rule => Rule.required()
            },
            {
              name: 'description',
              type: 'text',
              title: 'Document Description',
              validation: Rule => Rule.max(200)
            }
          ]
        },
        {
          type: 'object',
          name: 'callout',
          title: 'Callout Box',
          fields: [
            {
              name: 'type',
              title: 'Callout Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Info', value: 'info'},
                  {title: 'Warning', value: 'warning'},
                  {title: 'Success', value: 'success'},
                  {title: 'Error', value: 'error'},
                  {title: 'Tip', value: 'tip'}
                ]
              }
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string'
            },
            {
              name: 'content',
              title: 'Content',
              type: 'text'
            }
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type'
            },
            prepare({title, type}) {
              return {
                title: title || 'Callout',
                subtitle: type ? `${type.charAt(0).toUpperCase() + type.slice(1)} callout` : 'Callout'
              }
            }
          }
        }
      ]
    },
    {
      name: 'pdfAttachments',
      title: 'PDF Attachments',
      type: 'array',
      description: 'Upload PDF documents related to this best practice',
      of: [
        {
          type: 'file',
          options: {
            accept: '.pdf'
          },
          fields: [
            {
              name: 'title',
              title: 'Document Title',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: Rule => Rule.max(300)
            },
            {
              name: 'category',
              title: 'Document Category',
              type: 'string',
              options: {
                list: [
                  'Guide',
                  'Template',
                  'Research',
                  'Case Study',
                  'Manual',
                  'Report',
                  'Other'
                ]
              }
            }
          ]
        }
      ]
    },
    {
      name: 'resources',
      title: 'Additional Resources',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'resource',
          fields: [
            {
              name: 'title',
              title: 'Resource Title',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: Rule => Rule.required()
            },
            {
              name: 'type',
              title: 'Resource Type',
              type: 'string',
              options: {
                list: [
                  'PDF Document',
                  'Video',
                  'External Link',
                  'Case Study',
                  'Research Paper',
                  'Tool/Template'
                ]
              }
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: Rule => Rule.max(200)
            }
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type'
            },
            prepare({title, type}) {
              return {
                title: title || 'Resource',
                subtitle: type || 'Resource'
              }
            }
          }
        }
      ]
    },
    {
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'contributor',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string'
            },
            {
              name: 'role',
              title: 'Role',
              type: 'string'
            },
            {
              name: 'organization',
              title: 'Organization',
              type: 'string'
            },
            {
              name: 'image',
              title: 'Profile Image',
              type: 'image',
              options: {
                hotspot: true
              }
            }
          ]
        }
      ]
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Crop Management',
          'Livestock',
          'Sustainability',
          'Technology',
          'Business Operations',
          'Market Analysis'
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    },
    {
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime'
    }
  ]
})
