import Link from 'next/link'
import { createFellowsPublicClient } from '@/lib/fellows/server'
import type { CatalystFellow } from '@/lib/fellows'
import { designationLabel, isLeadership, designationRank } from '@/lib/fellows/designation'
import { MapPin, Briefcase, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Catalyst Fellows | AgriPro',
  description:
    'Meet the AgriPro Catalyst Fellows — the team of operators, experts and entrepreneurs building the AgriPro fellowship programmes.',
}

export const revalidate = 300

export default async function FellowsDirectoryPage() {
  const supabase = createFellowsPublicClient()
  const { data } = await supabase
    .from('catalyst_fellows_directory')
    .select('*')
    .order('designation', { ascending: false })
    .order('full_name', { ascending: true })

  const fellows = (data || []) as CatalystFellow[]
  const leadership = fellows
    .filter((f) => isLeadership(f.designation))
    .sort((a, b) => designationRank(a.designation) - designationRank(b.designation))
  const team = fellows.filter((f) => !isLeadership(f.designation))
  const leadershipHeading = leadership.length > 1 ? 'Fellowship Leadership' : 'Fellowship Director'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0B2C24] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            AgriPro Catalyst Fellowship
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Meet the Catalyst Fellows</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            The operators, experts and entrepreneurs powering AgriPro&apos;s fellowship
            programmes — including the team behind Catalyst-W.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {fellows.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            Fellow profiles are coming soon.
          </p>
        ) : (
          <>
            {leadership.length > 0 && (
              <section className="mb-12">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">{leadershipHeading}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {leadership.map((fellow) => (
                    <FellowCard key={fellow.id} fellow={fellow} highlight />
                  ))}
                </div>
              </section>
            )}
            <section>
              {leadership.length > 0 && (
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Fellows</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {team.map((fellow) => (
                  <FellowCard key={fellow.id} fellow={fellow} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function FellowCard({ fellow, highlight = false }: { fellow: CatalystFellow; highlight?: boolean }) {
  const role = designationLabel(fellow.designation, fellow.role_in_agripro)

  return (
    <Link
      href={`/fellowship/fellows/${fellow.slug}`}
      className={`group block bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
        highlight ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-100'
      }`}
    >
      {/* Big photo */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#0B2C24]">
        {fellow.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fellow.photo_url}
            alt={fellow.full_name}
            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0B2C24] to-[#1a4a3c]">
            <span className="text-7xl font-bold text-white/20">
              {fellow.full_name
                .split(' ')
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join('')}
            </span>
          </div>
        )}

        {highlight && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-400 text-[#0B2C24] text-xs font-bold shadow">
            Fellowship Director
          </span>
        )}

        {/* Name overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4">
          <h3 className="text-white font-bold text-lg leading-tight">{fellow.full_name}</h3>
          <p className="text-amber-300 text-sm font-medium">{role}</p>
        </div>
      </div>

      {/* Small description */}
      <div className="p-4">
        {fellow.bio ? (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{fellow.bio}</p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-3">Profile coming soon.</p>
        )}

        {(fellow.expertise || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {fellow.expertise.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-3 min-w-0">
            {(fellow.city || fellow.country) && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3" />
                {[fellow.city, fellow.country].filter(Boolean).join(', ')}
              </span>
            )}
            {fellow.has_business && fellow.business_name && (
              <span className="inline-flex items-center gap-1 truncate">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{fellow.business_name}</span>
              </span>
            )}
          </span>
          <span className="text-[#0B2C24] font-medium group-hover:translate-x-0.5 transition-transform shrink-0">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}
