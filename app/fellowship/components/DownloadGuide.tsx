'use client'

import { useState } from 'react'
import { FaDownload, FaSpinner } from 'react-icons/fa'

export default function DownloadGuide() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      
      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const lineHeight = 7
      let currentY = margin

      // Helper function to add page break if needed
      const checkPageBreak = (additionalHeight = lineHeight) => {
        if (currentY + additionalHeight > pageHeight - margin) {
          doc.addPage()
          currentY = margin
          return true
        }
        return false
      }

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, fontSize = 10, style = 'normal') => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', style)
        
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)
        
        for (const line of lines) {
          checkPageBreak()
          doc.text(line, margin, currentY)
          currentY += lineHeight
        }
        currentY += 3 // Extra spacing after paragraphs
      }

      // Helper function to add heading
      const addHeading = (text: string, level = 1) => {
        checkPageBreak(lineHeight * 2)
        currentY += 5
        
        const fontSize = level === 1 ? 16 : level === 2 ? 14 : 12
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(22, 101, 52) // Green color
        
        doc.text(text, margin, currentY)
        currentY += lineHeight * 1.5
        
        // Add underline for main headings
        if (level <= 2) {
          doc.setDrawColor(22, 163, 74)
          doc.setLineWidth(0.5)
          doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2)
          currentY += 5
        }
        
        doc.setTextColor(0, 0, 0) // Reset to black
      }

      // Start building the PDF content
      
      // Title page
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(22, 101, 52)
      doc.text('Agripro Fellowship Track Guide', pageWidth / 2, 50, { align: 'center' })
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'italic')
      doc.text('A Comprehensive Overview of the 6-Month', pageWidth / 2, 65, { align: 'center' })
      doc.text('Venture-Backed Agricultural Leadership Program', pageWidth / 2, 75, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text('© 2024 Agripro Hub', pageWidth / 2, 250, { align: 'center' })
      doc.text('Version 2.0 - December 2024', pageWidth / 2, 260, { align: 'center' })

      // Add new page for content
      doc.addPage()
      currentY = margin

      // Table of Contents
      addHeading('Table of Contents')
      
      const tocItems = [
        '1. Program Overview',
        '2. Selection Criteria & Rubric',
        '3. Application Process & Timeline',
        '4. Curriculum Structure',
        '5. Project Examples',
        '6. Placement Organizations',
        '7. Tools & Methods',
        '8. Expected Outcomes',
        '9. Benefits & Career Paths',
        '10. Frequently Asked Questions',
        '11. Application Tips',
        '12. Contact Information'
      ]
      
      tocItems.forEach(item => {
        addWrappedText(item, 10)
      })

      // Program Overview
      doc.addPage()
      currentY = margin
      
      addHeading('1. Program Overview')
      
      addWrappedText('The Agripro Fellowship Track addresses Africa\'s $75B annual food import gap by developing the next generation of agricultural leaders. Fellows gain hands-on experience building solutions across the agricultural value chain—from farm inputs to market access.')
      
      addHeading('Key Statistics', 2)
      addWrappedText('• Duration: 6 months (October 2025 - March 2026)')
      addWrappedText('• Cohort Size: 20+ carefully selected fellows')
      addWrappedText('• Placement Rate: 95% of fellows receive job offers')
      addWrappedText('• Partner Organizations: 15+ agribusiness companies')
      addWrappedText('• Project Impact: 30% average reduction in post-harvest losses')

      addHeading('Program Structure', 2)
      addWrappedText('Weeks 1-2: Intensive Launchpad', 11, 'bold')
      addWrappedText('• African food systems & value-chain economics')
      addWrappedText('• Field UX & last-mile product design')
      addWrappedText('• Data collection (ODK/Kobo), QGIS basics')
      addWrappedText('• Unit economics for agricultural ventures')
      addWrappedText('• Climate risk, storage, and quality management')

      addWrappedText('Weeks 3-26: Project Execution', 11, 'bold')
      addWrappedText('• Weekly skill sprints and workshops')
      addWrappedText('• Hands-on project work with mentor support')
      addWrappedText('• Field visits and farmer engagement')
      addWrappedText('• Regular retrospectives and peer learning')

      // Selection Criteria
      doc.addPage()
      currentY = margin
      
      addHeading('2. Selection Criteria & Rubric (100 Points Total)')
      
      const criteria = [
        { name: 'Leadership & Ownership', points: '20 points', desc: 'Initiative, accountability, and ability to drive projects forward' },
        { name: 'Problem-Solving & Analytical Rigor', points: '20 points', desc: 'Data-driven thinking and systematic approach to challenges' },
        { name: 'Execution Velocity', points: '20 points', desc: 'Speed and quality of implementation' },
        { name: 'Communication & Stakeholder Management', points: '15 points', desc: 'Ability to work with farmers, executives, and partners' },
        { name: 'Mission Fit & Grit', points: '15 points', desc: 'Passion for agriculture and resilience in challenging environments' },
        { name: 'Track Skills', points: '10 points', desc: 'Operations, data, or product experience in agricultural contexts' }
      ]

      criteria.forEach(criterion => {
        addWrappedText(`${criterion.name} (${criterion.points})`, 11, 'bold')
        addWrappedText(criterion.desc)
        currentY += 3
      })

      // Application Timeline
      doc.addPage()
      currentY = margin
      
      addHeading('3. Application Process & Timeline')
      
      addHeading('Phase 1: Digital Application', 2)
      addWrappedText('Deadline: October 24, 2025 (11:59 PM GMT)', 10, 'bold')
      addWrappedText('• Complete online application form')
      addWrappedText('• Submit 3 essays (motivation, problem-solving, career goals)')
      addWrappedText('• Upload CV/resume and transcript')
      addWrappedText('• Record 90-second video introduction')
      addWrappedText('• Provide 2 professional/academic references')

      addHeading('Phase 2: Virtual Assessment', 2)
      addWrappedText('Dates: October 27-30, 2025', 10, 'bold')
      addWrappedText('• Case study analysis (agricultural supply chain scenario)')
      addWrappedText('• Group collaboration task')
      addWrappedText('• Data interpretation exercise')
      addWrappedText('• 30-minute behavioral interview')

      addHeading('Phase 3: Final Panel & Placement', 2)
      addWrappedText('Dates: October 31, 2025', 10, 'bold')
      addWrappedText('• Panel interview with program and partner representatives')
      addWrappedText('• Reference checks conducted')
      addWrappedText('• Placement matching based on skills and company needs')
      addWrappedText('• Final decisions communicated October 31')

      // Project Examples
      doc.addPage()
      currentY = margin
      
      addHeading('4. Project Examples')
      
      const projects = [
        {
          title: 'Market Linkages Project',
          objective: 'Design and pilot a buyer-farmer matching workflow',
          outcomes: '• 15-25% improvement in farmer prices\n• 30-40% reduction in buyer sourcing time\n• Scalable process documented for replication'
        },
        {
          title: 'Post-Harvest Loss Reduction',
          objective: 'Build a cold-chain or storage utilization model',
          outcomes: '• 20-30% reduction in post-harvest losses\n• Improved product quality and shelf life\n• Farmer training materials and protocols'
        },
        {
          title: 'Ag-Fintech Project',
          objective: 'Prototype a micro-credit risk score using farm, weather, and repayment data',
          outcomes: '• Improved loan approval rates for creditworthy farmers\n• Reduced default rates for lending partners\n• Data-driven credit scoring model'
        }
      ]

      projects.forEach(project => {
        addWrappedText(project.title, 12, 'bold')
        addWrappedText(`Objective: ${project.objective}`)
        addWrappedText('Expected Outcomes:')
        addWrappedText(project.outcomes)
        currentY += 5
      })

      // Tools & Methods
      doc.addPage()
      currentY = margin
      
      addHeading('5. Tools & Methods')
      
      addHeading('Field & Operations Tools', 2)
      addWrappedText('• ODK/KoboToolbox: Mobile data collection forms')
      addWrappedText('• WhatsApp Workflows: Farmer communication and support')
      addWrappedText('• USSD/SMS Flows: Feature phone compatibility')

      addHeading('Data Analysis Tools', 2)
      addWrappedText('• Excel/Google Sheets: Data cleaning and basic analysis')
      addWrappedText('• Power BI: Interactive dashboard creation')
      addWrappedText('• QGIS: Geographic information systems and mapping')

      addHeading('Product & Delivery Methods', 2)
      addWrappedText('• Agile Methodology: Sprint planning and execution')
      addWrappedText('• Product Requirements Documents (PRDs)')
      addWrappedText('• OKRs (Objectives & Key Results)')
      addWrappedText('• Experiment Logs: Hypothesis testing and validation')

      // Expected Outcomes
      doc.addPage()
      currentY = margin
      
      addHeading('6. Expected Outcomes')
      
      addHeading('Individual Fellow Outcomes', 2)
      addWrappedText('• Verified Impact Portfolio: 3-5 shipped artifacts with quantified results')
      addWrappedText('• Skill Badges & Certifications in market access, supply chain ops, ag-fintech')
      addWrappedText('• Career Velocity Enhancement: Direct job placement (65% of fellows)')
      addWrappedText('• Professional Network: Access to 200+ alumni network')

      addHeading('Program-Level Impact Targets', 2)
      addWrappedText('• 2,000+ farmers directly reached through fellow projects')
      addWrappedText('• 25% average increase in farmer incomes')
      addWrappedText('• 30% reduction in post-harvest losses')
      addWrappedText('• 50% improvement in market access efficiency')

      // Career Paths
      doc.addPage()
      currentY = margin
      
      addHeading('7. Career Paths & Benefits')
      
      addHeading('Immediate Program Benefits', 2)
      addWrappedText('• Placement-specific compensation (varies by partner)')
      addWrappedText('• Transportation and field work allowances')
      addWrappedText('• Professional development stipend')
      addWrappedText('• Conference and training attendance support')

      addHeading('Long-Term Career Paths', 2)
      addWrappedText('• Agtech Startup Ecosystem: Product manager and operations roles')
      addWrappedText('• Agricultural Finance & Investment: Impact investment and microfinance')
      addWrappedText('• Supply Chain & Logistics: Management and optimization roles')
      addWrappedText('• Development Organizations: Program management and field operations')
      addWrappedText('• Government & Policy: Agricultural ministry and rural development')

      // FAQ
      doc.addPage()
      currentY = margin
      
      addHeading('8. Frequently Asked Questions')
      
      const faqs = [
        {
          q: 'Do I need an agricultural background?',
          a: 'No! We welcome applicants from diverse backgrounds. What matters most is problem-solving ability and passion for agricultural development.'
        },
        {
          q: 'How much field work is involved?',
          a: 'Expect 20-30% of your time in field settings, including farmer visits, market research, and data collection in rural areas.'
        },
        {
          q: 'Is this a paid fellowship?',
          a: 'Compensation varies by placement partner. Some offer salaries, others provide stipends, and some include equity or performance-based payments.'
        },
        {
          q: 'What happens after the fellowship?',
          a: '95% of fellows receive job offers from their placement companies or network partners. We provide ongoing career support and alumni network access.'
        }
      ]

      faqs.forEach(faq => {
        addWrappedText(`Q: ${faq.q}`, 10, 'bold')
        addWrappedText(`A: ${faq.a}`)
        currentY += 3
      })

      // Application Tips
      doc.addPage()
      currentY = margin
      
      addHeading('9. Application Tips')
      
      addHeading('Essay Writing Guidelines', 2)
      addWrappedText('Motivation Essay (500 words max):', 10, 'bold')
      addWrappedText('• Start with a specific story that sparked your interest')
      addWrappedText('• Demonstrate understanding of agricultural challenges in Africa')
      addWrappedText('• Be specific about what you hope to contribute and achieve')

      addWrappedText('Problem-Solving Example (400 words max):', 10, 'bold')
      addWrappedText('• Choose a specific, complex challenge you personally solved')
      addWrappedText('• Use the STAR method (Situation, Task, Action, Result)')
      addWrappedText('• Include quantifiable outcomes and lessons learned')

      addHeading('Video Introduction Best Practices', 2)
      addWrappedText('• 30 seconds: Personal introduction and background')
      addWrappedText('• 45 seconds: Why agricultural development matters to you')
      addWrappedText('• 15 seconds: What you hope to contribute')
      addWrappedText('• Good lighting and clear audio are essential')
      addWrappedText('• Practice several times to stay within 90 seconds')

      // Contact Information
      doc.addPage()
      currentY = margin
      
      addHeading('10. Contact Information')
      
      addWrappedText('Fellowship Program Team:', 10, 'bold')
      addWrappedText('Email: fellowship@agriprohub.com')
      addWrappedText('Website: https://agriprohub.com/fellowship')
      addWrappedText('Application Portal: https://agriprohub.com/fellowship/apply')

      addHeading('Important Deadlines (2025)', 2)
      addWrappedText('• Applications Open: October 10, 2025')
      addWrappedText('• Application Deadline: October 24, 2025 (11:59 PM GMT)')
      addWrappedText('• Virtual Assessments: October 27-30, 2025')
      addWrappedText('• Final Decisions: October 31, 2025')
      addWrappedText('• Program Lunch: November 3, 2025')

      currentY += 20
      addWrappedText('This comprehensive guide provides all the information needed to understand and apply for the Agripro Fellowship Track. For the most current information and to submit your application, visit our website or contact the fellowship team directly.')

      // Add footer to last page
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('© 2024 Agripro Hub. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Save the PDF
      doc.save('agripro-fellowship-guide.pdf')
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF. Please try again or contact support.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button 
      onClick={generatePDF}
      disabled={isGenerating}
      className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <FaSpinner className="animate-spin mr-2" />
          Generating PDF...
        </>
      ) : (
        <>
          <FaDownload className="mr-2" />
          Download PDF
        </>
      )}
    </button>
  )
}
