import { defineType } from 'sanity'

export default defineType({
  name: 'expert',
  title: 'Experts',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'title',
      title: 'Professional Title',
      type: 'string',
      description: 'e.g., Senior Agricultural Economist, Farm Management Specialist',
      validation: Rule => Rule.required()
    },
    {
      name: 'expertise',
      title: 'Primary Area of Expertise',
      type: 'string',
      options: {
        list: [
          'Agricultural Economics',
          'Crop Science',
          'Livestock Management',
          'AgTech & Innovation',
          'Sustainable Farming',
          'Market Analysis',
          'Soil Management',
          'Water Resource Management',
          'Organic Farming',
          'Farm Business Management',
          'Agricultural Policy',
          'Climate-Smart Agriculture'
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'specializations',
      title: 'Specializations',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Additional areas of expertise'
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 6,
      description: 'Professional background and experience',
      validation: Rule => Rule.required().min(100).max(800)
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'yearsOfExperience',
      title: 'Years of Experience',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(50)
    },
    {
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'degree',
          fields: [
            {
              name: 'degree',
              title: 'Degree',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'institution',
              title: 'Institution',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'year',
              title: 'Year Completed',
              type: 'number'
            }
          ]
        }
      ]
    },
    {
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Professional certifications and licenses'
    },
    {
      name: 'achievements',
      title: 'Key Achievements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Notable accomplishments and recognitions'
    },
    {
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Languages spoken'
    },
    {
      name: 'availableForConsulting',
      title: 'Available for Consulting',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'consultingRates',
      title: 'Consulting Information',
      type: 'object',
      fields: [
        {
          name: 'hourlyRate',
          title: 'Hourly Rate (USD)',
          type: 'number'
        },
        {
          name: 'minimumEngagement',
          title: 'Minimum Engagement',
          type: 'string',
          description: 'e.g., 2 hours, 1 day, 1 week'
        },
        {
          name: 'preferredEngagementTypes',
          title: 'Preferred Engagement Types',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              'One-time Consultation',
              'Ongoing Advisory',
              'Project-based Work',
              'Training & Workshops',
              'Farm Visits',
              'Remote Consultation'
            ]
          }
        }
      ]
    },
    {
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: Rule => Rule.required().email()
        },
        {
          name: 'phone',
          title: 'Phone Number',
          type: 'string'
        },
        {
          name: 'linkedin',
          title: 'LinkedIn Profile',
          type: 'url'
        },
        {
          name: 'twitter',
          title: 'Twitter Profile',
          type: 'url'
        },
        {
          name: 'website',
          title: 'Personal/Company Website',
          type: 'url'
        }
      ]
    },
    {
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {
          name: 'country',
          title: 'Country',
          type: 'string',
          validation: Rule => Rule.required()
        },
        {
          name: 'state',
          title: 'State/Province',
          type: 'string'
        },
        {
          name: 'city',
          title: 'City',
          type: 'string'
    }
  ]
    },
    {
      name: 'featured',
      title: 'Featured Expert',
      type: 'boolean',
      description: 'Show this expert prominently on the homepage',
      initialValue: false
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Inactive', value: 'inactive' },
          { title: 'Pending Review', value: 'pending' }
        ]
      },
      initialValue: 'active'
    },
    {
      name: 'joinedAt',
      title: 'Joined Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'image'
    }
  }
})
