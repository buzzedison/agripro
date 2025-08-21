import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Here you would typically:
    // 1. Validate the form data
    // 2. Save to database
    // 3. Send email notifications
    // 4. Integrate with scheduling system
    
    // For now, we'll just log the data and return success
    console.log('Discovery call form submission:', formData);
    
    // You can integrate with services like:
    // - Airtable for data storage
    // - SendGrid for email notifications
    // - Calendly for scheduling
    // - HubSpot or other CRM
    
    // Example email notification (you'd implement this with your email service)
    const emailData = {
      to: 'consulting@agripro.com', // Your team email
      subject: 'New Discovery Call Request',
      html: `
        <h2>New Discovery Call Request</h2>
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Company:</strong> ${formData.company}</p>
        <p><strong>Role:</strong> ${formData.role}</p>
        <p><strong>Farm Type:</strong> ${formData.farmType}</p>
        <p><strong>Current Challenges:</strong> ${formData.currentChallenges}</p>
        <p><strong>Preferred Time:</strong> ${formData.preferredTime}</p>
        <p><strong>Time Zone:</strong> ${formData.timeZone}</p>
        <p><strong>Questions:</strong> ${formData.questions}</p>
      `
    };
    
    // Send confirmation email to client
    const clientEmailData = {
      to: formData.email,
      subject: 'Discovery Call Request Received - Agripro',
      html: `
        <h2>Thank you for your interest!</h2>
        <p>Dear ${formData.firstName},</p>
        <p>We've received your request for a free discovery call. Our team will contact you within 24 hours to schedule your 30-minute consultation at a time that works for you.</p>
        
        <h3>What to expect during your call:</h3>
        <ul>
          <li>Discussion of your current challenges and goals</li>
          <li>Overview of how our Rapid Diagnostic service works</li>
          <li>Assessment of whether our service is right for your situation</li>
          <li>Immediate insights and recommendations</li>
          <li>No pressure, no sales pitch - just valuable consultation</li>
        </ul>
        
        <p>We're looking forward to speaking with you and learning more about your agricultural business.</p>
        
        <p>Best regards,<br>The Agripro Consulting Team</p>
      `
    };
    
    // TODO: Implement actual email sending
    // await sendEmail(emailData);
    // await sendEmail(clientEmailData);
    
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