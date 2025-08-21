'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'edison@agriprohub.com'

export type FormType = 'expert' | 'partner' | 'newsletter' | 'donation' | 'work' | 'volunteer'

export interface FormData {
  type: FormType
  data: Record<string, string>
}

export async function submitForm(data: FormData) {
  try {
    let emailSubject = ''
    let emailContent = ''
    let confirmationSubject = ''
    let confirmationContent = ''

    switch (data.type) {
      case 'expert':
        emailSubject = 'New Expert Registration'
        emailContent = `
          New expert registration received:
          
          Name: ${data.data.firstName} ${data.data.lastName}
          Email: ${data.data.email}
          Area of Expertise: ${data.data.expertise}
          LinkedIn: ${data.data.linkedin}
        `
        confirmationSubject = 'Expert Registration - Agripro Hub'
        confirmationContent = `
          Dear ${data.data.firstName},
          Thank you for registering as an expert with Agripro Hub.
          We will review your details and get back to you soon.
        `
        break

      case 'partner':
        emailSubject = 'New Partnership Request'
        emailContent = `
          New partnership request received:
          
          Organization: ${data.data.organization}
          Contact Name: ${data.data.firstName} ${data.data.lastName}
          Email: ${data.data.email}
          Partnership Type: ${data.data.partnershipType}
        `
        confirmationSubject = 'Partnership Request - Agripro Hub'
        confirmationContent = `
          Dear ${data.data.firstName},
          Thank you for your interest in partnering with Agripro Hub.
          We will review your request and contact you soon.
        `
        break

      case 'newsletter':
        emailSubject = 'New Newsletter Subscription'
        emailContent = `
          New newsletter subscription:
          
          Email: ${data.data.email}
          Interests: ${data.data.interests}
        `
        confirmationSubject = 'Newsletter Subscription - Agripro Hub'
        confirmationContent = `
          Thank you for subscribing to our newsletter.
          You will start receiving updates based on your interests.
        `
        break

      case 'donation':
        emailSubject = 'New Donation Pledge'
        emailContent = `
          New donation pledge received:
          
          Name: ${data.data.firstName} ${data.data.lastName}
          Email: ${data.data.email}
          Amount: ${data.data.amount}
          Purpose: ${data.data.purpose}
        `
        confirmationSubject = 'Donation Pledge - Agripro Hub'
        confirmationContent = `
          Dear ${data.data.firstName},
          Thank you for your generous pledge to support Agripro Hub.
          We will contact you with next steps for completing your donation.
        `
        break

      case 'work':
        emailSubject = 'New Job Application Received'
        emailContent = `
          New job application received:
          
          Name: ${data.data.firstName} ${data.data.lastName}
          Email: ${data.data.email}
          Area of Interest: ${data.data.areaOfInterest}
          CV Link: ${data.data.cvLink}
          LinkedIn: ${data.data.linkedin}
          
          Please review and respond to the applicant.
        `
        confirmationSubject = 'Your Job Application - Agripro Hub'
        confirmationContent = `
          Dear ${data.data.firstName},

          Thank you for your interest in joining Agripro Hub. We have received your job application for the ${data.data.areaOfInterest} position.

          We will review your application and get back to you soon.

          Best regards,
          Agripro Hub Team
        `
        break

      case 'volunteer':
        emailSubject = 'New Volunteer Application Received'
        emailContent = `
          New volunteer application received:
          
          Name: ${data.data.firstName} ${data.data.lastName}
          Email: ${data.data.email}
          LinkedIn: ${data.data.linkedin}
          Volunteer Type: ${data.data.volunteerType}
          Availability: ${data.data.availability}
          Location: ${data.data.location}
          
          Please review and respond to the volunteer.
        `
        confirmationSubject = 'Your Volunteer Application - Agripro Hub'
        confirmationContent = `
          Dear ${data.data.firstName},

          Thank you for your interest in volunteering with Agripro Hub. We have received your application.

          We will review your details and get back to you soon.

          Best regards,
          Agripro Hub Team
        `
        break

      // Add other cases for different form types
    }

    // Send notification to admin
    await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: emailSubject,
      text: emailContent,
    })

    // Send confirmation to user
    if (data.data.email) {
      await resend.emails.send({
        from: 'Agripro Hub <onboarding@resend.dev>',
        to: [data.data.email],
        subject: confirmationSubject,
        text: confirmationContent,
      })
    }

    return { 
      success: true, 
      message: 'Your submission has been received. Please check your email for confirmation.' 
    }
  } catch (error) {
    console.error('Form submission error:', error)
    return { 
      success: false, 
      error: 'Failed to submit form. Please try again or contact us directly.' 
    }
  }
} 