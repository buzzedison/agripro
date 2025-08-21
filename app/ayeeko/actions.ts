'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com']

interface AyeekoFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string
  role: string
  supportType: string
  message: string
}

export async function submitAyeekoForm(data: AyeekoFormData) {
  try {
    // Send notification to admin
    const adminEmailResult = await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: ADMIN_EMAILS,
      subject: '🌱 New Ayeeko Program Application',
      html: `
        <h1>New Ayeeko Program Application</h1>
        
        <h2>Applicant Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Organization:</strong> ${data.organization || 'Not specified'}</li>
          <li><strong>Role:</strong> ${data.role}</li>
          <li><strong>Support Type:</strong> ${data.supportType}</li>
          <li><strong>Message:</strong> ${data.message || 'Not provided'}</li>
        </ul>

        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from your Ayeeko application form at AgriPro Hub.
        </p>
      `,
    })
    
    console.log('Admin email sent:', adminEmailResult)

    // Send confirmation to applicant - with better error handling
    try {
      const userEmailResult = await resend.emails.send({
        from: 'Agripro Hub <onboarding@resend.dev>',
        to: [data.email],
        subject: 'Your Ayeeko Program Application',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://agriprohub.com/images/logo.png" alt="AgriPro Hub Logo" style="max-width: 150px;">
            </div>
            
            <h1 style="color: #2e7d32; text-align: center; margin-bottom: 30px;">Thank You for Your Interest in Ayeeko!</h1>
            
            <p>Dear ${data.firstName},</p>
            
            <p>Thank you for your interest in the <strong>Ayeeko Program</strong>. We've received your application and are excited about your interest in supporting our inclusive, AI-powered farming assistant.</p>
            
            <p>Here's what happens next:</p>
            
            <ol>
              <li>Our team will review your application within 2-3 business days.</li>
              <li>You'll receive an email with further information about how you can get involved based on your interest as a ${data.supportType}.</li>
              <li>We'll schedule a call to discuss specific opportunities and answer any questions you might have.</li>
            </ol>
            
            <div style="background-color: #f1f8e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">About Ayeeko:</p>
              <p style="margin: 10px 0 0;">Ayeeko is a full-stack, voice-first farm support system that fuses AI, low-cost sensors, and offline access to deliver real-time, personalized guidance to smallholder farmers.</p>
            </div>
            
            <p>If you have any questions in the meantime, please don't hesitate to contact us at <a href="mailto:info@agriprohub.com" style="color: #2e7d32;">info@agriprohub.com</a>.</p>
            
            <p>We look forward to collaborating with you to make a difference in the lives of smallholder farmers!</p>
            
            <p>Warm regards,<br>
            The AgriPro Hub Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
              <p>© 2025 AgriPro Hub. All rights reserved.</p>
              <p>This email was sent to ${data.email} because you applied to get involved with our Ayeeko Program.</p>
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
    console.error('Error submitting Ayeeko form:', error)
    return { 
      success: false, 
      error: 'Failed to submit your application. Please try again or contact us directly.' 
    }
  }
}
