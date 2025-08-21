'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'edison@agriprohub.com'

interface VendorFormData {
  businessName: string
  ownerName: string
  email: string
  phone: string
  businessType: string
  productDescription: string
  sustainabilityPractices: string
  boothPreference: string
}

export async function submitVendorForm(data: VendorFormData) {
  try {
    // Send notification to admin
    await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `🏪 New Green Market Vendor Application: ${data.businessName}`,
      html: `
        <h1>New Vendor Application</h1>
        
        <h2>Business Information:</h2>
        <ul>
          <li><strong>Business Name:</strong> ${data.businessName}</li>
          <li><strong>Owner's Name:</strong> ${data.ownerName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Business Type:</strong> ${data.businessType}</li>
          <li><strong>Booth Preference:</strong> ${data.boothPreference}</li>
        </ul>

        <h2>Product/Service Description:</h2>
        <p>${data.productDescription}</p>

        <h2>Sustainability Practices:</h2>
        <p>${data.sustainabilityPractices}</p>

        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from your Green Market vendor application form.
        </p>
      `,
    })

    // Send confirmation to vendor
    await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: [data.email],
      subject: 'Thank you for applying to be a Green Market Vendor',
      html: `
        <h1>Thank you for your application!</h1>
        
        <p>Dear ${data.ownerName},</p>

        <p>We have received your vendor application for the Accra Green Market. Our team will review your application and get back to you within 2-3 business days.</p>

        <h2>Your Application Details:</h2>
        <ul>
          <li><strong>Business Name:</strong> ${data.businessName}</li>
          <li><strong>Business Type:</strong> ${data.businessType}</li>
          <li><strong>Booth Preference:</strong> ${data.boothPreference}</li>
        </ul>

        <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>

        <p>Best regards,<br>The Green Market Team</p>
      `,
    })

    return { 
      success: true, 
      message: 'Your application has been submitted successfully. We will contact you soon!' 
    }
  } catch (error) {
    console.error('Vendor form submission error:', error)
    return { 
      success: false, 
      error: 'Failed to submit application. Please try again or contact us directly.' 
    }
  }
} 