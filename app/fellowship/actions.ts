'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com']

interface FellowshipApplicationData {
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
  currentStatus: string
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

export async function submitFellowshipApplication(data: FellowshipApplicationData) {
  try {
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.motivationEssay || !data.videoUrl) {
      return {
        success: false,
        error: 'Please fill in all required fields.'
      }
    }

    if (!data.commitmentAgreement || !data.dataConsent) {
      return {
        success: false,
        error: 'Please accept the required agreements.'
      }
    }

    // Create admin notification email
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #166534; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
          🌾 New Agripro Fellowship Application
        </h1>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">Applicant Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.firstName} ${data.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Phone:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Location:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.currentLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Nationality:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.nationality}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">Education & Experience</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Education:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.education}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Graduation Year:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.graduationYear}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Current Status:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.currentStatus}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Preferred Placement:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.preferredPlacement || 'No preference'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Available From:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.availabilityStart}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">Skills</h2>
          <div style="margin-bottom: 15px;">
            <strong>Technical Skills:</strong><br>
            ${data.technicalSkills.length > 0 ? data.technicalSkills.join(', ') : 'None specified'}
          </div>
          <div>
            <strong>Language Skills:</strong><br>
            ${data.languageSkills.length > 0 ? data.languageSkills.join(', ') : 'None specified'}
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">Essays</h2>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #166534; margin-bottom: 10px;">Motivation Essay:</h3>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #16a34a; white-space: pre-wrap;">
${data.motivationEssay}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #166534; margin-bottom: 10px;">Problem-Solving Example:</h3>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #16a34a; white-space: pre-wrap;">
${data.problemSolvingExample}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #166534; margin-bottom: 10px;">Career Goals:</h3>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #16a34a; white-space: pre-wrap;">
${data.careerGoals}
            </div>
          </div>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #166534; margin-top: 0;">Experience & References</h2>
          
          ${data.previousExperience ? `
          <div style="margin-bottom: 15px;">
            <strong>Previous Experience:</strong><br>
            <div style="white-space: pre-wrap; margin-top: 5px;">${data.previousExperience}</div>
          </div>
          ` : ''}

          ${data.relevantExperience ? `
          <div style="margin-bottom: 15px;">
            <strong>Agricultural Experience:</strong><br>
            <div style="white-space: pre-wrap; margin-top: 5px;">${data.relevantExperience}</div>
          </div>
          ` : ''}

          <div style="margin-bottom: 15px;">
            <strong>Reference 1:</strong> ${data.reference1Name} (${data.reference1Relationship}) - ${data.reference1Email}
          </div>
          <div>
            <strong>Reference 2:</strong> ${data.reference2Name} (${data.reference2Relationship}) - ${data.reference2Email}
          </div>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #92400e; margin-top: 0;">📹 Video Introduction</h2>
          <p><strong>Video URL:</strong> <a href="${data.videoUrl}" target="_blank" style="color: #16a34a;">${data.videoUrl}</a></p>
        </div>

        ${data.accommodationNeeds ? `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; margin-top: 0;">Special Accommodations</h2>
          <div style="white-space: pre-wrap;">${data.accommodationNeeds}</div>
        </div>
        ` : ''}

        <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0277bd;">
            <strong>Next Steps:</strong> Please review this application and schedule an assessment if the candidate meets our criteria.
          </p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          This is an automated notification from the Agripro Fellowship application system.
        </p>
      </div>
    `

    // Send notification to admin
    await resend.emails.send({
      from: 'Agripro Fellowship <onboarding@resend.dev>',
      to: ADMIN_EMAILS,
      subject: `🌾 New Fellowship Application: ${data.firstName} ${data.lastName}`,
      html: adminEmailHtml,
    })

    // Send confirmation to applicant
    const confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Application Received!</h1>
          <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">Thank you for applying to the Agripro Fellowship</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${data.firstName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            We have successfully received your application for the <strong>Agripro Fellowship Track</strong>. 
            Thank you for your interest in building solutions that transform African agriculture!
          </p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #166534; margin: 0 0 15px 0;">What happens next?</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>Assessment Phase:</strong> Sept 20–28, 2025</li>
              <li style="margin-bottom: 8px;"><strong>Final Decisions:</strong> Sept 30, 2025</li>
              <li style="margin-bottom: 8px;"><strong>Program Launch:</strong> Oct 2, 2025</li>
            </ul>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">Application Summary</h3>
            <p style="color: #451a03; margin: 0; font-size: 14px;">
              <strong>Application ID:</strong> AGRIPRO-${Date.now()}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}<br>
              <strong>Preferred Placement:</strong> ${data.preferredPlacement || 'No preference'}<br>
              <strong>Available From:</strong> ${new Date(data.availabilityStart).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            We're impressed by the talent and passion from applicants across Africa. Our team will carefully review 
            your application, essays, and video introduction. Selected candidates will be invited to virtual 
            assessments where you'll work through real agribusiness scenarios.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://agriprohub.com/fellowship" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Learn More About the Fellowship
            </a>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
            <strong>Questions?</strong> Reach out to us at 
            <a href="mailto:fellowship@agriprohub.com" style="color: #16a34a;">fellowship@agriprohub.com</a>
          </p>
          
          <p style="font-size: 16px; color: #166534; margin-top: 30px;">
            Best regards,<br>
            <strong>The Agripro Fellowship Team</strong>
          </p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: 'Agripro Fellowship <onboarding@resend.dev>',
      to: [data.email],
      subject: '🌾 Your Agripro Fellowship Application - Confirmed',
      html: confirmationEmailHtml,
    })

    // Send reference notification emails
    const referenceEmailHtml = (referenceName: string, applicantName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Reference Request</h1>
          <p style="color: #bbf7d0; margin: 10px 0 0 0;">Agripro Fellowship Program</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${referenceName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            <strong>${applicantName}</strong> has applied for the Agripro Fellowship Track and listed you as a reference. 
            The Agripro Fellowship is a 6-month, venture-backed program that develops the next generation of 
            agricultural leaders in Africa.
          </p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #166534; margin: 0 0 10px 0;">About the Fellowship</h3>
            <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
              Fellows work on real projects across agricultural value chains, from farm inputs to market access, 
              gaining hands-on experience with agtech, supply chain operations, and ag-fintech solutions.
            </p>
          </div>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            We will contact you separately within the next few days if ${applicantName} advances to the reference 
            check stage. No action is required from you at this time.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://agriprohub.com/fellowship" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Learn More About the Program
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
            <strong>Questions?</strong> Contact us at 
            <a href="mailto:fellowship@agriprohub.com" style="color: #16a34a;">fellowship@agriprohub.com</a>
          </p>
          
          <p style="font-size: 16px; color: #166534; margin-top: 30px;">
            Best regards,<br>
            <strong>The Agripro Fellowship Team</strong>
          </p>
        </div>
      </div>
    `

    // Send reference notifications
    await Promise.all([
      resend.emails.send({
        from: 'Agripro Fellowship <onboarding@resend.dev>',
        to: [data.reference1Email],
        subject: `Reference Request: ${data.firstName} ${data.lastName} - Agripro Fellowship`,
        html: referenceEmailHtml(data.reference1Name, `${data.firstName} ${data.lastName}`),
      }),
      resend.emails.send({
        from: 'Agripro Fellowship <onboarding@resend.dev>',
        to: [data.reference2Email],
        subject: `Reference Request: ${data.firstName} ${data.lastName} - Agripro Fellowship`,
        html: referenceEmailHtml(data.reference2Name, `${data.firstName} ${data.lastName}`),
      })
    ])

    return { 
      success: true, 
      message: 'Your application has been submitted successfully! Please check your email for confirmation.' 
    }
  } catch (error) {
    console.error('Fellowship application submission error:', error)
    return { 
      success: false, 
      error: 'Failed to submit application. Please try again or contact us directly.' 
    }
  }
}

