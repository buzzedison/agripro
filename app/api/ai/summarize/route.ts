import { NextRequest, NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { title, content, category } = await request.json();

        if (!content || content.length < 100) {
            return NextResponse.json({ error: 'Content too short to summarise.' }, { status: 400 });
        }

        // Truncate to ~6000 chars to stay comfortably in token limits
        const truncated = content.slice(0, 6000);

        const summary = await groqComplete({
            model: 'fast', // llama-3.1-8b-instant — we want speed here
            maxTokens: 280,
            temperature: 0.4,
            prompt: `Summarise this AgriPro article for an African agribusiness professional.

Title: ${title}
Category: ${category ?? 'General'}
Content:
${truncated}

Write a tight 3–4 sentence TL;DR. Lead with the most actionable insight. Plain text only — no headers, no bullet points, no markdown. Write as if explaining to a busy farmer or agripreneur.`,
        });

        return NextResponse.json({ summary: summary.trim() });
    } catch (err: any) {
        console.error('AI summarise error:', err);
        return NextResponse.json({ error: 'Could not generate summary.' }, { status: 500 });
    }
}
