'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FaEye, FaStar, FaDownload, FaSearch, FaFilter, FaUser, FaCalendarAlt, FaPaperPlane, FaCheckSquare, FaSquare } from 'react-icons/fa'

interface FellowshipApplication {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  current_location: string
  education: string
  current_status: string
  technical_skills: string[]
  language_skills: string[]
  motivation_essay: string
  video_url: string
  status: string
  shortlisted: boolean
  rating: number | null
  created_at: string
  availability_start: string
}

export default function FellowshipAdmin() {
  const [applications, setApplications] = useState<FellowshipApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<FellowshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [shortlistFilter, setShortlistFilter] = useState('all')
  const [selectedApplications, setSelectedApplications] = useState<number[]>([])
  const [sendingAssessments, setSendingAssessments] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter, shortlistFilter])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/fellowship/applications')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched applications:', data.length > 0 ? data[0] : 'No applications')
        setApplications(data)
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = useCallback(() => {
    let filtered = applications

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.current_location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Shortlist filter
    if (shortlistFilter === 'shortlisted') {
      filtered = filtered.filter(app => app.shortlisted)
    } else if (shortlistFilter === 'not_shortlisted') {
      filtered = filtered.filter(app => !app.shortlisted)
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter, shortlistFilter])

  const toggleShortlist = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/fellowship/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, shortlisted: !currentStatus })
      })

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === id ? { ...app, shortlisted: !currentStatus } : app
          )
        )
      }
    } catch (error) {
      console.error('Error updating shortlist:', error)
    }
  }

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/fellowship/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === id ? { ...app, status: newStatus } : app
          )
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const exportApplications = async () => {
    try {
      const response = await fetch('/api/admin/fellowship/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fellowship-applications-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting applications:', error)
    }
  }

  const toggleApplicationSelection = (applicationId: number) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const selectAllShortlisted = () => {
    const shortlistedIds = filteredApplications
      .filter(app => app.shortlisted && app.status !== 'assessment_invited')
      .map(app => app.id)
    setSelectedApplications(shortlistedIds)
  }

  const clearSelection = () => {
    setSelectedApplications([])
  }

  const sendAssessments = async () => {
    if (selectedApplications.length === 0) {
      alert('Please select at least one application to send assessments to.')
      return
    }

    try {
      setSendingAssessments(true)
      setSendResult(null)

      const response = await fetch('/api/admin/fellowship/send-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: selectedApplications })
      })

      const data = await response.json()
      setSendResult(data)

      if (data.success) {
        // Refresh applications to show updated status
        await fetchApplications()
        // Clear selection
        setSelectedApplications([])
        alert(`✅ Assessment invitations sent successfully!\n\nSent to: ${data.sent?.length || 0} candidates\nErrors: ${data.errors?.length || 0}`)
      } else {
        alert(`❌ Failed to send assessments: ${data.error}`)
      }
    } catch (error) {
      console.error('Error sending assessments:', error)
      setSendResult({ error: 'Network error occurred' })
      alert('❌ Network error occurred while sending assessments.')
    } finally {
      setSendingAssessments(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'assessment_invited': 'bg-purple-100 text-purple-800',
      'interviewed': 'bg-orange-100 text-orange-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'waitlisted': 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(app => app.shortlisted).length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    under_review: applications.filter(app => app.status === 'under_review').length,
    accepted: applications.filter(app => app.status === 'accepted').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fellowship Applications</h1>
          <p className="mt-2 text-gray-600">Manage and review Agripro Fellowship applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
            <div className="text-gray-600">Shortlisted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-gray-600">New Submissions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.under_review}</div>
            <div className="text-gray-600">Under Review</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-gray-600">Accepted</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assessment_invited">Assessment Invited</option>
                <option value="interviewed">Interviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="waitlisted">Waitlisted</option>
              </select>

              {/* Shortlist Filter */}
              <select
                value={shortlistFilter}
                onChange={(e) => setShortlistFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Applicants</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="not_shortlisted">Not Shortlisted</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Send Assessment Actions */}
              <div className="flex gap-2">
                <button
                  onClick={selectAllShortlisted}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select Shortlisted
                </button>
                {selectedApplications.length > 0 && (
                  <>
                    <button
                      onClick={clearSelection}
                      className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Clear ({selectedApplications.length})
                    </button>
                    <button
                      onClick={sendAssessments}
                      disabled={sendingAssessments}
                      className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPaperPlane className="mr-1" />
                      {sendingAssessments ? 'Sending...' : 'Send Assessment'}
                    </button>
                  </>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={exportApplications}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Send Assessment Results */}
          {sendResult && (
            <div className="mt-4 p-4 rounded-lg">
              {sendResult.success ? (
                <div className="bg-green-50 border border-green-200 text-green-800">
                  <div className="flex items-center">
                    <FaCheckSquare className="mr-2" />
                    <span className="font-medium">Assessment invitations sent successfully!</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Sent to: {sendResult.sent?.length || 0} candidates</p>
                    {sendResult.errors?.length > 0 && (
                      <p className="text-red-600">Errors: {sendResult.errors.length}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-800">
                  <div className="flex items-center">
                    <span className="font-medium">Failed to send assessments</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>{sendResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length > 0 && selectedApplications.length === filteredApplications.filter(app => app.shortlisted && app.status !== 'assessment_invited').length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllShortlisted()
                        } else {
                          clearSelection()
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Education & Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {application.shortlisted && application.status !== 'assessment_invited' && (
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(application.id)}
                          onChange={() => toggleApplicationSelection(application.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FaUser className="text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.first_name} {application.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                          <div className="text-sm text-gray-500">{application.current_location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{application.education}</div>
                      <div className="text-sm text-gray-500">{application.current_status}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {application.technical_skills.slice(0, 2).join(', ')}
                        {application.technical_skills.length > 2 && ` +${application.technical_skills.length - 2}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={application.status}
                          onChange={(e) => updateStatus(application.id, e.target.value)}
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="assessment_invited">Assessment Invited</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="waitlisted">Waitlisted</option>
                        </select>
                        {application.shortlisted && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⭐ Shortlisted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(application.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Available: {new Date(application.availability_start).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/fellowship/${application.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleShortlist(application.id, application.shortlisted)}
                          className={`${
                            application.shortlisted ? 'text-yellow-600' : 'text-gray-400'
                          } hover:text-yellow-700`}
                        >
                          <FaStar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No applications found matching your criteria.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
