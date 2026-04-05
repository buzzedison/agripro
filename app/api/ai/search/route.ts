import { NextRequest, NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query?.trim() || query.trim().length < 3) {
            return NextResponse.json({ error: 'Query too short.' }, { status: 400 });
        }

        // Ask the model to extract structured search intent
        const result = await groqComplete({
            model: 'fast',
            maxTokens: 200,
            temperature: 0.2,
            prompt: `Parse this search query from an AgriPro Knowledge Hub user into structured search intent.

Query: "${query.trim()}"

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "keywords": ["keyword1", "keyword2"],
  "category": "one of: crops | livestock | finance | climate | technology | markets | post-harvest | policy | general",
  "intent": "one sentence describing what the user wants",
  "suggestedFilters": ["filter1", "filter2"]
}`,
        });

        try {
            // Strip any potential markdown code fences
            const cleaned = result.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return NextResponse.json({ parsed, raw: query });
        } catch {
            // If JSON parse fails, return the raw result
            return NextResponse.json({ parsed: null, raw: query });
        }
    } catch (err: any) {
        console.error('AI search error:', err);
        return NextResponse.json({ error: 'Search parsing failed.' }, { status: 500 });
    }
}
