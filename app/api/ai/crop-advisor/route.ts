import { NextRequest, NextResponse } from 'next/server';
import { groq, GROQ_MODELS } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { question, context } = await request.json();

        if (!question?.trim()) {
            return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
        }

        if (!groq) {
            return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 });
        }

        const systemPrompt = `You are AgriPro's expert Crop Advisor — an AI agronomist specialising in African agriculture.

Your expertise:
- Crop selection and rotation strategies for African climates and soils
- Pest and disease identification and management
- Soil health, fertilisation, and composting
- Irrigation and water management
- Climate-smart and regenerative agriculture
- Post-harvest handling and storage
- Market timing and crop economics
- Organic and conventional farming systems across sub-Saharan Africa, East Africa, West Africa, and North Africa

User context: ${context?.country ? `Located in ${context.country}.` : ''} ${context?.farmSize ? `Farm size: ${context.farmSize}.` : ''} ${context?.crops ? `Current crops: ${context.crops}.` : ''}

Give practical, specific, actionable advice. Mention specific varieties, timelines, and quantities where relevant. Keep answers concise but complete. Use bullet points for steps or lists. Always consider African market conditions and input availability.`;

        const completion = await groq.chat.completions.create({
            model: GROQ_MODELS.smart,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question },
            ],
            max_tokens: 768,
            temperature: 0.6,
        });

        const answer = completion.choices[0]?.message?.content ?? 'Unable to provide advice at this time.';
        return NextResponse.json({ answer: answer.trim() });
    } catch (err: any) {
        console.error('Crop advisor error:', err);
        return NextResponse.json({ error: 'Could not process your question.' }, { status: 500 });
    }
}
