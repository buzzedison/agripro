// Test script to verify Resend is working
// Run with: npx tsx scripts/test-resend.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('🔧 Testing Resend configuration...\n');

    // Check API key
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not set in environment variables');
        return;
    }
    console.log('✅ API Key found:', process.env.RESEND_API_KEY.substring(0, 10) + '...');

    try {
        // Send a test email
        const { data, error } = await resend.emails.send({
            from: 'AgriProHub <noreply@updates.agriprohub.com>',
            to: ['edison@agriprohub.com'], // Change to your email
            subject: 'Test Email from AgriProHub',
            html: '<h1>Test Email</h1><p>If you receive this, Resend is working correctly!</p>',
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            console.log('\n📋 Common issues:');
            console.log('   - Domain not verified in Resend');
            console.log('   - Sender email not from verified domain');
            console.log('   - Invalid API key');
        } else {
            console.log('✅ Email sent successfully!');
            console.log('📧 Email ID:', data?.id);
            console.log('\n🎉 Resend is working! The issue is in Supabase SMTP settings.');
        }
    } catch (err) {
        console.error('❌ Exception:', err);
    }
}

testResend();
