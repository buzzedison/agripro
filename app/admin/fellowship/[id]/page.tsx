"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaStar, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaGraduationCap, FaVideo, FaFileAlt, FaUser, FaSync, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

interface AssessmentQuestion {
  id: number
  question_number: number
  section: string
  question_type: 'multiple_choice' | 'essay' | 'ranking'
  question: string
  options: string[] | null
  max_points: number
}

interface AssessmentResponse {
  id: number
  response_text: string | null
  response_options: string[] | null
  points_awarded: number | null
  graded_by: string | null
  graded_at: string | null
  created_at: string
  assessment_questions: AssessmentQuestion
}

interface AssessmentResult {
  id: number
  invitation_id: number
  total_score: number
  max_score: number
  percentage_score: number | null
  qualitative_score: number
  quantitative_score: number
  status: string
  reviewer_notes: string | null
  recommendation: string | null
  reviewed_by: string | null
  reviewed_at: string | null
}

interface AssessmentInvitation {
  id: number
  application_id?: number
  invitation_token?: string
  status: string
  sent_at: string | null
  started_at: string | null
  completed_at: string | null
  expires_at: string | null
}

interface AssessmentData {
  success: boolean
  invitation: AssessmentInvitation | null
  responses: AssessmentResponse[]
  result: AssessmentResult | null
}

interface FellowshipApplication {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  nationality: string
  current_location: string
  education: string
  graduation_year: string
  current_status: string
  previous_experience: string
  technical_skills: string[]
  language_skills: string[]
  relevant_experience: string
  motivation_essay: string
  problem_solving_example: string
  career_goals: string
  preferred_placement: string
  availability_start: string
  accommodation_needs: string
  resume_file_name: string
  transcript_file_name: string
  video_url: string
  reference1_name: string
  reference1_email: string
  reference1_relationship: string
  reference2_name: string
  reference2_email: string
  reference2_relationship: string
  status: string
  shortlisted: boolean
  rating: number | null
  admin_notes: string
  created_at: string
}

export default function ApplicationDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [application, setApplication] = useState<FellowshipApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [assessmentError, setAssessmentError] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [responseScores, setResponseScores] = useState<Record<number, number>>({})
  const [resultStatus, setResultStatus] = useState<string>('pending')
  const [recommendation, setRecommendation] = useState<string>('')
  const [reviewerName, setReviewerName] = useState<string>('')
  const [reviewerNotes, setReviewerNotes] = useState<string>('')
  const [qualitativeScore, setQualitativeScore] = useState<string>('')
  const [quantitativeScore, setQuantitativeScore] = useState<string>('')
  const [assessmentSaving, setAssessmentSaving] = useState(false)
  const [assessmentSaveMessage, setAssessmentSaveMessage] = useState<string | null>(null)
  const [assessmentSaveError, setAssessmentSaveError] = useState<string | null>(null)

const computeTotalAwarded = (assessment: AssessmentData | null) => {
  if (!assessment) return 0
  return assessment.responses.reduce((sum, response) => sum + (response.points_awarded || 0), 0)
}

