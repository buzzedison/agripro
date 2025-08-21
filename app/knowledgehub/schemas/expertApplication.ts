import { defineType } from 'sanity'

export default defineType({
  name: 'expertApplication',
  title: 'Expert Applications',
  type: 'document',
  fields: [
    {
      name: 'applicantName',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string'
    },
    {
      name: 'professionalTitle',
      title: 'Current Professional Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'currentOrganization',
      title: 'Current Organization/Company',
      type: 'string'
    },
    {
      name: 'primaryExpertise',
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
          'Climate-Smart Agriculture',
          'Other (specify below)'
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'otherExpertise',
      title: 'Other Expertise (if selected "Other" above)',
      type: 'string'
    },
    {
      name: 'specializations',
      title: 'Additional Specializations',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List any additional areas of expertise'
    },
    {
      name: 'yearsOfExperience',
      title: 'Years of Professional Experience',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(50)
    },
    {
      name: 'education',
      title: 'Educational Background',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'degree',
          fields: [
            {
              name: 'degree',
              title: 'Degree/Qualification',
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
            },
            {
              name: 'fieldOfStudy',
              title: 'Field of Study',
              type: 'string'
            }
          ]
        }
      ],
      validation: Rule => Rule.required().min(1)
    },
    {
      name: 'certifications',
      title: 'Professional Certifications',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List relevant certifications, licenses, or professional memberships'
    },
    {
      name: 'workExperience',
      title: 'Work Experience Summary',
      type: 'text',
      rows: 6,
      description: 'Describe your relevant work experience and accomplishments',
      validation: Rule => Rule.required().min(200).max(1000)
    },
    {
      name: 'achievements',
      title: 'Key Achievements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Notable accomplishments, awards, or recognitions'
    },
    {
      name: 'whyJoin',
      title: 'Why do you want to join as an expert?',
      type: 'text',
      rows: 4,
      description: 'Explain your motivation for joining our expert network',
      validation: Rule => Rule.required().min(100).max(500)
    },
    {
      name: 'contributions',
      title: 'How can you contribute?',
      type: 'text',
      rows: 4,
      description: 'Describe how you plan to contribute to the agricultural community',
      validation: Rule => Rule.required().min(100).max(500)
    },
    {
      name: 'availabilityForConsulting',
      title: 'Available for Consulting',
      type: 'boolean',
      description: 'Are you interested in providing paid consulting services?'
    },
    {
      name: 'preferredEngagementTypes',
      title: 'Preferred Types of Engagement',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'One-time Consultation',
          'Ongoing Advisory',
          'Project-based Work',
          'Training & Workshops',
          'Farm Visits',
          'Remote Consultation',
          'Writing Articles/Content',
          'Speaking at Events'
        ]
      }
    },
    {
      name: 'languages',
      title: 'Languages Spoken',
      type: 'array',
      of: [{ type: 'string' }]
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
      name: 'socialProfiles',
      title: 'Social Media/Professional Profiles',
      type: 'object',
      fields: [
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
        },
        {
          name: 'researchGate',
          title: 'ResearchGate Profile',
          type: 'url'
        },
        {
          name: 'googleScholar',
          title: 'Google Scholar Profile',
          type: 'url'
        }
      ]
    },
    {
      name: 'portfolio',
      title: 'Portfolio/Work Samples',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'portfolioItem',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text'
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url'
            },
            {
              name: 'file',
              title: 'Upload File',
              type: 'file',
              description: 'Upload PDF, document, or image'
            }
          ]
        }
      ],
      description: 'Share examples of your work, publications, or projects'
    },
    {
      name: 'references',
      title: 'Professional References',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'professionalReference',
          fields: [
            {
              name: 'name',
              title: 'Reference Name',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'title',
              title: 'Title/Position',
              type: 'string'
            },
            {
              name: 'organization',
              title: 'Organization',
              type: 'string'
            },
            {
              name: 'email',
              title: 'Email',
              type: 'string',
              validation: Rule => Rule.email()
            },
            {
              name: 'phone',
              title: 'Phone',
              type: 'string'
            },
            {
              name: 'relationship',
              title: 'Relationship',
              type: 'string',
              description: 'How do you know this person?'
            }
          ]
        }
      ]
    },
    {
      name: 'profilePhoto',
      title: 'Profile Photo',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Professional headshot for your expert profile'
    },
    {
      name: 'resume',
      title: 'Resume/CV',
      type: 'file',
      options: {
        accept: '.pdf,.doc,.docx'
      },
      description: 'Upload your current resume or CV'
    },
    {
      name: 'additionalDocuments',
      title: 'Additional Documents',
      type: 'array',
      of: [
        {
          type: 'file',
          options: {
            accept: '.pdf,.doc,.docx,.jpg,.png'
          }
        }
      ],
      description: 'Upload any additional supporting documents'
    },
    {
      name: 'agreeToTerms',
      title: 'Agree to Terms and Conditions',
      type: 'boolean',
      validation: Rule => Rule.required().custom(value => value === true ? true : 'You must agree to the terms and conditions')
    },
    {
      name: 'applicationStatus',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          { title: 'Submitted', value: 'submitted' },
          { title: 'Under Review', value: 'under_review' },
          { title: 'Interview Scheduled', value: 'interview_scheduled' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Needs More Info', value: 'needs_more_info' }
        ]
      },
      initialValue: 'submitted',
      readOnly: ({ currentUser }) => !currentUser?.roles?.some(role => role.name === 'administrator')
    },
    {
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'text',
      description: 'Internal notes for the review process',
      readOnly: ({ currentUser }) => !currentUser?.roles?.some(role => role.name === 'administrator')
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true
    },
    {
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime',
      readOnly: ({ currentUser }) => !currentUser?.roles?.some(role => role.name === 'administrator')
    },
    {
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'string',
      readOnly: ({ currentUser }) => !currentUser?.roles?.some(role => role.name === 'administrator')
    }
  ],
  preview: {
    select: {
      title: 'applicantName',
      subtitle: 'primaryExpertise',
      media: 'profilePhoto',
      status: 'applicationStatus'
    },
    prepare({ title, subtitle, media, status }) {
      return {
        title: title || 'Unnamed Applicant',
        subtitle: `${subtitle || 'No expertise specified'} - ${status || 'submitted'}`,
        media: media
      }
    }
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'newestFirst',
      by: [{ field: 'submittedAt', direction: 'desc' }]
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'applicationStatus', direction: 'asc' }]
    }
  ]
}) 