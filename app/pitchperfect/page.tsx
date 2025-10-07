import Link from 'next/link'
import type { Metadata } from 'next'
import clsx from 'clsx'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Pitch Perfect: Green Ventures | AgriPro',
  description:
    "Join Ghana's top agripreneurs at Pitch Perfect: Green Ventures on December 6th. Compete for funding, get sector-specific feedback, and fast-track your agribusiness growth with AgriPro and Enterprise Village.",
}

const applyLink = 'https://airtable.com/app7rzeBLQmXIiBQ5/pagnDZiIp3GmyAPK0/form'

const faqs = [
  {
    question: 'What stage ventures can apply?',
    answer:
      'We welcome agribusiness founders with a working prototype, MVP, or traction. Idea-only ventures should join future cohorts once validation begins.',
  },
  {
    question: 'Do I need a polished pitch deck?',
    answer:
      'Clarity and traction matter more than polish. A focused one-pager or lean pitch deck that highlights your solution, traction, and next steps is enough.',
  },
  {
    question: 'What sectors are you prioritizing?',
    answer:
      'We focus on agriculture and food system ventures such as agri-tech solutions, agri-finance, climate-smart practices, value addition, and cooperative-focused models.',
  },
  {
    question: 'Can I attend without pitching?',
    answer:
      'Yes. Attendees gain full access to workshops, targeted networking, and investor feedback labs to help them sharpen their growth plans.',
  },
]

const agenda = [
  {
    time: '11:30 AM – 12:00 PM',
    title: 'Founder Check-in & Networking Warm-up',
    description:
      'Settle in, connect with fellow agripreneurs, and align with mentors ahead of the live pitches.',
  },
  {
    time: '12:00 PM – 1:15 PM',
    title: 'Pitch Arena: 3-Minute Rapid Pitches',
    description:
      'Selected ventures deliver crisp pitches followed by two minutes of tactical feedback from agri-focused investors.',
  },
  {
    time: '1:15 PM – 1:45 PM',
    title: 'Power Sessions & Feedback Labs',
    description:
      'Breakouts on funding pathways, cooperative growth, export tactics, and operational scaling.',
  },
  {
    time: '1:45 PM – 2:30 PM',
    title: 'Investor Roundtables & Closing Mixer',
    description:
      'Facilitated intros with capital partners and mentors ready to help you execute the next step.',
  },
]

const benefits = [
  {
    title: 'GHS 2,000 + Venture Studio Fast-Track',
    description:
      'First place secures startup capital plus direct entry into the Enterprise Village venture studio in Q1 2026.',
  },
  {
    title: 'Actionable Investor Feedback',
    description:
      'Receive blunt, sector-specific insights from agri-focused investors who understand how to scale in real fields.',
  },
  {
    title: 'Operational Power Sessions',
    description:
      'Take part in deep dives on cooperative models, funding readiness, and export strategy tailored for Ghanaian agripreneurs.',
  },
  {
    title: 'Immersive Networking',
    description:
      'Meet agri-focused venture funds, development partners, experienced founders, and policy allies in one place.',
  },
]

const eligibility = [
  {
    title: 'Agriculture & Food Systems',
    description:
      'Solutions delivering verified value in agri value chains, processing, or farmer-facing services.',
  },
  {
    title: 'Validated Traction',
    description:
      'Evidence of pilots, paying users, or measurable outcomes with farmers, offtakers, or cooperatives.',
  },
  {
    title: 'Distinct Solution',
    description:
      'Unique approach, tech enablement, or scalable operations that differentiate you in the market.',
  },
  {
    title: 'Aligned with EV Themes',
    description:
      'Agri-fintech, climate-smart agriculture, aquaculture, value addition, or cooperative-focused innovations.',
  },
]

const experiences = [
  {
    title: 'Pitch Arena',
    description:
      'Three minutes to showcase traction, followed by honest investor feedback focused on viability, scale, and impact.',
  },
  {
    title: 'Power Sessions',
    description:
      'Dive into capital readiness, cooperative models, and export pathways with mentors who have scaled across West Africa.',
  },
  {
    title: 'Investor Roundtables',
    description:
      'Immediate access to agri-focused capital partners ready to unpack your next milestone and support your scale plan.',
  },
  {
    title: 'Community Mixer',
    description:
      'Connect with fellow founders, development partners, and ecosystem builders invested in the future of agrifood systems.',
  },
]

