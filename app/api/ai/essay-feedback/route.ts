import { NextRequest, NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { essay, role, context } = await request.json();

        if (!essay || essay.trim().length < 30) {
            return NextResponse.json({ error: 'Essay too short for feedback.' }, { status: 400 });
        }

        const feedback = await groqComplete({
            model: 'fast',
            maxTokens: 300,
            temperature: 0.5,
            prompt: `Give brief, constructive feedback on this fellowship application essay for the AgriPro ${role ?? 'Fellowship'}.

Essay:
"${essay.trim().slice(0, 1500)}"

${context ? `Context: ${context}` : ''}

Give 2-3 specific, actionable suggestions to make it stronger. Format as:
✓ [What's working]
→ [Specific improvement 1]
→ [Specific improvement 2]

Keep it under 120 words. Be direct and encouraging.`,
        });

        return NextResponse.json({ feedback: feedback.trim() });
    } catch (err: any) {
        console.error('Essay feedback error:', err);
        return NextResponse.json({ error: 'Could not generate feedback.' }, { status: 500 });
    }
}
