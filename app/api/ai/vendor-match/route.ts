import { NextRequest, NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { query, vendors } = await request.json();

        if (!query?.trim()) {
            return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
        }

        // AI ranks and explains why vendors match
        const vendorList = (vendors ?? []).slice(0, 30).map((v: any, i: number) =>
            `${i + 1}. ${v.business_name} | Type: ${v.business_type} | Location: ${v.city}, ${v.country} | ${v.product_description?.slice(0, 120) ?? ''}`
        ).join('\n');

        const result = await groqComplete({
            model: 'fast',
            maxTokens: 400,
            temperature: 0.3,
            prompt: `You are helping a buyer find the right agribusiness vendor on AgriPro Green Market.

Buyer query: "${query.trim()}"

Available vendors:
${vendorList || 'No vendors listed.'}

Return ONLY valid JSON (no markdown, no explanation):
{
  "topMatches": [1, 3, 5],
  "explanation": "One sentence on why these vendors match best.",
  "suggestedSearch": "A refined search term that would help find more matches"
}

topMatches should be the 1-indexed numbers of the best matching vendors (max 5).`,
        });

        try {
            const cleaned = result.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return NextResponse.json(parsed);
        } catch {
            return NextResponse.json({ topMatches: [], explanation: '', suggestedSearch: query });
        }
    } catch (err: any) {
        console.error('Vendor match error:', err);
        return NextResponse.json({ error: 'Matching failed.' }, { status: 500 });
    }
}
