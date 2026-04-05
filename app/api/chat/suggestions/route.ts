import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { lastQuestion, lastAnswer } = await request.json() as {
            lastQuestion: string;
            lastAnswer: string;
        };

        if (!groq) return NextResponse.json({ suggestions: [] });

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant', // Always use the fast model for suggestions
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that generates follow-up questions for an African agribusiness AI chat.
Given the last question and answer, generate exactly 3 short, specific follow-up questions the user might want to ask next.
Rules:
- Each question must be under 60 characters
- Questions must be directly relevant to what was just discussed
- Make them practical and actionable — what a farmer or agribusiness professional would actually ask
- Return ONLY a JSON array of 3 strings, nothing else. Example: ["Question one?", "Question two?", "Question three?"]`,
                },
                {
                    role: 'user',
                    content: `Question: ${lastQuestion.slice(0, 300)}\n\nAnswer: ${lastAnswer.slice(0, 600)}\n\nGenerate 3 follow-up questions:`,
                },
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const raw = completion.choices[0]?.message?.content ?? '[]';

        // Parse the JSON array safely (avoid /s flag for tsconfig compat)
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) return NextResponse.json({ suggestions: [] });

        const suggestions: string[] = JSON.parse(match[0]);
        return NextResponse.json({ suggestions: suggestions.slice(0, 3) });

    } catch {
        return NextResponse.json({ suggestions: [] });
    }
}
