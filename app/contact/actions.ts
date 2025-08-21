'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'edison@agriprohub.com'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  reason: string
}

// Add export statement here
export async function submitContactForm(data: ContactFormData) {
  try {
    // Send notification to admin with better formatting
    await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `🔔 New Contact Form Submission: ${data.subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        
        <h2>Contact Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Reason:</strong> ${data.reason}</li>
          <li><strong>Subject:</strong> ${data.subject}</li>
        </ul>

        <h2>Message:</h2>
        <p style="white-space: pre-wrap;">${data.message}</p>

        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from your contact form at AgriPro Hub.
        </p>
      `,
    })

    // Send confirmation to user
    await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: [data.email],
      subject: 'Thank you for contacting Agripro Hub',
      text: `
        Dear ${data.firstName},

        Thank you for reaching out to Agripro Hub. We have received your message and will get back to you soon.

        Your message details:
        Subject: ${data.subject}
        Message: ${data.message}

        Best regards,
        Agripro Hub Team
      `
    })

    return { 
      success: true, 
      message: 'Your message has been sent. We will get back to you soon.' 
    }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return { 
      success: false, 
      error: 'Failed to send message. Please try again or contact us directly.' 
    }
  }
} 