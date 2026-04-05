import { NextRequest, NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();
        if (!query?.trim()) return NextResponse.json({ filters: {} });

        const result = await groqComplete({
            model: 'fast',
            maxTokens: 200,
            temperature: 0.2,
            systemPrompt: `You extract search filters from natural language queries about finding people on an African agribusiness network.
Return ONLY valid JSON with these optional fields:
- user_type: one of "farmer" | "buyer" | "expert" | "service_provider"
- country: exact country name from this list: Ghana, Nigeria, Kenya, Tanzania, Uganda, Ethiopia, South Africa, Côte d'Ivoire, Senegal, Rwanda
- value_chains: array of values from: Poultry, Vegetables, Grains & Cereals, Fruits, Dairy, Livestock, Aquaculture, Cocoa, Coffee, Cashew, Shea, Oil Palm, Cassava, Yam, Rice, Maize
- keywords: 1-3 word search terms for name/bio search
Only include fields that are clearly mentioned. Return {} if nothing is clear.`,
            prompt: `Query: "${query}"\n\nReturn JSON filters:`,
        });

        const match = result.match(/\{[\s\S]*\}/);
        if (!match) return NextResponse.json({ filters: {} });

        const filters = JSON.parse(match[0]);
        return NextResponse.json({ filters });
    } catch {
        return NextResponse.json({ filters: {} });
    }
}
