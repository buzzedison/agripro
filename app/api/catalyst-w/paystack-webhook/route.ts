import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { serviceClient, settlePaystackReference } from '@/lib/catalyst-launch-server';

// Paystack calls this after a charge so places are confirmed even if the founder closes the tab.
// Point the Paystack dashboard webhook at /api/catalyst-w/paystack-webhook. Only Catalyst W fee
// references (cw_…) are handled; everything is re-verified with Paystack before a place is confirmed.
export async function POST(request: NextRequest) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 });

    const raw = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';
    const expected = createHmac('sha512', secret).update(raw).digest('hex');
    const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

    let event: { event?: string; data?: { reference?: string } };
    try { event = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }
    const reference = event.data?.reference;
    if (event.event !== 'charge.success' || !reference?.startsWith('cw_')) return NextResponse.json({ ok: true });

    try {
        await settlePaystackReference(serviceClient(), reference);
    } catch (err) {
        console.error('Catalyst W webhook settle failed', err);
        return NextResponse.json({ error: 'retry' }, { status: 500 }); // Paystack retries non-2xx responses
    }
    return NextResponse.json({ ok: true });
}
