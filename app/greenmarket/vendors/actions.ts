'use server'

import { createClient } from '@/lib/supabase/server'
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
  sustainabilityPractices?: string
  country?: string
  region?: string
  city?: string
  website?: string
}

export async function submitVendorForm(data: VendorFormData) {
  try {
    const supabase = await createClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Insert vendor application into database
    const { data: vendor, error: dbError } = await supabase
      .from('trade_vendors')
      .insert({
        user_id: user?.id || null,
        business_name: data.businessName,
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        business_type: data.businessType,
        product_description: data.productDescription,
        sustainability_practices: data.sustainabilityPractices || null,
        country: data.country || 'Ghana',
        region: data.region || null,
        city: data.city || null,
        website: data.website || null,
        status: 'pending',
      })
      .select('id, slug')
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save application')
    }

    // Send notification to admin
    try {
      await resend.emails.send({
        from: 'Agripro Hub <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `🏪 New Vendor Application: ${data.businessName}`,
        html: `
          <h1>New Vendor Application</h1>
          <p><strong>Application ID:</strong> ${vendor.id}</p>
          
          <h2>Business Information:</h2>
          <ul>
            <li><strong>Business Name:</strong> ${data.businessName}</li>
            <li><strong>Owner's Name:</strong> ${data.ownerName}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Phone:</strong> ${data.phone}</li>
            <li><strong>Business Type:</strong> ${data.businessType}</li>
            <li><strong>Location:</strong> ${data.city || ''}, ${data.region || ''}, ${data.country || 'Ghana'}</li>
            ${data.website ? `<li><strong>Website:</strong> ${data.website}</li>` : ''}
          </ul>

          <h2>Product/Service Description:</h2>
          <p>${data.productDescription}</p>

          ${data.sustainabilityPractices ? `
            <h2>Sustainability Practices:</h2>
            <p>${data.sustainabilityPractices}</p>
          ` : ''}

          <hr>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://agriprohub.com'}/admin/trade/vendors">Review in Admin Dashboard</a></p>
        `,
      })
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // Don't fail the submission if email fails
    }

    // Send confirmation to vendor
    try {
      await resend.emails.send({
        from: 'Agripro Hub <onboarding@resend.dev>',
        to: [data.email],
        subject: 'Welcome to Green Market - Application Received!',
        html: `
          <h1>Thank you for your application!</h1>
          
          <p>Dear ${data.ownerName},</p>

          <p>We have received your vendor application for the Green Market. Our team will review your application and get back to you within 2-3 business days.</p>

          <h2>Your Application Details:</h2>
          <ul>
            <li><strong>Business Name:</strong> ${data.businessName}</li>
            <li><strong>Business Type:</strong> ${data.businessType}</li>
            <li><strong>Application ID:</strong> ${vendor.id.slice(0, 8).toUpperCase()}</li>
          </ul>

          <h2>What's Next?</h2>
          <ol>
            <li>Our team will review your application</li>
            <li>We may reach out for additional information</li>
            <li>You'll receive an approval or feedback email</li>
            <li>Once approved, your business will appear in our marketplace with a verified badge</li>
          </ol>

          <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>

          <p>Best regards,<br>The Green Market Team</p>
        `,
      })
    } catch (emailError) {
      console.error('Vendor confirmation email error:', emailError)
    }

    return {
      success: true,
      message: 'Your application has been submitted successfully! We will review it and contact you within 2-3 business days.',
      applicationId: vendor.id.slice(0, 8).toUpperCase()
    }
  } catch (error) {
    console.error('Vendor form submission error:', error)
    return {
      success: false,
      error: 'Failed to submit application. Please try again or contact us directly.'
    }
  }
}