const differentiators = [
  {
    title: 'Clarity Over Clout',
    description:
      'We reward validated traction over polished slides. Bring proof from the field, not just projections.',
  },
  {
    title: 'Sector-Specific Feedback',
    description:
      'Feedback comes from agri investors, venture studio leads, and operators who understand rural markets.',
  },
  {
    title: 'Community Over Competition',
    description:
      'Build with fellow agripreneurs tackling similar challenges across Ghana’s value chains.',
  },
  {
    title: 'Actionable Playbooks',
    description:
      'Leave with next-step clarity, templates, and committed mentors to unlock the next growth milestone.',
  },
]

const outcomes = [
  'Clear next steps tailored to your venture’s traction and bottlenecks.',
  'Sector-specific feedback from investors actively deploying capital in agriculture.',
  'Meaningful relationships with venture studios, development partners, and policy allies.',
  'Confidence and frameworks to scale faster in 2026.',
]

export default function PitchPerfectPage() {
  return (
    <main className="bg-[#f5faf7] text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f9f1e2] via-white to-[#eef8f2]">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute left-[-12rem] top-[-6rem] h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute bottom-[-8rem] right-[-10rem] h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(12,115,60,0.08),_transparent_55%)]" />
        </div>
        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-20">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-800">
                Presented by AgriPro
              </span>
              <h1 className="text-3xl font-bold leading-tight text-emerald-950 md:text-5xl">
                Pitch Perfect: Green Ventures 2025
              </h1>
              <p className="text-base leading-relaxed text-emerald-900/80 md:text-lg">
                December 6 • The Enterprise Village, Dzorwulu. A tightly curated arena where traction-ready agripreneurs earn funding, blunt feedback, and direct venture studio backing to scale nationwide.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <HeroInfoCard
                eyebrow="Why now"
                title="Investment-grade clarity"
                copy="Stand in front of agri-focused capital partners who value real implementation and measurable farmer impact over pitch polish."
              />
              <HeroInfoCard
                eyebrow="Hosted with"
                title="Enterprise Village"
                copy="A joint activation combining AgriPro’s founder community with EV’s venture studio to accelerate the next wave of agrifood ventures."
              />
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <CTAButton href={applyLink} variant="primary">
                  Apply to Pitch
                </CTAButton>
                <CTAButton href={applyLink} variant="outline">
                  Grab an Observer Seat
                </CTAButton>
              </div>
              <HeroChecklist />
            </div>
          </div>
          <div className="space-y-5 rounded-4xl border border-emerald-900/10 bg-white/90 p-6 shadow-xl backdrop-blur">
            <div className="space-y-1.5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-emerald-700">Event Snapshot</p>
              <h2 className="text-xl font-semibold text-emerald-950 md:text-2xl">Build momentum that investors can feel</h2>
            </div>
            <dl className="space-y-3 text-sm text-gray-700">
              <SnapshotRow label="Applications close" value="November 30, 2025" />
              <SnapshotRow label="Pitch format" value="3 minute pitch • 2 minute live feedback" />
              <SnapshotRow label="Prize pool" value="GHS 2,000 • GHS 1,000 • GHS 500" />
              <SnapshotRow label="Studio access" value="1st place fast-tracked to EV Venture Studio (Q1 2026 cohort)" />
              <SnapshotRow label="Hosted by" value="AgriPro Hub &amp; The Enterprise Village" />
              <SnapshotRow label="Venue" value="The Enterprise Village, Dzorwulu" />
            </dl>
            <div className="grid grid-cols-3 gap-3 text-center text-xs font-medium uppercase tracking-[0.3em] text-emerald-700">
              <HeroStat label="Event date" value="Dec 6" />
              <HeroStat label="Start" value="11:30 AM" />
              <HeroStat label="Duration" value="2.5 hrs" />
            </div>
            <div className="rounded-3xl bg-emerald-100/60 p-4 text-sm text-emerald-900">
              Limited pitch slots. Submissions reviewed rolling—apply early to secure investor prep support.
            </div>
          </div>
        </div>
      </section>

      {/* Why Attend */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-16 md:pt-24">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-600">Why Pitch Perfect</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Funding, traction, and expertise tailored for agribusiness scale
            </h2>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              Pitch Perfect is built for founders deploying real solutions in the field. Forget generic pitch nights—this is where investors, mentors, and partners meet you where it matters: traction, execution, and impact.
            </p>
          </div>
          <div className="flex gap-4">
            <StatCard value="GHS 2,000" label="Cash for 1st place" />
            <StatCard value="3 min" label="Pitch window" />
            <StatCard value="Fast-track" label="Venture studio access" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold text-green-700">{benefit.title}</h3>
              <p className="mt-2 text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-600">What Sets It Apart</span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Not another pitch night—expect precision, candor, and execution support
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {differentiators.map((item) => (
            <div key={item.title} className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold text-green-700">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Highlights */}
      <section className="bg-gradient-to-b from-green-900 via-green-800 to-green-900 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">Inside the Experience</span>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">The 2.5-hour intensity that drives outcomes</h2>
              <p className="mt-4 text-base text-green-100 md:text-lg">
                From the moment you step on stage, everything is designed to accelerate your next moves—sector-specific feedback, capital conversations, and practical insight into scaling across Ghana and beyond.
              </p>
            </div>
            <CTAButton href={applyLink} variant="light">
              Secure Your Pitch Slot
            </CTAButton>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {experiences.map((experience, idx) => (
              <ExperienceCard key={experience.title} {...experience} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="md:flex md:items-start md:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-600">Who Should Apply</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">Is Pitch Perfect right for your venture?</h2>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              We curate a tight cohort of founders solving meaningful problems with measurable execution. If your venture is primed to scale, we want you on stage.
            </p>
          </div>
          <OutcomesCard />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {eligibility.map((item) => (
            <div key={item.title} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-green-700">{item.title}</h3>
              <p className="mt-2 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agenda */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-600">Event Flow</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Expect high-bandwidth pitching, feedback, and execution labs
            </h2>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              Every session is crafted to move your agribusiness forward with clarity, capital, and actionable playbooks.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {agenda.map((slot) => (
              <div key={slot.title} className="rounded-3xl border border-green-100 bg-green-50/60 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-green-600">{slot.time}</p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">{slot.title}</h3>
                <p className="mt-3 text-sm text-gray-600">{slot.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[#0b3b2a] py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-green-200">FAQs</span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Straight answers so you know exactly what you&apos;re signing up for
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-green-100">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-green-50">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#f5faf7] px-6 py-16 text-center shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-green-600">Apply now</span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Limited pitch slots. Submit early to earn your place on stage.
          </h2>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            Applications close on November 30th. Vetting happens on a rolling basis, so the sooner you submit, the faster you receive feedback and next steps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CTAButton href={applyLink} variant="primary">
              Apply to Pitch
            </CTAButton>
            <CTAButton href={applyLink} variant="outline">
              Attend &amp; Learn
            </CTAButton>
          </div>
        </div>
      </section>
    </main>
  )
}

function CTAButton({
  href,
  children,
  variant,
}: {
  href: string
  children: ReactNode
  variant: 'primary' | 'outline' | 'light'
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        {
          'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500': variant === 'primary',
          'border border-white/80 bg-white/20 text-white hover:bg-white/30 focus-visible:ring-white': variant === 'light',
          'border border-green-600 text-green-700 hover:bg-green-600 hover:text-white focus-visible:ring-green-500': variant === 'outline',
        },
      )}
    >
      {children}
    </Link>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/10 p-3 text-center shadow-sm">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/70">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function HeroChecklist() {
  const points = [
    '3-minute pitch • 2-minute investor feedback',
    'Capital, venture studio access, and power sessions',
    'Designed for traction-ready agribusiness founders',
  ]
  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 text-sm text-emerald-900 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">What to expect</p>
      <ul className="mt-3 space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/15 text-xs font-semibold text-emerald-700 shadow-sm"
              aria-hidden
            >
              →
            </span>
            <span className="leading-snug text-emerald-950">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HeroInfoCard({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy: string
}) {
  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-emerald-600">{eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-emerald-900">{title}</h3>
      <p className="mt-2 text-sm text-emerald-900/80">{copy}</p>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-lg">
      <p className="text-2xl font-bold text-green-700">{value}</p>
      <p className="text-xs uppercase tracking-[0.35em] text-gray-500">{label}</p>
    </div>
  )
}

function ExperienceCard({
  title,
  description,
  index,
}: {
  title: string
  description: string
  index: number
}) {
  const backgrounds = [
    'from-green-500/30 via-emerald-500/20 to-green-400/30',
    'from-teal-500/30 via-green-500/20 to-emerald-400/30',
    'from-lime-500/30 via-green-500/20 to-emerald-400/30',
    'from-emerald-500/30 via-green-600/20 to-lime-400/30',
  ]

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10">
      <div className={clsx('h-40 w-full bg-gradient-to-br', backgrounds[index % backgrounds.length])} />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm text-green-100">{description}</p>
      </div>
    </div>
  )
}

function OutcomesCard() {
  return (
    <div className="mt-10 w-full max-w-sm rounded-3xl border border-green-100 bg-white p-6 shadow-sm md:mt-0">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-green-600">Walk away with</p>
      <ul className="mt-4 space-y-3 text-sm text-gray-600">
        {outcomes.map((outcome) => (
          <li key={outcome} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-green-500" aria-hidden />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="font-medium text-gray-800">{label}</dt>
      <dd className="flex-1 text-right text-gray-600">{value}</dd>
    </div>
  )
}
