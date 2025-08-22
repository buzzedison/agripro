'use client'

import { useState } from 'react'
import { submitFellowshipApplication } from '../actions'
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaUpload, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  currentLocation: string
  
  // Education & Experience
  education: string
  graduationYear: string
  currentStatus: string // student, recent grad, other
  previousExperience: string
  
  // Skills & Background
  technicalSkills: string[]
  languageSkills: string[]
  relevantExperience: string
  
  // Essays
  motivationEssay: string
  problemSolvingExample: string
  careerGoals: string
  
  // Preferences
  preferredPlacement: string
  availabilityStart: string
  accommodationNeeds: string
  
  // Documents
  resumeFile: File | null
  transcriptFile: File | null
  videoUrl: string
  
  // References
  reference1Name: string
  reference1Email: string
  reference1Relationship: string
  reference2Name: string
  reference2Email: string
  reference2Relationship: string
  
  // Agreements
  commitmentAgreement: boolean
  dataConsent: boolean
}

export default function FellowshipApplication() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    currentLocation: '',
    education: '',
    graduationYear: '',
    currentStatus: '',
    previousExperience: '',
    technicalSkills: [],
    languageSkills: [],
    relevantExperience: '',
    motivationEssay: '',
    problemSolvingExample: '',
    careerGoals: '',
    preferredPlacement: '',
    availabilityStart: '',
    accommodationNeeds: '',
    resumeFile: null,
    transcriptFile: null,
    videoUrl: '',
    reference1Name: '',
    reference1Email: '',
    reference1Relationship: '',
    reference2Name: '',
    reference2Email: '',
    reference2Relationship: '',
    commitmentAgreement: false,
    dataConsent: false
  })

  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string }>({})

  const sections = [
    'Personal Information',
    'Education & Experience', 
    'Skills & Background',
    'Essays',
    'Placement Preferences',
    'Documents',
    'References',
    'Review & Submit'
  ]

  const technicalSkillOptions = [
    'Data Analysis (Excel/Sheets)',
    'GIS/Mapping (QGIS)',
    'Data Collection (ODK/Kobo)',
    'Dashboard Creation',
    'Programming (Python/R)',
    'Database Management',
    'Mobile App Development',
    'Web Development',
    'Project Management',
    'Financial Modeling'
  ]

  const languageOptions = [
    'English',
    'French', 
    'Arabic',
    'Swahili',
    'Hausa',
    'Yoruba',
    'Twi',
    'Amharic',
    'Portuguese',
    'Local dialect (specify)'
  ]

  const handleSkillToggle = (skill: string, type: 'technical' | 'language') => {
    const key = type === 'technical' ? 'technicalSkills' : 'languageSkills'
    const currentSkills = formData[key]
    
    if (currentSkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [key]: currentSkills.filter(s => s !== skill)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [key]: [...currentSkills, skill]
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, [fieldName]: file }))
  }

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'nationality', 
      'currentLocation', 'education', 'graduationYear', 'currentStatus',
      'motivationEssay', 'problemSolvingExample', 'careerGoals', 'videoUrl',
      'reference1Name', 'reference1Email', 'reference1Relationship',
      'reference2Name', 'reference2Email', 'reference2Relationship',
      'availabilityStart'
    ]
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData])
    
    if (missingFields.length > 0) {
      return { isValid: false, message: `Please fill in these required fields: ${missingFields.join(', ')}` }
    }
    
    if (!formData.commitmentAgreement || !formData.dataConsent) {
      return { isValid: false, message: 'Please accept both required agreements to submit your application.' }
    }
    
    if (!formData.resumeFile) {
      return { isValid: false, message: 'Please upload your resume/CV before submitting.' }
    }

    // Validate and format video URL
    if (formData.videoUrl) {
      let videoUrl = formData.videoUrl.trim()
      if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
        videoUrl = 'https://' + videoUrl
      }
      
      // Basic URL validation
      try {
        new URL(videoUrl)
        // Update the form data with the properly formatted URL
        setFormData(prev => ({ ...prev, videoUrl }))
      } catch {
        return { isValid: false, message: 'Please provide a valid video URL (e.g., https://youtube.com/watch?v=...).' }
      }
    }
    
    return { isValid: true, message: '' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validate form before submission
    const validation = validateForm()
    if (!validation.isValid) {
      setSubmitStatus({
        success: false,
        message: validation.message
      })
      setIsSubmitting(false)
      return
    }
    
    try {
      // Convert File objects to strings for server action (we'll handle file uploads separately)
      const submissionData = {
        ...formData,
        resumeFile: formData.resumeFile ? formData.resumeFile.name : null,
        transcriptFile: formData.transcriptFile ? formData.transcriptFile.name : null,
      }
      
      const result = await submitFellowshipApplication(submissionData)
      console.log('Submission result:', result)
      
      if (!result) {
        setSubmitStatus({
          success: false,
          message: 'No response received from server. Please try again.'
        })
        return
      }
      
      setSubmitStatus(result)
      
      if (result.success) {
        // Reset form or redirect
        setTimeout(() => {
          window.location.href = '/fellowship/confirmation'
        }, 2000)
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus({
        success: false,
        message: `Submission failed: ${error instanceof Error ? error.message : 'Please try again or contact fellowship@agriprohub.com'}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Personal Information</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
          <input
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
          <input
            type="text"
            required
            value={formData.nationality}
            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Location *</label>
          <input
            type="text"
            required
            value={formData.currentLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
    </div>
  )

  const renderEducationExperience = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Education & Experience</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Highest Education Level *</label>
        <select
          required
          value={formData.education}
          onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select education level</option>
          <option value="high-school">High School</option>
          <option value="associate">Associate Degree</option>
          <option value="bachelor">Bachelor&apos;s Degree</option>
          <option value="master">Master&apos;s Degree</option>
          <option value="phd">PhD</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year *</label>
          <input
            type="number"
            required
            min="2020"
            max="2027"
            value={formData.graduationYear}
            onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Status *</label>
          <select
            required
            value={formData.currentStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select status</option>
            <option value="student">Current Student</option>
            <option value="recent-grad">Recent Graduate (≤2 years)</option>
            <option value="working">Working Professional</option>
            <option value="unemployed">Seeking Opportunities</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Previous Work/Internship Experience</label>
        <textarea
          rows={4}
          value={formData.previousExperience}
          onChange={(e) => setFormData(prev => ({ ...prev, previousExperience: e.target.value }))}
          placeholder="Describe any previous work experience, internships, or projects..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
  )

  const renderSkillsBackground = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Skills & Background</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Technical Skills (Select all that apply)</label>
        <div className="grid md:grid-cols-2 gap-3">
          {technicalSkillOptions.map(skill => (
            <label key={skill} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.technicalSkills.includes(skill)}
                onChange={() => handleSkillToggle(skill, 'technical')}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Language Skills (Select all that apply)</label>
        <div className="grid md:grid-cols-2 gap-3">
          {languageOptions.map(language => (
            <label key={language} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.languageSkills.includes(language)}
                onChange={() => handleSkillToggle(language, 'language')}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{language}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relevant Experience with Agriculture/Rural Development
        </label>
        <textarea
          rows={4}
          value={formData.relevantExperience}
          onChange={(e) => setFormData(prev => ({ ...prev, relevantExperience: e.target.value }))}
          placeholder="Describe any experience with farming, agricultural projects, rural communities, co-ops, etc..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
  )

  const renderEssays = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Essays</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Motivation Essay (500 words max) *
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Why are you interested in the Agripro Fellowship? What drives your passion for agricultural development in Africa?
        </p>
        <textarea
          rows={8}
          required
          maxLength={3000}
          value={formData.motivationEssay}
          onChange={(e) => setFormData(prev => ({ ...prev, motivationEssay: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
        <p className="text-sm text-gray-500 mt-1">{formData.motivationEssay.length}/3000 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Problem-Solving Example (400 words max) *
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Describe a specific challenge you&apos;ve faced and how you solved it. What was your approach and what did you learn?
        </p>
        <textarea
          rows={6}
          required
          maxLength={2400}
          value={formData.problemSolvingExample}
          onChange={(e) => setFormData(prev => ({ ...prev, problemSolvingExample: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
        <p className="text-sm text-gray-500 mt-1">{formData.problemSolvingExample.length}/2400 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Career Goals (300 words max) *
        </label>
        <p className="text-sm text-gray-600 mb-3">
          What are your short-term and long-term career goals? How does this fellowship fit into your plans?
        </p>
        <textarea
          rows={5}
          required
          maxLength={1800}
          value={formData.careerGoals}
          onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
        <p className="text-sm text-gray-500 mt-1">{formData.careerGoals.length}/1800 characters</p>
      </div>
    </div>
  )

  const renderPreferences = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Placement Preferences</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Placement Type</label>
        <select
          value={formData.preferredPlacement}
          onChange={(e) => setFormData(prev => ({ ...prev, preferredPlacement: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        >
          <option value="">No preference</option>
          <option value="internal">Internal Venture (Agripro)</option>
          <option value="agribusiness">Agribusiness Processor</option>
          <option value="distributor">Distributor/Logistics</option>
          <option value="fintech">Ag-Fintech</option>
          <option value="social-enterprise">Social Enterprise</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Earliest Availability Start Date *</label>
        <input
          type="date"
          required
          value={formData.availabilityStart}
          onChange={(e) => setFormData(prev => ({ ...prev, availabilityStart: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation/Special Needs</label>
        <textarea
          rows={3}
          value={formData.accommodationNeeds}
          onChange={(e) => setFormData(prev => ({ ...prev, accommodationNeeds: e.target.value }))}
          placeholder="Any special accommodation needs or considerations..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Documents</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV *</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FaUpload className="mx-auto text-gray-400 text-2xl mb-3" />
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileChange(e, 'resumeFile')}
            className="hidden"
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <span className="text-green-600 hover:text-green-700">Click to upload</span>
            <span className="text-gray-600"> your resume (PDF, DOC, DOCX)</span>
          </label>
          {formData.resumeFile && (
            <p className="text-sm text-green-600 mt-2">✓ {formData.resumeFile.name}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Academic Transcript (Optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FaUpload className="mx-auto text-gray-400 text-2xl mb-3" />
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, 'transcriptFile')}
            className="hidden"
            id="transcript-upload"
          />
          <label htmlFor="transcript-upload" className="cursor-pointer">
            <span className="text-green-600 hover:text-green-700">Click to upload</span>
            <span className="text-gray-600"> your transcript (PDF)</span>
          </label>
          {formData.transcriptFile && (
            <p className="text-sm text-green-600 mt-2">✓ {formData.transcriptFile.name}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          90-Second Introduction Video *
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Upload your video to YouTube, Vimeo, or Google Drive and share the link here. 
          Tell us about yourself, your passion for agriculture, and why you&apos;re applying.
        </p>
        <input
          type="url"
          required
          value={formData.videoUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
          placeholder="https://..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </div>
  )

  const renderReferences = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">References</h2>
      <p className="text-gray-600 mb-6">Please provide two professional or academic references.</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Reference 1 *</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.reference1Name}
              onChange={(e) => setFormData(prev => ({ ...prev, reference1Name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.reference1Email}
              onChange={(e) => setFormData(prev => ({ ...prev, reference1Email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
            <input
              type="text"
              required
              value={formData.reference1Relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, reference1Relationship: e.target.value }))}
              placeholder="e.g., Professor, Supervisor, Mentor"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Reference 2 *</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.reference2Name}
              onChange={(e) => setFormData(prev => ({ ...prev, reference2Name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.reference2Email}
              onChange={(e) => setFormData(prev => ({ ...prev, reference2Email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
            <input
              type="text"
              required
              value={formData.reference2Relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, reference2Relationship: e.target.value }))}
              placeholder="e.g., Professor, Supervisor, Mentor"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderReviewSubmit = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Review & Submit</h2>
      
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Application Summary</h3>
        
        {/* Personal Information */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Personal Information</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Location:</strong> {formData.currentLocation}</p>
            </div>
            <div>
              <p><strong>Nationality:</strong> {formData.nationality}</p>
              <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
              <p><strong>Education:</strong> {formData.education}</p>
              <p><strong>Status:</strong> {formData.currentStatus}</p>
            </div>
          </div>
        </div>

        {/* Skills & Experience */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Skills & Experience</h4>
          <div className="text-sm space-y-2">
            <p><strong>Technical Skills:</strong> {formData.technicalSkills.length > 0 ? formData.technicalSkills.join(', ') : 'None selected'}</p>
            <p><strong>Languages:</strong> {formData.languageSkills.length > 0 ? formData.languageSkills.join(', ') : 'None selected'}</p>
            <p><strong>Previous Experience:</strong> {formData.previousExperience || 'Not provided'}</p>
          </div>
        </div>

        {/* Essays */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Essays</h4>
          <div className="text-sm space-y-2">
            <p><strong>Motivation Essay:</strong> {formData.motivationEssay ? `${formData.motivationEssay.substring(0, 100)}...` : 'Not completed'}</p>
            <p><strong>Problem-Solving Example:</strong> {formData.problemSolvingExample ? `${formData.problemSolvingExample.substring(0, 100)}...` : 'Not completed'}</p>
            <p><strong>Career Goals:</strong> {formData.careerGoals ? `${formData.careerGoals.substring(0, 100)}...` : 'Not completed'}</p>
          </div>
        </div>

        {/* Documents & References */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Documents & References</h4>
          <div className="text-sm space-y-2">
            <p><strong>Resume:</strong> {formData.resumeFile ? formData.resumeFile.name : 'Not uploaded'}</p>
            <p><strong>Transcript:</strong> {formData.transcriptFile ? formData.transcriptFile.name : 'Not uploaded'}</p>
            <p><strong>Video URL:</strong> {formData.videoUrl || 'Not provided'}</p>
            <p><strong>References:</strong> {formData.reference1Name} & {formData.reference2Name}</p>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Preferences</h4>
          <div className="text-sm space-y-2">
            <p><strong>Preferred Placement:</strong> {formData.preferredPlacement || 'No preference'}</p>
            <p><strong>Available From:</strong> {formData.availabilityStart}</p>
            <p><strong>Special Accommodations:</strong> {formData.accommodationNeeds || 'None'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            required
            checked={formData.commitmentAgreement}
            onChange={(e) => setFormData(prev => ({ ...prev, commitmentAgreement: e.target.checked }))}
            className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            I understand this is a 6-month commitment and I am available to participate fully in the program, including field work, virtual sessions, and project deliverables. *
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            required
            checked={formData.dataConsent}
            onChange={(e) => setFormData(prev => ({ ...prev, dataConsent: e.target.checked }))}
            className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            I consent to Agripro and Taskwit processing my personal data for the fellowship application and program administration. I understand my data will be handled according to privacy policies. *
          </span>
        </label>
      </div>

      {submitStatus.message && (
        <div className={`p-4 rounded-lg ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submitStatus.message}
        </div>
      )}
    </div>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderPersonalInfo()
      case 1: return renderEducationExperience()
      case 2: return renderSkillsBackground()
      case 3: return renderEssays()
      case 4: return renderPreferences()
      case 5: return renderDocuments()
      case 6: return renderReferences()
      case 7: return renderReviewSubmit()
      default: return renderPersonalInfo()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Agripro Fellowship Application</h1>
          <p className="text-xl text-gray-600">Join the next generation of agricultural leaders</p>
          
          <div className="mt-8">
            <Link href="/fellowship" className="text-green-600 hover:text-green-700">
              ← Back to Fellowship Overview
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {sections.map((section, index) => (
              <div key={index} className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium ${
                  index <= currentSection ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <p className={`text-xs ${index <= currentSection ? 'text-green-600' : 'text-gray-500'}`}>
                  {section}
                </p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {renderCurrentSection()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevSection}
              disabled={currentSection === 0}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentSection === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={nextSection}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !formData.commitmentAgreement || !formData.dataConsent}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
