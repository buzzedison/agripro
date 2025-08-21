import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Here you would typically:
    // 1. Validate the form data
    // 2. Save to database
    // 3. Send email notifications
    // 4. Integrate with CRM/booking system
    
    // For now, we'll just log the data and return success
    console.log('Booking form submission:', formData);
    
    // You can integrate with services like:
    // - Airtable for data storage
    // - SendGrid for email notifications
    // - Calendly for booking management
    // - Stripe for payment processing
    
    // Example email notification (you'd implement this with your email service)
    const emailData = {
      to: 'consulting@agripro.com', // Your team email
      subject: 'New Rapid Diagnostic Booking Request',
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Company:</strong> ${formData.company}</p>
        <p><strong>Location:</strong> ${formData.location}</p>
        <p><strong>Farm Size:</strong> ${formData.farmSize}</p>
        <p><strong>Revenue Range:</strong> ${formData.currentRevenue}</p>
        <p><strong>Main Crops:</strong> ${formData.mainCrops}</p>
        <p><strong>Biggest Challenge:</strong> ${formData.biggestChallenge}</p>
        <p><strong>Preferred Start Date:</strong> ${formData.preferredStartDate}</p>
        <p><strong>How they heard about us:</strong> ${formData.hearAboutUs}</p>
        <p><strong>Additional Info:</strong> ${formData.additionalInfo}</p>
      `
    };
    
    // Send confirmation email to client
    const clientEmailData = {
      to: formData.email,
      subject: 'Rapid Diagnostic Booking Confirmation - Agripro',
      html: `
        <h2>Thank you for your booking request!</h2>
        <p>Dear ${formData.firstName},</p>
        <p>We've received your request for our Rapid Diagnostic service. Our team will contact you within 24 hours to confirm your booking and schedule the kick-off call.</p>
        
        <h3>What happens next:</h3>
        <ol>
          <li>We'll contact you to confirm details and schedule your kick-off call</li>
          <li>You'll receive an invoice for the 50% deposit ($750)</li>
          <li>Once payment is confirmed, we'll begin your 14-day sprint</li>
          <li>You'll receive your Field Health Report on day 13</li>
          <li>We'll conduct your action debrief on day 14</li>
        </ol>
        
        <p>If you have any immediate questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>The Agripro Consulting Team</p>
      `
    };
    
    // TODO: Implement actual email sending
    // await sendEmail(emailData);
    // await sendEmail(clientEmailData);
    
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