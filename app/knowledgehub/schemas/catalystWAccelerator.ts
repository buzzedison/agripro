import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'catalystWAccelerator',
  title: 'Catalyst W Accelerator',
  type: 'document',
  fields: [
    // ── Hero ──────────────────────────────────────────────────────────────
    defineField({ name: 'heroBadge1', title: 'Hero Badge 1', type: 'string', description: 'e.g. "AgriPro Fellowship · Cohort 2"' }),
    defineField({ name: 'heroBadge2', title: 'Hero Badge 2', type: 'string', description: 'e.g. "Women Catalyst Track"' }),
    defineField({ name: 'heroHeadline', title: 'Hero Headline', type: 'string' }),
    defineField({ name: 'heroSubheading', title: 'Hero Subheading', type: 'text', rows: 3 }),
    defineField({ name: 'applyCtaLabel', title: 'Apply Button Label', type: 'string', initialValue: 'Apply now' }),
    defineField({ name: 'learnMoreCtaLabel', title: 'Learn More Button Label', type: 'string', initialValue: 'About Catalyst W' }),

    // ── Stats Strip ───────────────────────────────────────────────────────
    defineField({
      name: 'stats',
      title: 'Stats Strip',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'value', title: 'Value', type: 'string', description: 'e.g. "25–30"' },
          { name: 'label', title: 'Label', type: 'string', description: 'e.g. "Fellows"' },
        ],
        preview: { select: { title: 'value', subtitle: 'label' } },
      }],
    }),

    // ── Why Join / Differentiators ────────────────────────────────────────
    defineField({
      name: 'differentiators',
      title: 'Why Join — Key Benefits',
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

    // ── Roles ─────────────────────────────────────────────────────────────
    defineField({
      name: 'roles',
      title: 'Fellowship Roles',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Role Title', type: 'string' },
          { name: 'count', title: 'Number of Positions', type: 'string', description: 'e.g. "1" or "4–5"' },
          { name: 'hoursPerWeek', title: 'Hours / Week', type: 'string', description: 'e.g. "15–20 hrs/week"' },
          { name: 'region', title: 'Region', type: 'string', description: 'e.g. "Central — Remote"' },
          { name: 'tag', title: 'Tag Label', type: 'string', description: 'e.g. "Leadership", "Revenue-earning"' },
          { name: 'description', title: 'Short Description', type: 'text', rows: 2 },
          { name: 'responsibilities', title: 'Responsibilities', type: 'array', of: [{ type: 'string' }] },
        ],
        preview: { select: { title: 'title', subtitle: 'count' } },
      }],
    }),

    // ── Compensation ──────────────────────────────────────────────────────
    defineField({
      name: 'compensationItems',
      title: 'Compensation / Pay Structure',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Item Title', type: 'string', description: 'e.g. "Sponsorship revenue share"' },
          { name: 'description', title: 'Description', type: 'text', rows: 2 },
        ],
        preview: { select: { title: 'title' } },
      }],
    }),

    // ── Regions ───────────────────────────────────────────────────────────
    defineField({
      name: 'regions',
      title: 'Regions',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "West Africa", "East Africa", etc.',
    }),

    // ── Application CTA ───────────────────────────────────────────────────
    defineField({ name: 'applicationDeadline', title: 'Application Deadline', type: 'string', description: 'e.g. "Applications close June 30, 2026"' }),
    defineField({ name: 'applicationNote', title: 'Application Note', type: 'text', rows: 2, description: 'Small disclaimer or note below the apply form' }),
  ],

  preview: {
    select: { title: 'heroHeadline', subtitle: 'heroBadge1' },
    prepare({ title, subtitle }: { title: string; subtitle: string }) {
      return { title: title || 'Catalyst W Accelerator', subtitle }
    },
  },
})