interface WaitlistData {
  firstName: string
  lastName: string
  email: string
  graduationYear: string
  interests: string
}

export async function submitWaitlistSignup(data: WaitlistData) {
  try {
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return {
        success: false,
        error: 'Please fill in all required fields.'
      }
    }

    // Send notification to admin
    await resend.emails.send({
      from: 'Agripro Fellowship <onboarding@resend.dev>',
      to: ADMIN_EMAILS,
      subject: `🌾 New Fellowship Waitlist Signup: ${data.firstName} ${data.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #166534; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
            New Fellowship Waitlist Signup
          </h1>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.firstName} ${data.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Graduation Year:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${data.graduationYear || 'Not specified'}</td>
              </tr>
            </table>
          </div>

          ${data.interests ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">Interests:</h3>
            <div style="white-space: pre-wrap;">${data.interests}</div>
          </div>
          ` : ''}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            Fellowship waitlist signup notification
          </p>
        </div>
      `,
    })

    // Send confirmation to user
    await resend.emails.send({
      from: 'Agripro Fellowship <onboarding@resend.dev>',
      to: [data.email],
      subject: '🌾 Welcome to the Agripro Fellowship Waitlist',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">You're on the Waitlist!</h1>
            <p style="color: #bbf7d0; margin: 10px 0 0 0;">Agripro Fellowship Program</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Dear ${data.firstName},
            </p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in the <strong>Agripro Fellowship Track</strong>! 
              You're now on our waitlist and will be among the first to know about:
            </p>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Fellowship application opening dates</li>
                <li style="margin-bottom: 8px;">Exclusive prep materials and resources</li>
                <li style="margin-bottom: 8px;">Information sessions and webinars</li>
                <li style="margin-bottom: 8px;">Partner organization spotlights</li>
                <li style="margin-bottom: 8px;">Program updates and curriculum details</li>
              </ul>
            </div>

            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
              In the meantime, we encourage you to explore our Knowledge Hub and start building 
              relevant skills in agricultural data analysis, market research, and supply chain operations.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://agriprohub.com/knowledgehub" 
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                Explore Knowledge Hub
              </a>
              <a href="https://agriprohub.com/fellowship" 
                 style="background-color: transparent; color: #16a34a; padding: 12px 24px; text-decoration: none; border: 2px solid #16a34a; border-radius: 6px; font-weight: bold; display: inline-block;">
                Learn More
              </a>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
              <strong>Questions?</strong> Feel free to reach out at 
              <a href="mailto:fellowship@agriprohub.com" style="color: #16a34a;">fellowship@agriprohub.com</a>
            </p>
            
            <p style="font-size: 16px; color: #166534; margin-top: 30px;">
              Best regards,<br>
              <strong>The Agripro Fellowship Team</strong>
            </p>
          </div>
        </div>
      `
    })

    return { 
      success: true, 
      message: 'Thank you for joining our waitlist! Check your email for confirmation.' 
    }
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return { 
      success: false, 
      error: 'Failed to join waitlist. Please try again.' 
    }
  }
}
