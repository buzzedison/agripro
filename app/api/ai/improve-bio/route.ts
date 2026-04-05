import { NextRequest, NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { businessName, businessType, currentDescription, city, country } = await request.json();

        if (!currentDescription || currentDescription.trim().length < 10) {
            return NextResponse.json({ error: 'Please provide a description to improve.' }, { status: 400 });
        }

        const improved = await groqComplete({
            model: 'fast',
            maxTokens: 220,
            temperature: 0.6,
            prompt: `Rewrite this AgriPro vendor profile description to be more professional, specific, and compelling for buyers.

Business: ${businessName ?? 'Unknown'}
Type: ${businessType ?? 'Agribusiness'}
Location: ${city ?? ''}, ${country ?? 'Africa'}
Current description: "${currentDescription.trim()}"

Write a 2-3 sentence improved description. Be specific about what they offer, who they serve, and what makes them credible. No emojis. No generic phrases like "leading" or "premier". Plain text only.`,
        });

        return NextResponse.json({ improved: improved.trim() });
    } catch (err: any) {
        console.error('Improve bio error:', err);
        return NextResponse.json({ error: 'Could not improve description.' }, { status: 500 });
    }
}
