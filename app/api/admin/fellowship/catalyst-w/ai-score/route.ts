import { NextRequest, NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request: NextRequest) {
    const { motivation, experience, role } = await request.json();

    const result = await groqComplete({
        model: 'smart',
        maxTokens: 400,
        temperature: 0.3,
        systemPrompt: `You are an expert fellowship evaluator for a women-in-agribusiness programme in Africa. Evaluate fellowship applications fairly and critically.`,
        prompt: `Role applied for: ${role}

Motivation Essay:
${motivation}

Relevant Experience:
${experience || 'Not provided'}

Score this application out of 10 and provide a brief evaluation. Return ONLY valid JSON in this exact format:
{
  "score": <number 1-10>,
  "summary": "<2-3 sentence summary of the applicant's strengths and fit>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1 or 'None'>"],
  "recommendation": "accept" | "shortlist" | "reject"
}`,
    });

    try {
        const match = result.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON');
        const parsed = JSON.parse(match[0]);
        return NextResponse.json(parsed);
    } catch {
        return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 });
    }
}
