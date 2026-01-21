import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.json();

        // Log the submission
        console.log('Quote request form submission:', formData);

        // In a production environment, you would:
        // 1. Save to database (e.g. Supabase)
        // 2. Send notification to the consulting team
        // 3. Send confirmation to the client

        // Example notification to team
        const teamEmail = {
            subject: `New Quote Request: ${formData.service}`,
            body: `
        Service: ${formData.service}
        Client: ${formData.firstName} ${formData.lastName}
        Email: ${formData.email}
        Phone: ${formData.phone}
        Company: ${formData.company}
        Location: ${formData.location}
        Farm Size: ${formData.farmSize}
        Revenue: ${formData.annualRevenue}
        Requirements: ${formData.requirements}
      `
        };

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
