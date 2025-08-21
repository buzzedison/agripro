'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'edison@agriprohub.com'

interface FarmSmartFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  business: string
  experience: string
}

export async function submitFarmSmartForm(data: FarmSmartFormData) {
  try {
    // Send notification to admin
    const adminEmailResult = await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: '🌱 New Farm Forward Program Application',
      html: `
        <h1>New Farm Forward Program Application</h1>
        
        <h2>Applicant Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Agribusiness Type/Interest:</strong> ${data.business}</li>
          <li><strong>Experience Level:</strong> ${data.experience}</li>
        </ul>

        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from your Farm Forward application form at AgriPro Hub.
        </p>
      `,
    })
    
    console.log('Admin email sent:', adminEmailResult)

    // Send confirmation to applicant - with better error handling
    try {
      const userEmailResult = await resend.emails.send({
        from: 'Agripro Hub <onboarding@resend.dev>',
        to: [data.email],
        subject: 'Your Farm Forward Program Application',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://agriprohub.com/images/logo.png" alt="AgriPro Hub Logo" style="max-width: 150px;">
            </div>
            
            <h1 style="color: #2e7d32; text-align: center; margin-bottom: 30px;">Thank You for Your Application!</h1>
            
            <p>Dear ${data.firstName},</p>
            
            <p>Thank you for applying to the <strong>Farm Forward Agribusiness Planning Training Program</strong>. We've received your application and are excited about your interest in enhancing your agribusiness skills.</p>
            
            <p>Here's what happens next:</p>
            
            <ol>
              <li>Our team will review your application within 2-3 business days.</li>
              <li>You'll receive an email with further instructions, including payment details and program schedule.</li>
              <li>Once your registration is confirmed, you'll get access to our pre-program resources.</li>
            </ol>
            
            <div style="background-color: #f1f8e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Program Start Date:</p>
              <p style="margin: 10px 0 0;">The next cohort begins on March 15, 2025. Mark your calendar!</p>
            </div>
            
            <p>If you have any questions in the meantime, please don't hesitate to contact us at <a href="mailto:info@agriprohub.com" style="color: #2e7d32;">info@agriprohub.com</a>.</p>
            
            <p>We look forward to helping you grow your agribusiness!</p>
            
            <p>Warm regards,<br>
            The AgriPro Hub Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
              <p> 2025 AgriPro Hub. All rights reserved.</p>
              <p>This email was sent to ${data.email} because you applied for our Farm Forward Program.</p>
            </div>
          </div>
        `,
      })
      
      console.log('User confirmation email sent:', userEmailResult)
    } catch (userEmailError) {
      console.error('Error sending confirmation email to user:', userEmailError)
      // Continue execution even if user email fails
      // We don't want to fail the whole submission just because the confirmation email failed
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting Farm Smart form:', error)
    return { 
      success: false, 
      error: 'Failed to submit your application. Please try again or contact us directly.' 
    }
  }
}
