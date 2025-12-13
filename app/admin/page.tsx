'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useContentAccess } from '@/lib/hooks/useContentAccess'
import {
  FaUsers,
  FaChartBar,
  FaGraduationCap,
  FaCog,
  FaEye,
  FaUserShield,
  FaDatabase
} from 'react-icons/fa'

export default function AdminDashboard() {
  const { user, loading } = useContentAccess()
  const [stats, setStats] = useState({
    totalUsers: 0,
    pageViews: 0,
    applications: 0,
    signups: 0,
    uniqueViewers: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [pendingSubmissions, setPendingSubmissions] = useState(0)

  useEffect(() => {
    if (user && !loading) {
      fetchStats()
      fetchPendingSubmissions()
    }
  }, [user, loading])

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/knowledge-hub/contributors/pending-count')
      if (response.ok) {
        const data = await response.json()
        setPendingSubmissions(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching pending submissions:', error)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      console.log('Fetching admin overview stats...')

      // Add timeout to prevent indefinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch('/api/admin/overview', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log('Admin stats received:', data)
        setStats({
          totalUsers: data.totalUsers || 0,
          pageViews: data.pageViews || 0,
          applications: data.applications || 0,
          signups: data.signups || 0,
          uniqueViewers: data.uniqueViewers || 0
        })
      } else {
        console.error('Failed to fetch admin stats:', response.status, response.statusText)
        // Still update with zeros if API fails
        setStats({
          totalUsers: 0,
          pageViews: 0,
          applications: 0,
          signups: 0,
          uniqueViewers: 0
        })
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)

      // If it's an abort error, still set some default stats
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request timed out, using default stats')
      }

      // Always set default stats on error to prevent infinite loading
      setStats({
        totalUsers: 0,
        pageViews: 0,
        applications: 0,
        signups: 0,
        uniqueViewers: 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.email}. Manage your Agripro platform from here.
          </p>
        </div>

        {/* Debug Info (temporary) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Admin Stats Debug</h3>
          <div className="text-xs text-blue-700 grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>Users: {stats.totalUsers}</div>
            <div>Views: {stats.pageViews}</div>
            <div>Apps: {stats.applications}</div>
            <div>Signups: {stats.signups}</div>
            <div>Unique: {stats.uniqueViewers}</div>
          </div>
          <button
            onClick={fetchStats}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Refresh Stats
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaEye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pageViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaGraduationCap className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartBar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Signups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.signups}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Knowledge Hub Analytics */}
          <Link
            href="/admin/knowledge-hub"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaChartBar className="h-8 w-8 text-green-600 group-hover:text-green-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                  Knowledge Hub Analytics
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              View signup statistics, article views, and engagement metrics for the Knowledge Hub.
            </p>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              View Analytics →
            </div>
          </Link>

          {/* Contributor Review */}
          <Link
            href="/admin/knowledge-hub/contributors"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group relative"
          >
            {pendingSubmissions > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
                {pendingSubmissions > 9 ? '9+' : pendingSubmissions}
              </span>
            )}
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaUserShield className="h-8 w-8 text-emerald-600 group-hover:text-emerald-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                  Contributor Review
                </h3>
                {pendingSubmissions > 0 && (
                  <p className="text-xs text-amber-600 font-medium">
                    {pendingSubmissions} submission{pendingSubmissions !== 1 ? 's' : ''} awaiting review
                  </p>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Manage submitted articles, leave editorial feedback, and publish new Knowledge Hub content.
            </p>
            <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
              Open Review Queue →
            </div>
          </Link>

          {/* Fellowship Management */}
          <Link
            href="/admin/fellowship"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaGraduationCap className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  Fellowship Applications
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Review and manage fellowship applications, update statuses, and export data.
            </p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              Manage Applications →
            </div>
          </Link>

          {/* Trade Management */}
          <Link
            href="/admin/trade"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-teal-600 group-hover:text-teal-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600">
                  Trade & Vendors
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Review vendor applications, manage marketplace listings, and approve verified vendors.
            </p>
            <div className="mt-4 flex items-center text-teal-600 text-sm font-medium">
              Manage Vendors →
            </div>
          </Link>

          {/* User Management */}
          <Link
            href="/admin/members"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">
                  Members Directory
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              View all signed-up users, including those with incomplete profiles.
            </p>
            <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
              View Members →
            </div>
          </Link>

          {/* Admin Users */}
          <Link
            href="/admin/debug"
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaUserShield className="h-8 w-8 text-red-600 group-hover:text-red-700" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600">
                  Admin Debug
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Debug admin authentication, database connections, and system status.
            </p>
            <div className="mt-4 flex items-center text-red-600 text-sm font-medium">
              Debug System →
            </div>
          </Link>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow p-6 opacity-75">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaCog className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  System Settings
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Configure system settings, email templates, and platform preferences.
            </p>
            <div className="mt-4 flex items-center text-gray-400 text-sm font-medium">
              Coming Soon
            </div>
          </div>

          {/* Database Management */}
          <div className="bg-white rounded-lg shadow p-6 opacity-75">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaDatabase className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Database Management
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Backup, restore, and manage database operations and migrations.
            </p>
            <div className="mt-4 flex items-center text-gray-400 text-sm font-medium">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <FaChartBar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Recent activity will appear here once analytics are set up.</p>
              <Link
                href="/admin/knowledge-hub"
                className="mt-2 inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Set up Analytics →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              href="/admin/knowledge-hub/contributors"
              className="inline-flex items-center justify-center px-4 py-2 border border-emerald-400 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors relative"
            >
              Review Submissions
              {pendingSubmissions > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-700">
                  {pendingSubmissions > 9 ? '9+' : pendingSubmissions}
                </span>
              )}
            </Link>
            <Link
              href="/admin/knowledge-hub"
              className="inline-flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50 transition-colors"
            >
              View Analytics
            </Link>
            <Link
              href="/admin/fellowship"
              className="inline-flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50 transition-colors"
            >
              Review Applications
            </Link>
            <Link
              href="/admin/debug"
              className="inline-flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50 transition-colors"
            >
              Debug System
            </Link>
            <Link
              href="/knowledgehub"
              className="inline-flex items-center justify-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50 transition-colors"
            >
              View Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
