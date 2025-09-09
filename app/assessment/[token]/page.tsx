'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaClock, FaUser } from 'react-icons/fa'

interface Question {
  id: number
  question_number: number
  section: string
  question_type: string
  question: string
  options: string[] | null
  max_points: number
}

interface Invitation {
  id: number
  first_name: string
  last_name: string
  status: string
  expires_at: string
}

interface AssessmentData {
  invitation: Invitation
  questions: Question[]
  total_questions: number
}

interface SubmissionResult {
  success: boolean
  message: string
  responses_submitted: number
  total_score: number
  max_score: number
  result_id?: number
}

interface Response {
  questionId: number
  responseText?: string
  responseOptions?: string[]
}

export default function AssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  useEffect(() => {
    if (token) {
      fetchAssessment()
    }
  }, [token])

  const fetchAssessment = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/assessment/questions?token=${token}`)

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load assessment')
        return
      }

      const data = await response.json()
      setAssessmentData(data)

      // Initialize responses array
      const initialResponses = data.questions.map((q: Question) => ({
        questionId: q.id,
        responseText: '',
        responseOptions: q.question_type === 'ranking' && q.options ? [...q.options] : []
      }))
      setResponses(initialResponses)

    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Fetch assessment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateResponse = (questionId: number, responseText: string, responseOptions: string[] = []) => {
    setResponses(prev =>
      prev.map(r =>
        r.questionId === questionId
          ? { ...r, responseText, responseOptions }
          : r
      )
    )
  }

  const handleMultipleChoice = (questionId: number, selectedOption: string) => {
    updateResponse(questionId, selectedOption)
  }

  const handleEssayResponse = (questionId: number, text: string) => {
    const currentResponse = responses.find(r => r.questionId === questionId)
    updateResponse(questionId, text, currentResponse?.responseOptions || [])
  }

  const handleRankingResponse = (questionId: number, ranking: string[]) => {
    const currentResponse = responses.find(r => r.questionId === questionId)
    updateResponse(questionId, currentResponse?.responseText || '', ranking)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === dropIndex) return

    const currentQ = assessmentData?.questions[currentQuestion]
    if (!currentQ) return

    const currentResponse = responses.find(r => r.questionId === currentQ.id)
    const currentRanking = currentResponse?.responseOptions?.length
      ? [...currentResponse.responseOptions]
      : currentQ.options ? [...currentQ.options] : []

    if (!currentRanking.length) return

    const draggedItemContent = currentRanking[draggedItem]
    currentRanking.splice(draggedItem, 1)
    currentRanking.splice(dropIndex, 0, draggedItemContent)

    handleRankingResponse(currentQ.id, currentRanking)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const submitAssessment = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          responses
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit assessment')
        return
      }

      const data = await response.json()
      setSubmissionResult(data)
      setCompleted(true)

    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Submit assessment error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const isQuestionAnswered = (questionId: number) => {
    const response = responses.find(r => r.questionId === questionId)
    if (!response) return false

    const question = assessmentData?.questions.find(q => q.id === questionId)
    if (!question) return false

    if (question.question_type === 'essay') {
      return response.responseText && response.responseText.trim().length > 0
    } else if (question.question_type === 'multiple_choice') {
      return response.responseText && response.responseText.trim().length > 0
    } else if (question.question_type === 'ranking') {
      return response.responseOptions && response.responseOptions.length > 0
    }

    return false
  }

  const getAnsweredCount = () => {
    return responses.filter(r => {
      const question = assessmentData?.questions.find(q => q.id === r.questionId)
      if (!question) return false

      if (question.question_type === 'essay') {
        return r.responseText && r.responseText.trim().length > 0
      } else if (question.question_type === 'multiple_choice') {
        return r.responseText && r.responseText.trim().length > 0
      } else if (question.question_type === 'ranking') {
        // Ranking question requires both the ranking AND explanation text
        return r.responseOptions && r.responseOptions.length > 0 && r.responseText && r.responseText.trim().length > 0
      }
      return false
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading Assessment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Assessment Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (completed && submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <FaCheckCircle className="mx-auto h-20 w-20 text-green-600 mb-6" />
            <h2 className="text-2xl font-bold text-green-800 mb-4">Assessment Completed!</h2>
            <p className="text-green-700 mb-6">
              Thank you for completing the AgriProHub Fellowship assessment, {assessmentData?.invitation.first_name}!
            </p>

            {/* Results Summary */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{submissionResult.responses_submitted}</div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{assessmentData?.total_questions}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current Status</div>
                <div className="text-lg font-semibold text-orange-600">Under Review</div>
                <div className="text-xs text-gray-500 mt-1">
                  Your responses are being reviewed by our assessment team
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">What&apos;s Next?</h4>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Your responses will be reviewed by our expert panel</li>
                <li>• You will receive detailed feedback via email within 2-3 business days</li>
                <li>• If shortlisted, you may be invited for an interview</li>
                <li>• All candidates will receive their final results within 1 week</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                Return to AgriProHub
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Take Assessment Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!assessmentData) {
    return null
  }

  const currentQ = assessmentData.questions[currentQuestion]
  const answeredCount = getAnsweredCount()
  const progress = Math.round((answeredCount / assessmentData.total_questions) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AgriProHub Fellowship Assessment
              </h1>
              <p className="text-gray-600">
                Welcome, {assessmentData.invitation.first_name} {assessmentData.invitation.last_name}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500">
                <FaClock className="mr-1" />
                Expires: {new Date(assessmentData.invitation.expires_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{answeredCount} / {assessmentData.total_questions} questions answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {answeredCount < assessmentData.total_questions && (
              <div className="mt-2 text-xs text-orange-600">
                ⚠️ Complete all questions to submit the assessment
              </div>
            )}
            {answeredCount === assessmentData.total_questions && (
              <div className="mt-2 text-xs text-green-600">
                ✅ All questions answered! Ready to submit.
              </div>
            )}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600 uppercase tracking-wide">
                  Question {currentQuestion + 1} of {assessmentData.total_questions}
                </span>
                <span className="text-sm text-gray-500">
                  {currentQ.max_points} points
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                <span>Section: {currentQ.section.replace('_', ' ').toUpperCase()}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isQuestionAnswered(currentQ.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isQuestionAnswered(currentQ.id) ? '✓ Answered' : '○ Not Answered'}
                </span>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQ.question}
            </h2>

            {/* Question Content */}
            {currentQ.question_type === 'multiple_choice' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const currentResponse = responses.find(r => r.questionId === currentQ.id)
                  const isSelected = currentResponse?.responseText === option

                  return (
                    <button
                      key={index}
                      onClick={() => handleMultipleChoice(currentQ.id, option)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 mt-0.5 flex-shrink-0 ${
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {currentQ.question_type === 'essay' && (
              <div>
                <textarea
                  value={responses.find(r => r.questionId === currentQ.id)?.responseText || ''}
                  onChange={(e) => handleEssayResponse(currentQ.id, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {responses.find(r => r.questionId === currentQ.id)?.responseText?.length || 0} / 2000 characters
                </div>
              </div>
            )}

            {currentQ.question_type === 'ranking' && currentQ.options && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Rank the following initiatives by dragging them into priority order (1 = highest priority):
                </p>
                <div className="space-y-2">
                  {(() => {
                    const currentResponse = responses.find(r => r.questionId === currentQ.id)
                    const rankedOptions = currentResponse?.responseOptions?.length
                      ? currentResponse.responseOptions
                      : currentQ.options

                    return rankedOptions.map((option, index) => (
                      <div
                        key={option}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center p-3 rounded-lg cursor-move transition-all border-2 ${
                          draggedItem === index
                            ? 'bg-blue-100 border-blue-400 opacity-80 shadow-lg transform rotate-1'
                            : draggedItem !== null
                            ? 'bg-gray-50 border-blue-200 hover:bg-blue-50'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center mr-3">
                          <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="ml-2 text-gray-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4h14a1 1 0 010 2H3a1 1 0 010-2zM3 8h14a1 1 0 010 2H3a1 1 0 010-2zM3 12h14a1 1 0 010 2H3a1 1 0 010-2z"/>
                            </svg>
                          </div>
                        </div>
                        <span className="text-gray-700 flex-1">{option}</span>
                      </div>
                    ))
                  })()}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 mb-2">💡 <strong>Tip:</strong> Drag and drop the items to reorder them by priority</p>
                  <p className="text-xs text-blue-600">Higher priority items should be at the top (position 1)</p>
                  <p className="text-xs text-blue-700 mt-2">📝 <strong>Required:</strong> Also provide an explanation for your ranking</p>
                </div>
                <div className="mt-4">
                  <textarea
                    value={responses.find(r => r.questionId === currentQ.id)?.responseText || ''}
                    onChange={(e) => handleEssayResponse(currentQ.id, e.target.value)}
                    placeholder="Explain your ranking logic (50 words)..."
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
                    maxLength={300}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {responses.find(r => r.questionId === currentQ.id)?.responseText?.length || 0} / 300 characters
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft className="mr-2" />
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {assessmentData.total_questions}
          </div>

          {currentQuestion === assessmentData.total_questions - 1 ? (
            <button
              onClick={submitAssessment}
              disabled={submitting || answeredCount < assessmentData.total_questions}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(assessmentData.total_questions - 1, currentQuestion + 1))}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Next
              <FaChevronRight className="ml-2" />
            </button>
          )}
        </div>

        {/* Question Navigation Dots */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2 overflow-x-auto">
            {assessmentData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  index === currentQuestion
                    ? 'bg-green-600'
                    : isQuestionAnswered(assessmentData.questions[index].id)
                    ? 'bg-green-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
