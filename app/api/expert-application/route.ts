import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com'];

// Sanity client with write permissions
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-12-26',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Write token needed for mutations
});

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json();
    
    // Validate required fields
    if (!applicationData.applicantName || !applicationData.email || !applicationData.primaryExpertise) {
      return NextResponse.json(
        { error: 'Missing required fields: applicantName, email, or primaryExpertise' },
        { status: 400 }
      );
    }

    // Save to Sanity
    const sanityDocument = {
      _type: 'expertApplication',
      applicantName: applicationData.applicantName,
      email: applicationData.email,
      phone: applicationData.phone || '',
      professionalTitle: applicationData.professionalTitle || '',
      currentOrganization: applicationData.currentOrganization || '',
      primaryExpertise: applicationData.primaryExpertise,
      otherExpertise: applicationData.otherExpertise || '',
      specializations: applicationData.specializations || [],
      yearsOfExperience: applicationData.yearsOfExperience || 1,
      education: applicationData.education || [],
      certifications: applicationData.certifications || [],
      workExperience: applicationData.workExperience || '',
      achievements: applicationData.achievements || [],
      whyJoin: applicationData.whyJoin || '',
      contributions: applicationData.contributions || '',
      availabilityForConsulting: applicationData.availabilityForConsulting || false,
      preferredEngagementTypes: applicationData.preferredEngagementTypes || [],
      languages: applicationData.languages || [],
      location: applicationData.location || { country: '', state: '', city: '' },
      socialProfiles: applicationData.socialProfiles || {
        linkedin: '',
        twitter: '',
        website: '',
        researchGate: '',
        googleScholar: ''
      },
      agreeToTerms: applicationData.agreeToTerms || false,
      applicationStatus: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    // Create document in Sanity
    const sanityResult = await sanityClient.create(sanityDocument);
    
    // Send admin notification email
    const adminEmailContent = `
      <h1>🌱 New Expert Application Received</h1>
      
      <h2>Applicant Information:</h2>
      <ul>
        <li><strong>Name:</strong> ${applicationData.applicantName}</li>
        <li><strong>Email:</strong> ${applicationData.email}</li>
        <li><strong>Phone:</strong> ${applicationData.phone || 'Not provided'}</li>
        <li><strong>Professional Title:</strong> ${applicationData.professionalTitle}</li>
        <li><strong>Organization:</strong> ${applicationData.currentOrganization || 'Not provided'}</li>
        <li><strong>Primary Expertise:</strong> ${applicationData.primaryExpertise}</li>
        <li><strong>Years of Experience:</strong> ${applicationData.yearsOfExperience} years</li>
        <li><strong>Location:</strong> ${[applicationData.location?.city, applicationData.location?.state, applicationData.location?.country].filter(Boolean).join(', ')}</li>
      </ul>

      <h2>Education:</h2>
      ${applicationData.education && applicationData.education.length > 0 ? 
        applicationData.education.map((edu: any) => 
          `<p><strong>${edu.degree}</strong> from ${edu.institution} (${edu.year})</p>`
        ).join('') : 
        '<p>No education information provided</p>'
      }

      <h2>Work Experience:</h2>
      <p style="white-space: pre-wrap;">${applicationData.workExperience || 'Not provided'}</p>

      <h2>Why Join:</h2>
      <p style="white-space: pre-wrap;">${applicationData.whyJoin || 'Not provided'}</p>

      <h2>How They Can Contribute:</h2>
      <p style="white-space: pre-wrap;">${applicationData.contributions || 'Not provided'}</p>

      <h2>Additional Information:</h2>
      <ul>
        <li><strong>Available for Consulting:</strong> ${applicationData.availabilityForConsulting ? 'Yes' : 'No'}</li>
        <li><strong>Preferred Engagement Types:</strong> ${applicationData.preferredEngagementTypes?.join(', ') || 'None specified'}</li>
        <li><strong>Languages:</strong> ${applicationData.languages?.join(', ') || 'None specified'}</li>
        <li><strong>Specializations:</strong> ${applicationData.specializations?.join(', ') || 'None specified'}</li>
        <li><strong>Certifications:</strong> ${applicationData.certifications?.join(', ') || 'None specified'}</li>
      </ul>

      <h2>Social Profiles:</h2>
      <ul>
        ${applicationData.socialProfiles?.linkedin ? `<li><strong>LinkedIn:</strong> <a href="${applicationData.socialProfiles.linkedin}">${applicationData.socialProfiles.linkedin}</a></li>` : ''}
        ${applicationData.socialProfiles?.website ? `<li><strong>Website:</strong> <a href="${applicationData.socialProfiles.website}">${applicationData.socialProfiles.website}</a></li>` : ''}
        ${applicationData.socialProfiles?.researchGate ? `<li><strong>ResearchGate:</strong> <a href="${applicationData.socialProfiles.researchGate}">${applicationData.socialProfiles.researchGate}</a></li>` : ''}
        ${applicationData.socialProfiles?.googleScholar ? `<li><strong>Google Scholar:</strong> <a href="${applicationData.socialProfiles.googleScholar}">${applicationData.socialProfiles.googleScholar}</a></li>` : ''}
      </ul>

      <hr>
      <p><strong>Sanity Document ID:</strong> ${sanityResult._id}</p>
      <p><strong>Application Status:</strong> Submitted</p>
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      
      <p style="color: #666; font-size: 12px;">
        This application has been automatically saved to your Sanity CMS for review.
      </p>
    `;

    await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: ADMIN_EMAILS,
      subject: `🌱 New Expert Application: ${applicationData.applicantName}`,
      html: adminEmailContent,
    });

    // Send confirmation email to applicant
    const confirmationEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2e7d32;">Expert Application Received</h1>
        
        <p>Dear ${applicationData.applicantName},</p>
        
        <p>Thank you for your interest in joining the Agripro Hub expert network. We have successfully received your application and are excited to review your qualifications.</p>
        
        <div style="background-color: #f1f8e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2e7d32; margin-top: 0;">What happens next?</h2>
          <ol>
            <li>Our team will review your application within 5-7 business days</li>
            <li>If your application meets our criteria, we'll schedule a brief interview</li>
            <li>Upon approval, you'll receive access to our expert platform and can start contributing</li>
            <li>We'll provide you with guidelines and resources to get started</li>
          </ol>
        </div>
        
        <h2>Your Application Summary:</h2>
        <ul>
          <li><strong>Primary Expertise:</strong> ${applicationData.primaryExpertise}</li>
          <li><strong>Years of Experience:</strong> ${applicationData.yearsOfExperience} years</li>
          <li><strong>Available for Consulting:</strong> ${applicationData.availabilityForConsulting ? 'Yes' : 'No'}</li>
        </ul>
        
        <p>If you have any questions or need to update your application, please don't hesitate to contact us at <a href="mailto:experts@agriprohub.com" style="color: #2e7d32;">experts@agriprohub.com</a>.</p>
        
        <p>We look forward to potentially welcoming you to our community of agricultural experts!</p>
        
        <p>Best regards,<br>
        The Agripro Hub Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
          <p>© 2025 Agripro Hub. All rights reserved.</p>
          <p>This email was sent to ${applicationData.email} because you submitted an expert application.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Agripro Hub <onboarding@resend.dev>',
      to: [applicationData.email],
      subject: 'Expert Application Received - Agripro Hub',
      html: confirmationEmailContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: sanityResult._id,
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing expert application:', error);
    
    // Return different error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('SANITY')) {
        return NextResponse.json(
          { error: 'Failed to save application. Please try again.' },
          { status: 500 }
        );
      }
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Application saved but failed to send confirmation email.' },
          { status: 207 } // Partial success
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process application. Please try again.' },
      { status: 500 }
    );
  }
} 