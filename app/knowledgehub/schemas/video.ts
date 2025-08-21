import { defineType, defineField } from 'sanity'
// If you have @sanity/icons installed and configured, you can use an icon:
// import { PlayIcon } from '@sanity/icons'

export default defineType({
  name: 'video',
  title: 'Videos',
  type: 'document',
  // icon: PlayIcon, // Add a suitable icon if available
  fields: [
    defineField({
      name: 'title',
      title: 'Video Title',
      type: 'string',
      validation: Rule => Rule.required().min(5).max(150),
      description: 'The main title of the video.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'A unique identifier for the URL, generated from the title.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'A brief summary of the video content (around 150-300 characters recommended).',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Direct URL to the video (e.g., YouTube, Vimeo, or a .mp4 link).',
      validation: Rule => Rule.required().uri({
        scheme: ['http', 'https'],
        allowRelative: false,
      }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: {
        hotspot: true, // Enables smart cropping
      },
      description: 'A representative preview image for the video (e.g., 1280x720 pixels).',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Video duration in HH:MM:SS or MM:SS format (e.g., "15:32" or "01:10:45").',
      // Consider a validation pattern if strict format is needed: e.g. Rule.regex(/^(\d{2}:)?\d{2}:\d{2}$/)
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Tutorials & How-To', value: 'tutorials' },
          { title: 'Expert Interviews', value: 'interviews' },
          { title: 'Webinars & Workshops', value: 'webinars' },
          { title: 'Farm Tours & Showcases', value: 'farm-tours' },
          { title: 'Technology Demonstrations', value: 'tech-demos' },
          { title: 'Sustainable Practices', value: 'sustainable-practices' },
          { title: 'Market Insights', value: 'market-insights' },
          { title: 'Success Stories', value: 'success-stories' },
        ],
        layout: 'dropdown', // Using dropdown for a potentially long list
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags/Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Add relevant keywords to improve searchability (e.g., "organic farming", "irrigation").',
    }),
    defineField({
      name: 'presenter',
      title: 'Presenter / Speaker',
      type: 'string',
      description: 'Name of the primary person or organization presenting/featured in the video.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
      description: 'The date the video was made public or recorded.',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'thumbnail',
      videoUrl: 'videoUrl',
    },
    prepare(selection) {
      const { title, category, media, videoUrl } = selection
      const videoEmojis: { [key: string]: string } = {
        tutorials: '🛠️',
        interviews: '💬',
        webinars: '💻',
        'farm-tours': '🚜',
        'tech-demos': '💡',
        'sustainable-practices': '🌿',
        'market-insights': '📈',
        'success-stories': '🏆',
      }
      const emoji = category ? videoEmojis[category] || '▶️' : '▶️'
      return {
        title: `${emoji} ${title || 'Untitled Video'}`,
        subtitle: category ? `Category: ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}` : (videoUrl || 'No URL'),
        media: media, // Uses the thumbnail image
      }
    },
  },
})
