import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    console.log('Quote request form submission:', formData);

    // Admin notification email HTML
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💼 New Quote Request</h1>
          <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">${formData.service}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background-color: #f5f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #7c3aed; margin-top: 0;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;">${formData.firstName} ${formData.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;"><a href="mailto:${formData.email}">${formData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;">${formData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;"><strong>Company:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd6fe;">${formData.company || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Location:</strong></td>
                <td style="padding: 8px;">${formData.location}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #7c3aed; margin-top: 0;">Business Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Service Requested:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong style="color: #7c3aed;">${formData.service}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Farm Size:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formData.farmSize || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Annual Revenue:</strong></td>
                <td style="padding: 8px;">${formData.annualRevenue || 'Not specified'}</td>
              </tr>
            </table>
          </div>

          ${formData.requirements ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin-top: 0;">Requirements & Context</h2>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #f59e0b;">
              ${formData.requirements}
            </div>
          </div>
          ` : ''}

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #0277bd;">
              <strong>Action Required:</strong> Please review this quote request and provide a custom pricing proposal within 24-48 hours.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          Agripro Consulting - Automated Quote Request Notification
        </div>
      </div>
    `;

    // Client confirmation email HTML
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Quote Request Received!</h1>
          <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">We're preparing your custom proposal</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${formData.firstName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in our <strong>${formData.service}</strong> service! We've received your quote request and our team is reviewing your details.
          </p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #166534; margin: 0 0 15px 0;">What happens next?</h3>
            <ol style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Our team reviews your specific requirements</li>
              <li style="margin-bottom: 8px;">We prepare a custom pricing proposal tailored to your needs</li>
              <li style="margin-bottom: 8px;">You'll receive your detailed quote within <strong>24-48 hours</strong></li>
              <li>We may reach out if we need any additional information</li>
            </ol>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">Your Request Summary</h3>
            <p style="color: #451a03; margin: 0; font-size: 14px;">
              <strong>Service:</strong> ${formData.service}<br>
              <strong>Location:</strong> ${formData.location}<br>
              ${formData.company ? `<strong>Company:</strong> ${formData.company}<br>` : ''}
              ${formData.farmSize ? `<strong>Farm Size:</strong> ${formData.farmSize}` : ''}
            </p>
          </div>

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #0277bd; margin: 0; font-size: 14px;">
              💡 <strong>Why custom pricing?</strong> Every agribusiness is unique. We provide tailored pricing based on your operation's size, complexity, and specific needs - so you only pay for what you actually need.
            </p>
          </div>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            While you wait, feel free to explore our other services or read about how we've helped agribusinesses across Africa transform their operations.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://agriprohub.com/consulting" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Explore All Services
            </a>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
            <strong>Questions?</strong> Reply to this email or reach out at 
            <a href="mailto:consulting@agriprohub.com" style="color: #16a34a;">consulting@agriprohub.com</a>
          </p>
          
          <p style="font-size: 16px; color: #166534; margin-top: 30px;">
            Best regards,<br>
            <strong>The Agripro Consulting Team</strong>
          </p>
        </div>
      </div>
    `;

    // Send admin notification
    try {
      await resend.emails.send({
        from: 'Agripro Consulting <onboarding@resend.dev>',
        to: ADMIN_EMAILS,
        subject: `💼 New Quote Request: ${formData.service} - ${formData.firstName} ${formData.lastName}`,
        html: adminEmailHtml,
      });
      console.log('Admin notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Send client confirmation
    try {
      await resend.emails.send({
        from: 'Agripro Consulting <onboarding@resend.dev>',
        to: [formData.email],
        subject: `✅ Quote Request Received: ${formData.service} - Agripro`,
        html: clientEmailHtml,
      });
      console.log('Client confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send client confirmation:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully'
    });

  } catch (error) {
    console.error('Error processing quote request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process quote request' },
      { status: 500 }
    );
  }
}
