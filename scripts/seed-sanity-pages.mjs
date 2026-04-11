/**
 * Seed script — seeds Africa Food Futures and Catalyst W Accelerator documents
 * into Sanity. Safe to run multiple times: uses createOrReplace with fixed _id.
 *
 * Run with:
 *   node scripts/seed-sanity-pages.mjs
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 's5evnoub',
  dataset: 'production',
  apiVersion: '2024-12-28',
  token: 'skDEzyecXO2jdjAogT02ocepcRctWKqCCLIf73AmSlnKBacRDvtcMS5YtYyJ9tJemj1A3tY47MZhMwjWKsRgHGdXcHruKrIT5ppeDwRtDrTxDcVkNZGQebQfdztugLWSrFvBbxjA0ixUdT9oPzE7mp6yi7A4XPDaOK0yQ4oLqOBmgSaVjyLE',
  useCdn: false,
});

// ─── Africa Food Futures ──────────────────────────────────────────────────────

const africaFoodFutures = {
  _id: 'africa-food-futures-2026',
  _type: 'africaFoodFutures',

  heroTagline: 'The Premier Global Gathering',
  heroTitle: 'AFRICA FOOD FUTURES 2026.',
  heroSubheading: 'Where Women, Capital, and Climate converge to redefine the $1 Trillion African agricultural legacy.',
  eventDates: 'Oct 14-16, 2026',
  eventLocation: 'Kigali, Rwanda',

  pillars: [
    {
      _key: 'pillar-1',
      title: 'The Gender Dividend',
      description: 'Unlocking the $100B financing gap for women-led agribusinesses.',
    },
    {
      _key: 'pillar-2',
      title: 'Capital Ecosystem',
      description: 'Direct matchmaking between Terranova LPs and post-revenue ventures.',
    },
    {
      _key: 'pillar-3',
      title: 'Climate Resilience',
      description: 'Scaling IoT and biological inputs for a sustainable future.',
    },
  ],

  speakerIntroText: 'We are curating 50+ world-class voices across policy, investment, climate, and agri-tech. Speaker announcements begin Q1 2026.',
  speakerTracks: [
    'Policy & Governance',
    'Investment & Capital',
    'Climate & AgriTech',
    'Women in Agriculture',
    'Trade & Markets',
    'Food Systems',
    'Youth & Innovation',
    'Global Partnerships',
  ],

  agendaDays: [
    {
      _key: 'day-1',
      dayNumber: 'Day 01',
      date: 'Oct 14',
      theme: 'THE OPENING BELL',
      description: "Gala reception followed by the 'State of the Harvest' address.",
    },
    {
      _key: 'day-2',
      dayNumber: 'Day 02',
      date: 'Oct 15',
      theme: 'CAPITAL & CLIMATE',
      description: 'Private investor roundtables, Tech Expo, Regional Policy Harmonization workshop.',
    },
    {
      _key: 'day-3',
      dayNumber: 'Day 03',
      date: 'Oct 16',
      theme: 'SHE HARVESTS GALA',
      description: 'Pan-African Pitch Perfect finals and Woman Farmer of the Year Awards.',
    },
  ],

  kigaliTagline: 'Silicon Valley of Africa',
  kigaliFeatures: [
    { _key: 'kf-1', title: '90-Day Visa Free', description: 'Most nationalities arrive visa-free or on arrival — zero friction for global delegates.' },
    { _key: 'kf-2', title: 'Luxury Logistics', description: 'World-class conference venues, 5-star hotels, and seamless airport transfers.' },
    { _key: 'kf-3', title: 'Sustainability First', description: "Africa's cleanest city — an aspirational backdrop for a food systems summit." },
    { _key: 'kf-4', title: 'Tech Ecosystem', description: 'Home to Africa\'s fastest-growing startup scene and digital agriculture innovators.' },
  ],

  registrationTiers: [
    {
      _key: 'tier-delegate',
      name: 'Delegate',
      price: '$499',
      highlighted: false,
      features: [
        'Full 3-day access',
        'All keynote sessions',
        'Networking events',
        'Summit materials',
        'Certificate of attendance',
      ],
    },
    {
      _key: 'tier-vip',
      name: 'Investor / VIP',
      price: '$1,499',
      highlighted: true,
      features: [
        'Everything in Delegate',
        'Private investor roundtables',
        'VIP gala dinner seat',
        'Priority speaker access',
        'Curated 1:1 matchmaking',
        'Premium lounge access',
      ],
    },
    {
      _key: 'tier-exhibitor',
      name: 'Exhibitor',
      price: '$2,999+',
      highlighted: false,
      features: [
        'Exhibition booth (6m²)',
        'Brand on all materials',
        '4 delegate passes',
        'Speaking opportunity',
        'Lead capture tools',
        'Post-event report',
      ],
    },
  ],

  getInvolvedRoles: [
    {
      _key: 'role-speaker',
      title: 'Speak at Summit',
      description: 'Share your expertise with 500+ agribusiness leaders, investors, and policymakers from across Africa and beyond.',
      ctaLabel: 'Apply to Speak',
      formType: 'speaker',
    },
    {
      _key: 'role-partner',
      title: 'Become a Partner',
      description: 'Strategic partnerships for development organisations, NGOs, and government agencies aligned with our mission.',
      ctaLabel: 'Partner With Us',
      formType: 'partner',
    },
    {
      _key: 'role-sponsor',
      title: 'Sponsor the Summit',
      description: 'Place your brand at the forefront of Africa\'s most important agribusiness gathering of 2026.',
      ctaLabel: 'Sponsor Now',
      formType: 'sponsor',
    },
    {
      _key: 'role-exhibitor',
      title: 'Exhibit Your Innovation',
      description: 'Showcase your products, technology, or services to a highly targeted audience of decision-makers.',
      ctaLabel: 'Book a Stand',
      formType: 'exhibitor',
    },
  ],

  finalCtaHeadline: 'THE FUTURE IS BEING WRITTEN.',
  footerNote: 'Africa Food Futures is the flagship convening of the AgriPro Hub, dedicated to the 2026 UN Year of the Woman Farmer.',
};

// ─── Catalyst W Accelerator ───────────────────────────────────────────────────

const catalystWAccelerator = {
  _id: 'catalyst-w-accelerator',
  _type: 'catalystWAccelerator',

  heroBadge1: 'AgriPro Fellowship · Cohort 2',
  heroBadge2: 'Women Catalyst Track',
  heroHeadline: "Help run Africa's next great accelerator.",
  heroSubheading: "We're building a 25–30 person distributed team to recruit, support, and accelerate 40 women-led agribusiness ventures across Africa. This isn't volunteering — it's a performance-based fellowship with real pay, real credentials, and a direct path to a full-time role.",
  applyCtaLabel: 'Apply now',
  learnMoreCtaLabel: 'About Catalyst W',
  applicationDeadline: 'Applications close June 30, 2026',
  applicationNote: 'We review applications on a rolling basis. Early applicants receive priority consideration.',

  stats: [
    { _key: 'stat-1', value: '25–30', label: 'Fellows' },
    { _key: 'stat-2', value: '5', label: 'Regions' },
    { _key: 'stat-3', value: '16', label: 'Week accelerator' },
    { _key: 'stat-4', value: '40', label: 'Ventures to support' },
  ],

  differentiators: [
    {
      _key: 'diff-1',
      title: 'Performance-based pay',
      description: 'Earn a percentage of revenue you directly generate — sponsorships, ticket sales, applications sourced. Plus milestone bonuses for hitting targets.',
    },
    {
      _key: 'diff-2',
      title: 'Equity in outcomes',
      description: 'Top-performing fellows get first-hire rights when paid roles open as Catalyst W scales. Your fellowship is your interview.',
    },
    {
      _key: 'diff-3',
      title: 'Real credentials',
      description: 'Official fellowship certificate, a LinkedIn-verifiable title, and a reference letter from AgriPro leadership — not a participation trophy.',
    },
    {
      _key: 'diff-4',
      title: 'Tier-1 network access',
      description: 'Direct exposure to FAO, AfDB, corporate sponsors, and 40 women-led agribusiness founders at the Africa Food Futures Summit.',
    },
    {
      _key: 'diff-5',
      title: 'Kigali Summit attendance',
      description: 'All active fellows attend the Africa Food Futures Summit in Kigali with travel support. Build relationships in person.',
    },
  ],

  roles: [
    {
      _key: 'role-director',
      title: 'Fellowship Director',
      count: '1',
      hoursPerWeek: '15–20 hrs/week',
      region: 'Central — Remote',
      tag: 'Leadership',
      description: 'Manages all fellows, reports to CEO, owns the full recruitment pipeline, and chairs the weekly all-hands.',
      responsibilities: [
        'Manage all 25–30 fellows across 5 regions',
        'Report directly to AgriPro CEO',
        'Own application pipeline and cohort KPIs',
        'Chair weekly all-hands and regional syncs',
      ],
    },
    {
      _key: 'role-regional',
      title: 'Regional Lead',
      count: '5',
      hoursPerWeek: '12–15 hrs/week',
      region: 'One per region',
      tag: 'Regional',
      description: 'Manages 3–4 fellows in their region, leads local partner outreach, and owns regional application targets.',
      responsibilities: [
        'Manage 3–4 fellows in your region',
        'Lead local partner and institution outreach',
        'Own regional application sourcing target',
        'Report weekly to Fellowship Director',
      ],
    },
    {
      _key: 'role-partnerships',
      title: 'Partnerships Fellow',
      count: '4–5',
      hoursPerWeek: '8–12 hrs/week',
      region: 'Distributed',
      tag: 'Revenue-earning',
      description: 'Corporate sponsor outreach, government engagement, and MOU coordination. Revenue-share eligible.',
      responsibilities: [
        'Identify and pitch corporate sponsors',
        'Engage government and development partners',
        'Coordinate MOUs and partnership agreements',
        'Earn revenue share on confirmed sponsors',
      ],
    },
    {
      _key: 'role-outreach',
      title: 'Outreach & Recruitment Fellow',
      count: '6–8',
      hoursPerWeek: '8–12 hrs/week',
      region: 'Distributed',
      tag: 'Revenue-earning',
      description: 'Applicant sourcing, AgriPro Club coordination, social media, and campus activations. Earn per qualified application.',
      responsibilities: [
        'Source qualified Catalyst W applicants',
        'Coordinate with AgriPro Clubs on campuses',
        'Run social media campaigns in your region',
        'Lead campus and community activations',
      ],
    },
    {
      _key: 'role-operations',
      title: 'Operations Fellow',
      count: '3–4',
      hoursPerWeek: '8–10 hrs/week',
      region: 'Distributed',
      tag: 'Operations',
      description: 'Logistics, data management, application review support, and Summit coordination.',
      responsibilities: [
        'Manage application tracking and data',
        'Support application review process',
        'Coordinate Summit logistics',
        'Handle fellow communications and schedules',
      ],
    },
    {
      _key: 'role-content',
      title: 'Content & Comms Fellow',
      count: '3–4',
      hoursPerWeek: '8–10 hrs/week',
      region: 'Distributed',
      tag: 'Communications',
      description: 'Social media, blog posts, newsletter, PR support, and documentary coordination for Catalyst W.',
      responsibilities: [
        'Manage Catalyst W social channels',
        'Write blog posts, press releases, newsletter',
        'Support documentary and media coordination',
        'Build program visibility across Africa',
      ],
    },
  ],

  compensationItems: [
    { _key: 'comp-1', title: 'Sponsorship revenue share', description: '% of confirmed corporate sponsors you bring in' },
    { _key: 'comp-2', title: 'Application sourcing bonus', description: 'Per verified Catalyst W applicant you source' },
    { _key: 'comp-3', title: 'Ticket sales commission', description: 'On Summit tickets sold through your network' },
    { _key: 'comp-4', title: 'Milestone bonuses', description: 'On hitting regional application and outreach targets' },
    { _key: 'comp-5', title: 'First-hire rights', description: 'Top fellows are first considered for paid roles' },
  ],

  regions: [
    'West Africa',
    'East Africa',
    'Southern Africa',
    'Central Africa',
    'North Africa',
  ],
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding Africa Food Futures 2026...');
  await client.createOrReplace(africaFoodFutures);
  console.log('✓ Africa Food Futures seeded (id: africa-food-futures-2026)');

  console.log('Seeding Catalyst W Accelerator...');
  await client.createOrReplace(catalystWAccelerator);
  console.log('✓ Catalyst W Accelerator seeded (id: catalyst-w-accelerator)');

  console.log('\nDone. Both documents are live in Sanity Studio.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
