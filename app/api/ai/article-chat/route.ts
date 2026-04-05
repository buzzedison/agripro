import { NextRequest, NextResponse } from 'next/server';
import { groq, GROQ_MODELS } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { question, articleTitle, articleContent, history } = await request.json();

        if (!question?.trim()) {
            return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
        }

        if (!groq) {
            return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 });
        }

        const context = (articleContent ?? '').slice(0, 5000);
        const systemPrompt = `You are an expert agricultural AI assistant embedded in the AgriPro Knowledge Hub.

The user is reading this article:
Title: ${articleTitle ?? 'Unknown'}
Content:
${context}

Answer questions about this article specifically. If the question is not related to the article, you can still answer it using your agricultural expertise. Keep answers concise (2-4 sentences unless a longer answer is clearly needed). Use markdown lightly.`;

        const recentHistory = (history ?? []).slice(-10).map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        const completion = await groq.chat.completions.create({
            model: GROQ_MODELS.smart,
            messages: [
                { role: 'system', content: systemPrompt },
                ...recentHistory,
                { role: 'user', content: question },
            ],
            max_tokens: 512,
            temperature: 0.6,
        });

        const answer = completion.choices[0]?.message?.content ?? 'Unable to answer at this time.';
        return NextResponse.json({ answer: answer.trim() });
    } catch (err: any) {
        console.error('Article chat error:', err);
        return NextResponse.json({ error: 'Could not process question.' }, { status: 500 });
    }
}
