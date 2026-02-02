import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAILS = ['edison@agriprohub.com', 'info@agriprohub.com'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    console.log('Discovery call form submission:', formData);

    // Admin notification email HTML
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📞 New Discovery Call Request</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin-top: 0;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;">${formData.firstName} ${formData.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;"><a href="mailto:${formData.email}">${formData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;">${formData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;"><strong>Company:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #bfdbfe;">${formData.company || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Role:</strong></td>
                <td style="padding: 8px;">${formData.role || 'Not specified'}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin-top: 0;">Scheduling Preferences</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Preferred Time:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formData.preferredTime || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>Time Zone:</strong></td>
                <td style="padding: 8px;">${formData.timeZone}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin-top: 0;">Current Challenges</h2>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #f59e0b;">
              ${formData.currentChallenges || 'Not specified'}
            </div>
            ${formData.questions ? `
              <h3 style="color: #92400e; margin-top: 15px;">Questions:</h3>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #f59e0b;">
                ${formData.questions}
              </div>
            ` : ''}
          </div>

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #0277bd;">
              <strong>Action Required:</strong> Please contact this lead within 24 hours to schedule their free 30-minute discovery call.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          Agripro Consulting - Automated Discovery Call Notification
        </div>
      </div>
    `;

    // Client confirmation email HTML
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Discovery Call Requested!</h1>
          <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">We'll be in touch soon</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${formData.firstName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in Agripro Consulting! We've received your request for a <strong>free 30-minute discovery call</strong>. Our team will contact you within 24 hours to schedule a time that works for you.
          </p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #166534; margin: 0 0 15px 0;">What to expect during your call:</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Deep dive into your current challenges and goals</li>
              <li style="margin-bottom: 8px;">Overview of how our Rapid Diagnostic service works</li>
              <li style="margin-bottom: 8px;">Assessment of whether our service is right for your situation</li>
              <li style="margin-bottom: 8px;">Immediate insights and recommendations</li>
              <li>No pressure, no sales pitch - just valuable consultation</li>
            </ul>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">Your Request Summary</h3>
            <p style="color: #451a03; margin: 0; font-size: 14px;">
              <strong>Preferred Time:</strong> ${formData.preferredTime || 'Flexible'}<br>
              <strong>Time Zone:</strong> ${formData.timeZone}<br>
              ${formData.company ? `<strong>Company:</strong> ${formData.company}` : ''}
            </p>
          </div>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
            We're looking forward to speaking with you and learning more about your agricultural business. In the meantime, feel free to explore our services and success stories.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://agriprohub.com/consulting" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Explore Our Services
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
        subject: `📞 New Discovery Call Request: ${formData.firstName} ${formData.lastName}`,
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
        subject: '✅ Discovery Call Request Received - Agripro',
        html: clientEmailHtml,
      });
      console.log('Client confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send client confirmation:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Discovery call request submitted successfully'
    });

  } catch (error) {
    console.error('Error processing discovery call request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process discovery call request' },
      { status: 500 }
    );
  }
}