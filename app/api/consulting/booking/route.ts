import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    console.log('Booking form submission:', formData);

    // Admin notification email HTML
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🌾 New Rapid Diagnostic Booking</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #166534; margin-top: 0;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${formData.firstName} ${formData.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><a href="mailto:${formData.email}">${formData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${formData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;"><strong>Company:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bbf7d0;">${formData.company}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Location:</strong></td>
                <td style="padding: 8px;">${formData.location}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #166534; margin-top: 0;">Business Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Farm Size:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formData.farmSize || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Annual Revenue:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formData.currentRevenue || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Main Crops:</strong></td>
                <td style="padding: 8px;">${formData.mainCrops}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin-top: 0;">Challenge & Timeline</h2>
            <p><strong>Biggest Challenge:</strong></p>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 15px;">
              ${formData.biggestChallenge}
            </div>
            <p><strong>Preferred Start Date:</strong> ${formData.preferredStartDate || 'Not specified'}</p>
            <p><strong>How they heard about us:</strong> ${formData.hearAboutUs || 'Not specified'}</p>
            ${formData.additionalInfo ? `
              <p><strong>Additional Info:</strong></p>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #f59e0b;">
                ${formData.additionalInfo}
              </div>
            ` : ''}
          </div>

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #0277bd;">
              <strong>Action Required:</strong> Please contact this lead within 24 hours to confirm booking and schedule the kick-off call. Investment: US $1,500 (50% deposit required).
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          Agripro Consulting - Automated Booking Notification
        </div>
      </div>
    `;

    // Client confirmation email HTML
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">Your Rapid Diagnostic request has been received</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${formData.firstName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Thank you for booking our <strong>Rapid Diagnostic</strong> service! We're excited to help you uncover opportunities to transform your agribusiness.
          </p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #166534; margin: 0 0 15px 0;">What happens next?</h3>
            <ol style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">We'll contact you within <strong>24 hours</strong> to confirm details and schedule your kick-off call</li>
              <li style="margin-bottom: 8px;">You'll receive an invoice for the 50% deposit (<strong>$750</strong>)</li>
              <li style="margin-bottom: 8px;">Once payment is confirmed, your 14-day sprint begins</li>
              <li style="margin-bottom: 8px;">You'll receive your comprehensive Field Health Report on day 13</li>
              <li>We'll conduct your action debrief on day 14</li>
            </ol>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">Your Booking Summary</h3>
            <p style="color: #451a03; margin: 0; font-size: 14px;">
              <strong>Service:</strong> Rapid Diagnostic (14-Day Sprint)<br>
              <strong>Investment:</strong> US $1,500<br>
              <strong>Company:</strong> ${formData.company}<br>
              <strong>Main Crops:</strong> ${formData.mainCrops}<br>
              ${formData.preferredStartDate ? `<strong>Preferred Start:</strong> ${formData.preferredStartDate}` : ''}
            </p>
          </div>

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #0277bd; margin: 0; font-size: 14px;">
              💡 <strong>Money-back guarantee:</strong> If we don't find at least 2× the fee in potential savings, we'll refund you in full.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://agriprohub.com/consulting" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Learn More About Our Services
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
        subject: `🌾 New Rapid Diagnostic Booking: ${formData.firstName} ${formData.lastName}`,
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
        subject: '✅ Rapid Diagnostic Booking Confirmed - Agripro',
        html: clientEmailHtml,
      });
      console.log('Client confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send client confirmation:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully'
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process booking request' },
      { status: 500 }
    );
  }
}