const computeMaxPoints = (assessment: AssessmentData | null) => {
  if (!assessment) return 0
  return assessment.responses.reduce((sum, response) => sum + (response.assessment_questions?.max_points || 0), 0)
}

  const fetchAssessment = useCallback(async () => {
    if (!id) return

    try {
      setAssessmentLoading(true)
      setAssessmentError(null)
      setAssessmentSaveMessage(null)
      setAssessmentSaveError(null)

      const response = await fetch(`/api/admin/fellowship/assessment-results?application_id=${id}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load assessment' }))
        setAssessmentError(errorData.error || 'Failed to load assessment data')
        setAssessmentData(null)
        return
      }

      const data = await response.json()
      setAssessmentData(data)
    } catch (error) {
      console.error('Error fetching assessment data:', error)
      setAssessmentError('Network error while loading assessment data')
      setAssessmentData(null)
    } finally {
      setAssessmentLoading(false)
    }
  }, [id])

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/fellowship/applications/${id}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data)
        setNotes(data.admin_notes || '')
        setRating(data.rating || 0)
      } else {
        console.error('Failed to fetch application')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchApplication()
      fetchAssessment()
    }
  }, [id, fetchApplication, fetchAssessment])

  useEffect(() => {
    if (!assessmentData) {
      setResponseScores({})
      setResultStatus('pending')
      setRecommendation('')
      setReviewerName('')
      setReviewerNotes('')
      setQualitativeScore('')
      setQuantitativeScore('')
      return
    }

    const initialScores: Record<number, number> = {}
    assessmentData.responses.forEach(response => {
      initialScores[response.id] = response.points_awarded ?? 0
    })
    setResponseScores(initialScores)

    const result = assessmentData.result
    setResultStatus(result?.status || 'pending')
    setRecommendation(result?.recommendation || '')
    setReviewerName(result?.reviewed_by || '')
    setReviewerNotes(result?.reviewer_notes || '')
    setQualitativeScore(
      result?.qualitative_score !== null && result?.qualitative_score !== undefined
        ? String(result.qualitative_score)
        : ''
    )
    setQuantitativeScore(
      result?.quantitative_score !== null && result?.quantitative_score !== undefined
        ? String(result.quantitative_score)
        : ''
    )
  }, [assessmentData])

  const updateApplication = async (updates: Partial<FellowshipApplication>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/fellowship/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: application?.id, ...updates })
      })

      if (response.ok) {
        const updated = await response.json()
        setApplication(prev => prev ? { ...prev, ...updated } : null)
      }
    } catch (error) {
      console.error('Error updating application:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveNotesAndRating = async () => {
    await updateApplication({ admin_notes: notes, rating: rating || null })
  }

  const toggleShortlist = async () => {
    if (application) {
      await updateApplication({ shortlisted: !application.shortlisted })
    }
  }

  const updateStatus = async (newStatus: string) => {
    await updateApplication({ status: newStatus })
  }

  const handleAssessmentRefresh = async () => {
    await fetchAssessment()
  }

  const saveAssessmentGrading = async () => {
    if (!assessmentData?.invitation) return

    try {
      setAssessmentSaving(true)
      setAssessmentSaveMessage(null)
      setAssessmentSaveError(null)

      const totalAwarded = Object.values(responseScores).reduce((sum, value) => sum + (Number(value) || 0), 0)
      const maxPoints = assessmentData.responses.reduce((sum, response) => sum + (response.assessment_questions?.max_points || 0), 0)

      const payload = {
        invitationId: assessmentData.invitation.id,
        responses: assessmentData.responses.map(response => ({
          id: response.id,
          points_awarded: Number(responseScores[response.id] ?? 0)
        })),
        totalScore: totalAwarded,
        maxScore: maxPoints,
        resultStatus,
        recommendation,
        reviewerName,
        reviewerNotes,
        qualitativeScore,
        quantitativeScore
      }

      const res = await fetch('/api/admin/fellowship/assessment-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save assessment grading')
      }

      setAssessmentSaveMessage('Assessment grading saved successfully')
      await fetchAssessment()
    } catch (error) {
      console.error('Save assessment grading error:', error)
      setAssessmentSaveError(error instanceof Error ? error.message : 'Failed to save assessment grading')
    } finally {
      setAssessmentSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <Link href="/admin/fellowship" className="text-green-600 hover:text-green-700">
            ← Back to Applications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/fellowship" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Applications
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {application.first_name} {application.last_name}
              </h1>
              <p className="text-gray-600">{application.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShortlist}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                  application.shortlisted 
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaStar className="mr-2" />
                {application.shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              </button>
              <select
                value={application.status}
                onChange={(e) => updateStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(application.status)}`}
              >
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assessment_invited">Assessment Invited</option>
                <option value="interviewed">Interviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="waitlisted">Waitlisted</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assessment & Scoring Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assessment &amp; Scoring</h2>
                  <p className="text-sm text-gray-600">Review submitted responses and record your evaluation</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAssessmentRefresh}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FaSync className={`mr-2 ${assessmentLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  {assessmentData?.invitation?.status === 'completed' && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <FaCheckCircle className="mr-1" /> Completed
                    </span>
                  )}
                </div>
              </div>

              {assessmentError && (
                <div className="mb-4 flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{assessmentError}</span>
                </div>
              )}

              {assessmentSaveMessage && (
                <div className="mb-4 flex items-center text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                  <FaCheckCircle className="mr-2" />
                  <span>{assessmentSaveMessage}</span>
                </div>
              )}

              {assessmentSaveError && (
                <div className="mb-4 flex items-center text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{assessmentSaveError}</span>
                </div>
              )}

              {assessmentLoading ? (
                <div className="py-10 flex flex-col items-center text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-3"></div>
                  Loading assessment data...
                </div>
              ) : !assessmentData ? (
                <div className="py-10 text-center text-gray-500">
                  Assessment data will appear here once the candidate completes their assessment.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Invitation Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Invitation Status</div>
                      <div className="text-lg font-semibold capitalize">{assessmentData.invitation?.status || 'unknown'}</div>
                      <div className="mt-2 text-xs text-gray-400">
                        Sent: {assessmentData.invitation?.sent_at ? new Date(assessmentData.invitation.sent_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Progress</div>
                      <div className="text-lg font-semibold">
                        {assessmentData.invitation?.started_at ? 'Started' : 'Not Started'}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Completed: {assessmentData.invitation?.completed_at ? new Date(assessmentData.invitation.completed_at).toLocaleString() : 'Pending'}
                      </div>
                    </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Assessment Link</div>
                        <div className="text-xs text-green-700 break-all">
                          {(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}/assessment/{assessmentData.invitation?.invitation_token}
                      </div>
                    </div>
                  </div>

                  {/* Scoring Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Total Score</div>
                      <div className="text-2xl font-bold text-green-700">
                        {computeTotalAwarded(assessmentData)} / {computeMaxPoints(assessmentData)}
                      </div>
                      </div>
                      <div className="mt-3 md:mt-0 flex items-center gap-2">
                        <select
                          value={resultStatus}
                          onChange={(e) => setResultStatus(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="graded">Graded</option>
                          <option value="reviewed">Reviewed</option>
                        </select>
                        <select
                          value={recommendation}
                          onChange={(e) => setRecommendation(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">No Recommendation</option>
                          <option value="accept">Strong Accept</option>
                          <option value="interview">Interview</option>
                          <option value="waitlist">Waitlist</option>
                          <option value="reject">Reject</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualitative Score (out of 45)</label>
                        <input
                          type="number"
                          value={qualitativeScore}
                          onChange={(e) => setQualitativeScore(e.target.value)}
                          placeholder="e.g. 32"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantitative Score (out of 55)</label>
                        <input
                          type="number"
                          value={quantitativeScore}
                          onChange={(e) => setQuantitativeScore(e.target.value)}
                          placeholder="e.g. 40"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reviewer Notes */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Who scored this assessment?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Last Reviewed</div>
                        <div className="text-sm">
                          {assessmentData.result?.reviewed_at ? new Date(assessmentData.result.reviewed_at).toLocaleString() : 'Not yet reviewed'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Notes &amp; Summary</label>
                      <textarea
                        rows={4}
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        placeholder="Summarize key strengths, weaknesses, and final recommendation..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Responses Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b">
                      <div className="font-semibold text-gray-800">Question Responses</div>
                      <p className="text-sm text-gray-600">Score each response below and add qualitative remarks in the notes panel.</p>
                    </div>
                    <div className="divide-y">
                      {assessmentData.responses.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          No responses have been submitted yet.
                        </div>
                      ) : (
                        assessmentData.responses.map((response) => {
                          const question = response.assessment_questions
                          const currentScore = responseScores[response.id] ?? 0

                          return (
                            <div key={response.id} className="p-6">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-green-700 tracking-wide uppercase">
                                      Question {question.question_number} • {question.section.replace('_', ' ')}
                                    </div>
                                    <div className="text-sm text-gray-500">Max Points: {question.max_points}</div>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{question.question}</h3>

                                  {question.question_type === 'multiple_choice' && question.options && (
                                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                      {question.options.map((option, index) => (
                                        <li key={index}>• {option}</li>
                                      ))}
                                    </ul>
                                  )}

                                  {question.question_type === 'ranking' && response.response_options && (
                                    <div className="mt-3">
                                      <div className="text-sm font-medium text-gray-700 mb-1">Candidate Ranking</div>
                                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                        {response.response_options.map((option, index) => (
                                          <li key={index}>{option.replace('___ ', '')}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}

                                  {response.response_text && (
                                    <div className="mt-4">
                                      <div className="text-sm font-medium text-gray-700 mb-1">Candidate Response</div>
                                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                        {response.response_text}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="md:w-64">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Awarded</label>
                                  <input
                                    type="number"
                                    value={currentScore}
                                    min={0}
                                    max={question.max_points}
                                    onChange={(e) => {
                                      const value = Number(e.target.value)
                                      setResponseScores((prev) => ({
                                        ...prev,
                                        [response.id]: isNaN(value) ? 0 : value
                                      }))
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                  />
                                  <div className="text-xs text-gray-500 mt-1">Recorded by: {response.graded_by || 'Not graded yet'}</div>
                                  <div className="text-xs text-gray-500">
                                    {response.graded_at ? `Graded ${new Date(response.graded_at).toLocaleString()}` : 'Pending grading'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 justify-end">
                    <button
                      onClick={handleAssessmentRefresh}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => saveAssessmentGrading()}
                      disabled={assessmentSaving}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                    >
                      {assessmentSaving ? 'Saving...' : 'Save Scores'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FaUser className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-medium">{application.first_name} {application.last_name}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{application.email}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{application.phone}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{application.current_location}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                    <div className="font-medium">{new Date(application.date_of_birth).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">🌍</span>
                  <div>
                    <div className="text-sm text-gray-500">Nationality</div>
                    <div className="font-medium">{application.nationality}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Experience */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Education & Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <FaGraduationCap className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Education</div>
                    <div className="font-medium">{application.education}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Graduation Year</div>
                    <div className="font-medium">{application.graduation_year}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">📊</span>
                  <div>
                    <div className="text-sm text-gray-500">Current Status</div>
                    <div className="font-medium">{application.current_status}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Available From</div>
                    <div className="font-medium">{new Date(application.availability_start).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              {application.previous_experience && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Previous Experience</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.previous_experience}</p>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Background</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.technical_skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Language Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.language_skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {application.relevant_experience && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Agricultural Experience</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{application.relevant_experience}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Essays */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Essays</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Motivation Essay</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.motivation_essay}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Problem-Solving Example</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.problem_solving_example}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Career Goals</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{application.career_goals}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${application.email}`}
                  className="inline-flex items-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaEnvelope className="mr-2" />
                  Email Applicant
                </a>
                {application.video_url && (
                  <button
                    onClick={() => {
                      let url = application.video_url
                      // Add protocol if missing
                      if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url
                      }
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }}
                    className="inline-flex items-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <FaVideo className="mr-2" />
                    Watch Video
                  </button>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Documents</h3>
              <div className="space-y-2">
                {application.resume_file_name && (
                  <div className="flex items-center text-gray-700">
                    <FaFileAlt className="mr-2" />
                    Resume: {application.resume_file_name}
                  </div>
                )}
                {application.transcript_file_name && (
                  <div className="flex items-center text-gray-700">
                    <FaFileAlt className="mr-2" />
                    Transcript: {application.transcript_file_name}
                  </div>
                )}
              </div>
            </div>

            {/* References */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">References</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Reference 1</h4>
                  <p className="text-sm text-gray-600">{application.reference1_name}</p>
                  <p className="text-sm text-gray-600">{application.reference1_relationship}</p>
                  <a href={`mailto:${application.reference1_email}`} className="text-blue-600 hover:text-blue-700 text-sm">
                    {application.reference1_email}
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Reference 2</h4>
                  <p className="text-sm text-gray-600">{application.reference2_name}</p>
                  <p className="text-sm text-gray-600">{application.reference2_relationship}</p>
                  <a href={`mailto:${application.reference2_email}`} className="text-blue-600 hover:text-blue-700 text-sm">
                    {application.reference2_email}
                  </a>
                </div>
              </div>
            </div>

            {/* Rating & Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rating & Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-xl ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Add your notes about this applicant..."
                  />
                </div>
                <button
                  onClick={saveNotesAndRating}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notes & Rating'}
                </button>
              </div>
            </div>

            {/* Application Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Application Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Submitted:</span>{' '}
                  <span className="font-medium">{new Date(application.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Preferred Placement:</span>{' '}
                  <span className="font-medium">{application.preferred_placement || 'No preference'}</span>
                </div>
                {application.accommodation_needs && (
                  <div>
                    <span className="text-gray-500">Special Accommodations:</span>{' '}
                    <span className="font-medium">{application.accommodation_needs}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
