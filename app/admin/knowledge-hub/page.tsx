'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FaEye,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  summary: {
    totalSignups: number
    totalViews: number
    uniqueViewers: number
    period: string
  }
  signups: Array<{
    id: number
    email: string
    first_name: string
    last_name: string
    signup_source: string
    created_at: string
  }>
  views: Array<{
    id: number
    article_id: string
    article_type: string
    article_title: string
    user_email: string | null
    created_at: string
  }>
  analytics: Array<{
    article_id: string
    article_type: string
    article_title: string
    total_views: number
    unique_views: number
    last_viewed_at: string
  }>
  charts: {
    viewsByType: { [key: string]: number }
    signupsBySource: { [key: string]: number }
  }
  recentActivity: Array<{
    type: string
    title: string
    email: string
    timestamp: string
    source?: string
    article_type?: string
  }>
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']

export default function KnowledgeHubAdmin() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSignups, setFilteredSignups] = useState<AnalyticsData['signups']>([])
  const [filteredViews, setFilteredViews] = useState<AnalyticsData['views']>([])

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Dashboard: Fetching analytics for period:', period)
      const response = await fetch(`/api/admin/knowledge-hub?period=${period}`)
      console.log('Dashboard: API response status:', response.status)

      if (response.ok) {
        const analyticsData = await response.json()
        console.log('Dashboard: Received analytics data:', {
          summary: analyticsData.summary,
          signupsCount: analyticsData.signups?.length,
          viewsCount: analyticsData.views?.length,
          analyticsCount: analyticsData.analytics?.length
        })
        setData(analyticsData)
      } else {
        console.error('Dashboard: Failed to fetch analytics, status:', response.status)
        const errorText = await response.text()
        console.error('Dashboard: Error response:', errorText)
      }
    } catch (error) {
      console.error('Dashboard: Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchAnalytics()
  }, [period, fetchAnalytics])

  useEffect(() => {
    if (data) {
      setFilteredSignups(
        data.signups.filter(signup =>
          `${signup.first_name || ''} ${signup.last_name || ''} ${signup.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      )
      setFilteredViews(
        data.views.filter(view =>
          `${view.article_title || ''} ${view.user_email || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [data, searchTerm])

  const exportData = async (type: 'signups' | 'views') => {
    try {
      const dataToExport = type === 'signups' ? filteredSignups : filteredViews
      const csvContent = [
        Object.keys(dataToExport[0] || {}).join(','),
        ...dataToExport.map(item =>
          Object.values(item).map(val =>
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `knowledge-hub-${type}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading Knowledge Hub Analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to load data</h2>
          <p className="text-gray-700 mb-6">Unable to fetch Knowledge Hub analytics.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const chartData = Object.entries(data.charts.viewsByType).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }))

  const signupSourceData = Object.entries(data.charts.signupsBySource).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Knowledge Hub Analytics</h1>
              <p className="mt-2 text-gray-600">Monitor signups, views, and engagement metrics</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Debug Information</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>Period: {period}</p>
            <p>Signups: {data.summary.totalSignups} | Views: {data.summary.totalViews} | Unique: {data.summary.uniqueViewers}</p>
            <p>Signups Data: {data.signups?.length || 0} records</p>
            <p>Views Data: {data.views?.length || 0} records</p>
            <p>Analytics Data: {data.analytics?.length || 0} records</p>
            <p>Charts: Views by type - {Object.keys(data.charts.viewsByType).length} types, Signups by source - {Object.keys(data.charts.signupsBySource).length} sources</p>
            <p>Recent Activity: {data.recentActivity?.length || 0} items</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUsers className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Signups</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalSignups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaEye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaChartLine className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Unique Viewers</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.uniqueViewers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCalendarAlt className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Period</p>
                <p className="text-2xl font-bold text-gray-900">{period}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Period Filter */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => exportData('signups')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Export Signups
              </button>
              <button
                onClick={() => exportData('views')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Export Views
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views by Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Views by Content Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Signups by Source */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signups by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={signupSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                >
                  {signupSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.email}</p>
                    {activity.source && (
                      <p className="text-xs text-gray-400">Source: {activity.source}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Articles</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Viewed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.analytics.slice(0, 10).map((article) => (
                  <tr key={article.article_id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {article.article_title || article.article_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {article.article_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {article.total_views}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {article.unique_views}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(article.last_viewed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signups Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Knowledge Hub Signups</h3>
            <p className="text-sm text-gray-500">Showing {filteredSignups.length} of {data.signups.length} signups</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signup Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSignups.map((signup) => (
                  <tr key={signup.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {signup.first_name} {signup.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {signup.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {signup.signup_source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(signup.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
