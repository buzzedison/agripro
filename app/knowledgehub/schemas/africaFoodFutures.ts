import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'africaFoodFutures',
  title: 'Africa Food Futures Summit',
  type: 'document',
  fields: [
    // ── Hero ──────────────────────────────────────────────────────────────
    defineField({ name: 'heroTagline', title: 'Hero Tagline', type: 'string', description: 'Small badge above title e.g. "The Premier Global Gathering"' }),
    defineField({ name: 'heroTitle', title: 'Hero Title', type: 'string', description: 'e.g. "AFRICA FOOD FUTURES 2026."' }),
    defineField({ name: 'heroSubheading', title: 'Hero Subheading', type: 'text', rows: 2 }),
    defineField({ name: 'eventDates', title: 'Event Dates', type: 'string', description: 'e.g. "Oct 14-16, 2026"' }),
    defineField({ name: 'eventLocation', title: 'Event Location', type: 'string', description: 'e.g. "Kigali, Rwanda"' }),
    defineField({ name: 'heroImage', title: 'Hero Background Image', type: 'image', options: { hotspot: true } }),

    // ── Core Pillars ──────────────────────────────────────────────────────
    defineField({
      name: 'pillars',
      title: 'Core Pillars',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'description', title: 'Description', type: 'text', rows: 2 },
        ],
        preview: { select: { title: 'title' } },
      }],
    }),

    // ── Speakers / Tracks ─────────────────────────────────────────────────
    defineField({ name: 'speakerIntroText', title: 'Speaker Section Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'speakerTracks',
      title: 'Speaker Tracks',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of track categories e.g. "Policy & Governance"',
    }),

    // ── 3-Day Agenda ──────────────────────────────────────────────────────
    defineField({
      name: 'agendaDays',
      title: '3-Day Agenda',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'dayNumber', title: 'Day Number', type: 'string', description: 'e.g. "Day 01"' },
          { name: 'date', title: 'Date', type: 'string', description: 'e.g. "Oct 14"' },
          { name: 'theme', title: 'Theme / Title', type: 'string', description: 'e.g. "THE OPENING BELL"' },
          { name: 'description', title: 'Description', type: 'text', rows: 2 },
        ],
        preview: { select: { title: 'theme', subtitle: 'date' } },
      }],
    }),

    // ── Kigali Highlights ─────────────────────────────────────────────────
    defineField({ name: 'kigaliTagline', title: 'Kigali Tagline', type: 'string', description: 'e.g. "Silicon Valley of Africa"' }),
    defineField({
      name: 'kigaliFeatures',
      title: 'Kigali Feature Cards',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'description', title: 'Description', type: 'text', rows: 2 },
        ],
        preview: { select: { title: 'title' } },
      }],
    }),

    // ── Registration Tiers ────────────────────────────────────────────────
    defineField({
      name: 'registrationTiers',
      title: 'Registration Tiers',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Tier Name', type: 'string', description: 'e.g. "Delegate"' },
          { name: 'price', title: 'Price', type: 'string', description: 'e.g. "$499"' },
          { name: 'features', title: 'Included Features', type: 'array', of: [{ type: 'string' }] },
          { name: 'highlighted', title: 'Highlight this tier?', type: 'boolean', initialValue: false },
        ],
        preview: { select: { title: 'name', subtitle: 'price' } },
      }],
    }),

    // ── Get Involved / CTAs ───────────────────────────────────────────────
    defineField({
      name: 'getInvolvedRoles',
      title: 'Get Involved Roles',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Title', type: 'string', description: 'e.g. "Speak at Summit"' },
          { name: 'description', title: 'Description', type: 'text', rows: 2 },
          { name: 'ctaLabel', title: 'Button Label', type: 'string' },
          { name: 'formType', title: 'Form Type', type: 'string', description: 'e.g. "speaker", "partner", "sponsor", "exhibitor"' },
        ],
        preview: { select: { title: 'title' } },
      }],
    }),

    // ── Final CTA ─────────────────────────────────────────────────────────
    defineField({ name: 'finalCtaHeadline', title: 'Final CTA Headline', type: 'string' }),
    defineField({ name: 'footerNote', title: 'Footer Note', type: 'text', rows: 2 }),
  ],

  preview: {
    select: { title: 'heroTitle', subtitle: 'eventDates' },
  },
})
