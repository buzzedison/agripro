import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriprohub.com';

export async function POST(request: NextRequest) {
    try {
        if (!PAYSTACK_SECRET) {
            return NextResponse.json({ error: 'Payment service not configured.' }, { status: 503 });
        }

        const body = await request.json();
        const { email, firstName, amount, frequency, message } = body;

        if (!email || !amount) {
            return NextResponse.json({ error: 'Email and amount are required.' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 1) {
            return NextResponse.json({ error: 'Please enter a valid donation amount (minimum $1).' }, { status: 400 });
        }

        // Paystack amount is in lowest currency unit (cents for USD)
        const amountInCents = Math.round(numAmount * 100);

        const paystackPayload = {
            email,
            amount: amountInCents,
            currency: 'USD',
            callback_url: `${SITE_URL}/knowledgehub/donate/success`,
            metadata: {
                donor_name: firstName || null,
                message: message || null,
                frequency: frequency || 'one-time',
                custom_fields: [
                    {
                        display_name: 'Donor Name',
                        variable_name: 'donor_name',
                        value: firstName || 'Anonymous',
                    },
                    {
                        display_name: 'Donation Type',
                        variable_name: 'frequency',
                        value: frequency === 'monthly' ? 'Monthly' : 'One-time',
                    },
                ],
            },
        };

        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paystackPayload),
        });

        const paystackData = await paystackRes.json();

        if (!paystackData.status || !paystackData.data?.authorization_url) {
            console.error('Paystack initialization error:', paystackData);
            return NextResponse.json({ error: 'Failed to initialize payment. Please try again.' }, { status: 500 });
        }

        // Pre-save a pending donation record
        try {
            const supabase = await createClient();
            await supabase.from('donations').insert({
                email,
                first_name: firstName || null,
                amount: numAmount,
                currency: 'USD',
                frequency: frequency || 'one-time',
                message: message || null,
                paystack_reference: paystackData.data.reference,
                status: 'pending',
            });
        } catch (dbErr) {
            // Non-fatal — log but don't block the redirect
            console.error('Donation pre-save error:', dbErr);
        }

        return NextResponse.json({
            authorization_url: paystackData.data.authorization_url,
            reference: paystackData.data.reference,
        });
    } catch (err) {
        console.error('Donation initialize error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
