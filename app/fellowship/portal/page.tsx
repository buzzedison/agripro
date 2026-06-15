import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/fellows/server'
import { getFellowContributions } from '@/lib/fellows'
import type { CatalystFellow } from '@/lib/fellows'
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react'
import PortalClient from './PortalClient'

export const metadata = {
  title: 'Catalyst Fellow Portal | AgriPro',
  description: 'Manage your AgriPro Catalyst Fellow profile.',
}

export const dynamic = 'force-dynamic'

export default async function FellowPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ fellow?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/fellowship/portal')
  }

  const { fellow: requestedFellowId } = await searchParams
  const isAdmin = await isPlatformAdmin(user.email)

  // Admins can open any fellow's portal via ?fellow=<id>
  if (requestedFellowId && isAdmin) {
    const { data } = await supabase
      .from('catalyst_fellows')
      .select('*')
      .eq('id', requestedFellowId)
      .maybeSingle()
    const fellow = data as CatalystFellow | null
    if (fellow) {
      const contributions = fellow.email
        ? await getFellowContributions(fellow.email)
        : []
      return (
        <PortalClient
          fellow={fellow}
          contributions={contributions}
          viewerId={user.id}
          adminMode
        />
      )
    }
  }

  // Claim links the roster record (matched by email) to this auth user.
  // Idempotent: returns the row whether it was just claimed or already linked.
  const { data: claimed } = await supabase.rpc('claim_catalyst_fellow_profile')
  const fellow: CatalystFellow | null = Array.isArray(claimed)
    ? claimed[0] ?? null
    : claimed ?? null

  if (fellow) {
    const contributions = user.email ? await getFellowContributions(user.email) : []
    return (
      <PortalClient fellow={fellow} contributions={contributions} viewerId={user.id} />
    )
  }

  // Not on the roster — admins get a roster picker, everyone else a friendly notice
  if (isAdmin) {
    const { data: roster } = await supabase
      .from('catalyst_fellows')
      .select('*')
      .order('designation', { ascending: false })
      .order('full_name')
    return <AdminRosterPicker fellows={(roster || []) as CatalystFellow[]} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
          🌱
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          You&apos;re not on the fellows roster yet
        </h1>
        <p className="text-gray-600 text-sm mb-2">
          This portal is for AgriPro Catalyst Fellows. Your login email
          (<span className="font-medium">{user.email}</span>) doesn&apos;t match any
          fellow record.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          If you&apos;re a fellow, ask the fellowship team to add this email to the
          roster — then refresh this page.
        </p>
        <Link
          href="/fellowship"
          className="inline-block px-5 py-2.5 rounded-full bg-[#0B2C24] text-white text-sm font-medium hover:bg-[#10392f] transition-colors"
        >
          About the Fellowship
        </Link>
      </div>
    </div>
  )
}

function AdminRosterPicker({ fellows }: { fellows: CatalystFellow[] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0B2C24] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mb-2">
            <ShieldCheck className="w-4 h-4" />
            Admin access
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Fellow Portal</h1>
          <p className="text-white/70 text-sm">
            You&apos;re not on the roster yourself, but as an admin you can open and
            edit any fellow&apos;s portal below.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {fellows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500 text-sm">
            The roster is empty.{' '}
            <Link href="/admin/fellows" className="text-[#0B2C24] font-medium hover:underline">
              Add fellows in the admin panel →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {fellows.map((fellow) => (
              <Link
                key={fellow.id}
                href={`/fellowship/portal?fellow=${fellow.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {fellow.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fellow.photo_url}
                      alt={fellow.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0B2C24] text-white flex items-center justify-center font-bold">
                      {fellow.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {fellow.full_name}
                      {fellow.designation === 'director' && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-medium">
                          Director
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{fellow.email}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                  {fellow.user_id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> claimed
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" /> not claimed
                    </>
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
        <p className="text-center mt-6 text-sm text-gray-400">
          Looking for roster management?{' '}
          <Link href="/admin/fellows" className="text-[#0B2C24] font-medium hover:underline">
            Open the admin panel
          </Link>
        </p>
      </div>
    </div>
  )
}
