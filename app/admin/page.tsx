'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useContentAccess } from '@/lib/hooks/useContentAccess'
import {
  Users,
  Eye,
  GraduationCap,
  TrendingUp,
  BookOpen,
  FileCheck,
  ShoppingBag,
  Globe2,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'

const QUICK_LINKS = [
  {
    href: '/admin/catalyst-w',
    label: 'Catalyst W Accelerator',
    description: 'Applications, prospectus requests & plan selections',
    icon: Sparkles,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-600 bg-purple-100',
    linkColor: 'text-purple-600',
  },
  {
    href: '/admin/fellowship/catalyst-w',
    label: 'Catalyst W Fellowship',
    description: 'Review fellowship applications, AI score, send emails',
    icon: GraduationCap,
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    iconColor: 'text-green-600 bg-green-100',
    linkColor: 'text-green-600',
  },
  {
    href: '/admin/fellowship/catalyst-w/cohort',
    label: 'Cohort Management',
    description: 'Fellows, sessions, attendance & comms',
    icon: GraduationCap,
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    iconColor: 'text-teal-600 bg-teal-100',
    linkColor: 'text-teal-600',
  },
  {
    href: '/admin/knowledge-hub/contributors',
    label: 'Contributor Review',
    description: 'Approve or reject submitted articles',
    icon: FileCheck,
    color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    iconColor: 'text-emerald-600 bg-emerald-100',
    linkColor: 'text-emerald-600',
    badge: 'pending',
  },
  {
    href: '/admin/knowledge-hub',
    label: 'Knowledge Hub Analytics',
    description: 'Views, signups and engagement data',
    icon: BookOpen,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600 bg-blue-100',
    linkColor: 'text-blue-600',
  },
  {
    href: '/admin/members',
    label: 'Members Directory',
    description: 'All signed-up users and profiles',
    icon: Users,
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    iconColor: 'text-indigo-600 bg-indigo-100',
    linkColor: 'text-indigo-600',
  },
  {
    href: '/admin/trade',
    label: 'Vendors & Trade',
    description: 'Vendor applications and marketplace',
    icon: ShoppingBag,
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    iconColor: 'text-teal-600 bg-teal-100',
    linkColor: 'text-teal-600',
  },
  {
    href: '/admin/africa-food-futures',
    label: 'Africa Food Futures',
    description: 'Summit registrations and submissions',
    icon: Globe2,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconColor: 'text-amber-600 bg-amber-100',
    linkColor: 'text-amber-600',
  },
  {
    href: '/admin/fellowship',
    label: 'All Fellowships',
    description: 'Overview of all fellowship programmes',
    icon: GraduationCap,
    color: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    iconColor: 'text-rose-600 bg-rose-100',
    linkColor: 'text-rose-600',
  },
]

export default function AdminDashboard() {
  const { user, loading } = useContentAccess()
  const [stats, setStats] = useState({
    totalUsers: 0,
    pageViews: 0,
    applications: 0,
    signups: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [pendingSubmissions, setPendingSubmissions] = useState(0)

  useEffect(() => {
    if (user && !loading) {
      fetchStats()
      fetch('/api/admin/knowledge-hub/contributors/pending-count')
        .then((r) => r.ok ? r.json() : { count: 0 })
        .then((d) => setPendingSubmissions(d.count || 0))
        .catch(() => {})
    }
  }, [user, loading])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const response = await fetch('/api/admin/overview', {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      })
      clearTimeout(timeoutId)
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.totalUsers || 0,
          pageViews: data.pageViews || 0,
          applications: data.applications || 0,
          signups: data.signups || 0,
        })
      }
    } catch {
      // keep zeros
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Members', value: stats.totalUsers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Page Views', value: stats.pageViews, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Applications', value: stats.applications, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'New Signups', value: stats.signups, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const firstName = user?.email?.split('@')[0] ?? 'Admin'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold text-gray-900">{firstName}</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening on AgriPro today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? <span className="inline-block w-10 h-6 bg-gray-100 rounded animate-pulse" /> : s.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Pending banner */}
      {pendingSubmissions > 0 && (
        <Link
          href="/admin/knowledge-hub/contributors"
          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 hover:bg-amber-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {pendingSubmissions} contributor submission{pendingSubmissions !== 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-amber-700 text-xs">Click to open the review queue</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      )}

      {/* Section cards */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Manage</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon
          const showBadge = item.badge === 'pending' && pendingSubmissions > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col p-5 rounded-2xl border bg-white transition-all hover:shadow-md group ${item.color}`}
            >
              {showBadge && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                  {pendingSubmissions > 9 ? '9+' : pendingSubmissions}
                </span>
              )}
              <div className={`w-9 h-9 rounded-xl ${item.iconColor} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">{item.label}</p>
              <p className="text-gray-500 text-xs leading-relaxed flex-1">{item.description}</p>
              <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${item.linkColor}`}>
                Open
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
