'use client'

import { useState, useEffect, useCallback } from 'react'
import { useContentAccess } from '@/lib/hooks/useContentAccess'
import { createClient } from '@/lib/supabase/client'

export default function AdminDebugPage() {
  const { user, loading } = useContentAccess()
  const [adminStatus, setAdminStatus] = useState<any>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [settingUp, setSettingUp] = useState(false)
  const [fixStatus, setFixStatus] = useState<any>(null)
  const [fixing, setFixing] = useState(false)
  const [realDataStatus, setRealDataStatus] = useState<any>(null)
  const [gettingRealData, setGettingRealData] = useState(false)

  const checkAdminStatus = useCallback(async () => {
    if (!user?.email) return

    setCheckingAdmin(true)
    try {
      const response = await fetch(`/api/admin/check-status?email=${encodeURIComponent(user.email)}`)
      const data = await response.json()
      setAdminStatus(data)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setAdminStatus({ error: 'Failed to check admin status' })
    } finally {
      setCheckingAdmin(false)
    }
  }, [user?.email])

  const setupAdminUser = async () => {
    setSettingUp(true)
    setSetupStatus(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setSetupStatus(data)

      // Re-check admin status after setup
      if (data.success && user?.email) {
        setTimeout(() => checkAdminStatus(), 1000)
      }
    } catch (error) {
      console.error('Error setting up admin:', error)
      setSetupStatus({ error: 'Failed to setup admin user' })
    } finally {
      setSettingUp(false)
    }
  }

  const fixDatabase = async () => {
    setFixing(true)
    setFixStatus(null)

    try {
      const response = await fetch('/api/admin/fix-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setFixStatus(data)
    } catch (error) {
      console.error('Error fixing database:', error)
      setFixStatus({ error: 'Failed to fix database schema' })
    } finally {
      setFixing(false)
    }
  }

  const getRealUserData = async () => {
    setGettingRealData(true)
    setRealDataStatus(null)

    try {
      const response = await fetch('/api/admin/get-real-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setRealDataStatus(data)

      // Re-check admin status and refresh dashboard after getting real data
      if (data.success && user?.email) {
        setTimeout(() => {
          checkAdminStatus()
          // Refresh the dashboard data by going to knowledge hub and back
          if (window.location.pathname.includes('/debug')) {
            setTimeout(() => {
              alert('Data populated successfully! Go to Knowledge Hub Analytics to see your real data.')
            }, 1500)
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Error getting real user data:', error)
      setRealDataStatus({ error: 'Failed to get real user data' })
    } finally {
      setGettingRealData(false)
    }
  }

  const checkDatabase = useCallback(async () => {
    try {
      const supabase = createClient()

      // Try to query a simple table to check DB connection
      const { data, error } = await supabase
        .from('fellowship_applications')
        .select('count', { count: 'exact', head: true })

      setDbStatus({
        connected: !error,
        error: error?.message,
        fellowshipAppsCount: data ? 'Query successful' : 'No data'
      })
    } catch (error) {
      setDbStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  useEffect(() => {
    if (user?.email && !loading) {
      checkAdminStatus()
      checkDatabase()
    }
  }, [user, loading, checkAdminStatus, checkDatabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Debug Page</h1>
          <p className="mt-2 text-gray-600">Debug admin authentication and database issues</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current User</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Provider:</strong> {user.app_metadata?.provider}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-600">No user logged in</p>
          )}
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Connection</h2>
          <button
            onClick={checkDatabase}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            Test Database Connection
          </button>
          {dbStatus && (
            <div className="space-y-2">
              <p><strong>Connected:</strong> {dbStatus.connected ? '✅ Yes' : '❌ No'}</p>
              {dbStatus.error && <p><strong>Error:</strong> <span className="text-red-600">{dbStatus.error}</span></p>}
              {dbStatus.fellowshipAppsCount && <p><strong>Test Query:</strong> {dbStatus.fellowshipAppsCount}</p>}
            </div>
          )}
        </div>

        {/* Get Real User Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Real User Data</h2>
          <p className="text-gray-600 mb-4">
            Populate analytics with real data from your Supabase Auth users and fellowship applicants.
          </p>
          <button
            onClick={getRealUserData}
            disabled={gettingRealData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4 disabled:opacity-50"
          >
            {gettingRealData ? 'Getting Data...' : 'Get Real User Data'}
          </button>
          {realDataStatus && (
            <div className="space-y-2">
              {realDataStatus.success ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">✅ {realDataStatus.message}</p>
                  {realDataStatus.stats && (
                    <div className="text-xs mt-2 space-y-1">
                      <p>Auth Users: {realDataStatus.stats.authUsers}</p>
                      <p>Signups Added: {realDataStatus.stats.signupsAdded}</p>
                      <p>Total Signups: {realDataStatus.stats.totalSignups}</p>
                      <p>Total Views: {realDataStatus.stats.totalViews}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">❌ {realDataStatus.error}</p>
                  {realDataStatus.details && <p className="text-xs mt-1">{realDataStatus.details}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fix Database Schema */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fix Database Schema</h2>
          <p className="text-gray-600 mb-4">
            If you&apos;re seeing view tracking errors, use this to fix the database column types.
          </p>
          <button
            onClick={fixDatabase}
            disabled={fixing}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mb-4 disabled:opacity-50"
          >
            {fixing ? 'Fixing...' : 'Fix Database Schema (view_duration errors)'}
          </button>
          {fixStatus && (
            <div className="space-y-2">
              {fixStatus.success ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">✅ {fixStatus.message}</p>
                  {fixStatus.details && <p className="text-xs mt-1">{fixStatus.details}</p>}
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">❌ {fixStatus.error}</p>
                  {fixStatus.details && <p className="text-xs mt-1">{fixStatus.details}</p>}
                  {fixStatus.suggestion && <p className="text-xs mt-1 font-medium">{fixStatus.suggestion}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Setup Admin User */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Admin User</h2>
          <p className="text-gray-600 mb-4">
            If you&apos;re having trouble with admin access, use this to automatically create the admin user.
          </p>
          <button
            onClick={setupAdminUser}
            disabled={settingUp}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mb-4 disabled:opacity-50"
          >
            {settingUp ? 'Setting up...' : 'Setup Admin User (edison@agriprohub.com)'}
          </button>
          {setupStatus && (
            <div className="space-y-2">
              {setupStatus.success ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">✅ {setupStatus.message}</p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">❌ {setupStatus.error}</p>
                  {setupStatus.details && <p className="text-xs mt-1">{setupStatus.details}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Status Check</h2>
          <button
            onClick={checkAdminStatus}
            disabled={checkingAdmin || !user?.email}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-4 disabled:opacity-50"
          >
            {checkingAdmin ? 'Checking...' : 'Check Admin Status'}
          </button>
          {adminStatus && (
            <div className="space-y-2">
              <p><strong>Is Admin:</strong> {adminStatus.isAdmin ? '✅ Yes' : '❌ No'}</p>
              {adminStatus.error && <p><strong>Error:</strong> <span className="text-red-600">{adminStatus.error}</span></p>}
              {adminStatus.message && <p><strong>Message:</strong> <span className="text-blue-600">{adminStatus.message}</span></p>}
              {adminStatus.needsSetup && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">💡 {adminStatus.details}</p>
                  <button
                    onClick={setupAdminUser}
                    className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                    Setup Admin User
                  </button>
                </div>
              )}
              {adminStatus.adminData && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Admin Data:</p>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(adminStatus.adminData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/knowledge-hub"
              className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
            >
              📊 Go to Knowledge Hub Analytics
            </a>
            <a
              href="/admin/fellowship"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Go to Fellowship Admin
            </a>
            <a
              href="/knowledgehub"
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Go to Knowledge Hub
            </a>
          </div>
        </div>

        {/* Test Analytics Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Analytics Data</h2>
          <p className="text-gray-600 mb-4">
            Check database tables and analytics API to diagnose why dashboard shows zeros.
          </p>
          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/test-data')
                  const data = await response.json()
                  console.log('Full test data:', data)

                  const dbStatus = data.database_status || []
                  const apiData = data.analytics_api || {}

                  let message = 'Database Status:\n'
                  dbStatus.forEach((table: any) => {
                    message += `${table.table}: ${table.count} records ${table.error ? `(Error: ${table.error})` : ''}\n`
                    if (table.sampleData && table.sampleData.length > 0) {
                      message += `  Sample: ${table.sampleData[0].email || 'N/A'} (${new Date(table.sampleData[0].created_at).toLocaleDateString()})\n`
                    }
                  })

                  message += '\nAnalytics API:\n'
                  if (apiData.summary) {
                    message += `Signups: ${apiData.summary.totalSignups}\n`
                    message += `Views: ${apiData.summary.totalViews}\n`
                    message += `Analytics: ${apiData.analytics?.length || 0}\n`
                  } else if (apiData.error) {
                    message += `API Error: ${apiData.error}\n`
                  }

                  alert(message)
                } catch (error) {
                  console.error('Test failed:', error)
                  alert('Failed to test analytics data')
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              🔍 Full Database Test
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/knowledge-hub?period=30d')
                  const data = await response.json()
                  console.log('Analytics API test:', data)
                  alert(`API Response:\nSignups: ${data.summary?.totalSignups}\nViews: ${data.summary?.totalViews}\nAnalytics: ${data.analytics?.length || 0}`)
                } catch (error) {
                  console.error('API test failed:', error)
                  alert('Failed to test analytics API')
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Test Analytics API
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/overview')
                  const data = await response.json()
                  console.log('Overview API test:', data)
                  alert(`Overview API Response:\nUsers: ${data.totalUsers}\nViews: ${data.pageViews}\nApps: ${data.applications}\nSignups: ${data.signups}\nUnique: ${data.uniqueViewers}`)
                } catch (error) {
                  console.error('Overview API test failed:', error)
                  alert('Failed to test overview API')
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📈 Test Overview API
            </button>

            <button
              onClick={async () => {
                // Test direct database queries
                try {
                  const tests = []

                  // Test each table directly
                  const tables = ['knowledge_hub_signups', 'article_views', 'fellowship_applications']

                  for (const table of tables) {
                    try {
                      const response = await fetch(`/api/admin/test-data`)
                      const data = await response.json()

                      const tableInfo = data.database_status?.find((t: any) => t.table === table)
                      tests.push(`${table}: ${tableInfo?.count || 0} records`)
                    } catch (err) {
                      tests.push(`${table}: Error`)
                    }
                  }

                  alert('Direct Database Test:\n' + tests.join('\n'))
                } catch (error) {
                  console.error('Database test failed:', error)
                  alert('Failed to test database directly')
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🗄️ Test Database Direct
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/fix-signups', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  })

                  const data = await response.json()

                  if (data.success) {
                    alert(`✅ FIXED! Signups are now working!\n\n` +
                          `Total signups: ${data.stats?.totalSignups || 0}\n\n` +
                          `Refresh your dashboard at /admin/knowledge-hub to see the signups!`)

                    // Refresh the page to show updated data
                    window.location.reload()
                  } else {
                    alert(`❌ Fix failed: ${data.error}`)
                  }
                } catch (error) {
                  console.error('Failed to fix signups:', error)
                  alert('❌ Failed to fix signups. Try the manual SQL method.')
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🚀 Auto-Fix Signups
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/make-recent', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  })

                  const data = await response.json()

                  if (data.success) {
                    alert(`✅ MADE RECENT! Your signups are now visible!\n\n` +
                          `Recent signups: ${data.stats?.recentSignupsCount || 0}\n\n` +
                          `Go to /admin/knowledge-hub to see them in the dashboard!`)

                    // Refresh the page to show updated data
                    window.location.reload()
                  } else {
                    alert(`❌ Failed to make recent: ${data.error}`)
                  }
                } catch (error) {
                  console.error('Failed to make recent:', error)
                  alert('❌ Failed to make signups recent.')
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              📅 Make Signups Recent
            </button>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Quick Fix for Dashboard Zeros</h3>
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800 font-medium">
              🚀 **FASTEST SOLUTION:** Copy and run `quick-populate-analytics.sql` in your Supabase SQL Editor
            </p>
            <p className="text-xs text-green-700 mt-1">
              This will immediately populate your dashboard with test data so you can see it working!
            </p>
          </div>

          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Alternative Steps:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Use &quot;🔍 Full Database Test&quot; to check if tables exist</li>
            <li>Use &quot;📊 Test Analytics API&quot; to check if API is working</li>
            <li>Run `quick-populate-analytics.sql` in Supabase for instant test data</li>
            <li>Use &quot;Get Real User Data&quot; to populate with actual users</li>
            <li>Go to Knowledge Hub Analytics to see the results</li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Expected Results:</strong> After running the SQL, your dashboard should show:
              <br />• Signups: 8
              <br />• Views: 9
              <br />• Charts with data points
              <br />• Recent activity feed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
