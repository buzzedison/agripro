import { NextRequest, NextResponse } from 'next/server';
import { Message, AIModel } from '../../chat/types';

// Sample agricultural knowledge prompts for different topics
const AGRICULTURE_CONTEXT = `
You are an AI assistant for AgriPro, a platform dedicated to advancing sustainable agriculture practices.
You specialize in providing expert information about farming, crops, agricultural technologies, and sustainable practices.
Focus on being helpful, accurate, and educational in the agricultural domain.
If you don't know the answer to a question, admit it instead of making up information.
Always provide practical, actionable advice when possible, citing best practices in the agricultural industry.
`;

export interface ChatRequest {
  message: string;
  model: AIModel;
  history: Message[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, model, history } = await request.json() as ChatRequest;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Format conversation history for context
    const formattedHistory = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    
    let aiResponse = '';

    if (model === 'gemini') {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('Gemini API key not set in environment variables');
        }
        // Gemini API expects a specific format
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey;
        const geminiMessages = [
          { role: 'user', parts: [{ text: AGRICULTURE_CONTEXT }] },
          ...history.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          { role: 'user', parts: [{ text: message }] },
        ];
        const geminiBody = {
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topP: 1,
            maxOutputTokens: 1024,
          },
        };
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody),
        });
        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          throw new Error('Gemini API error: ' + errText);
        }
        const geminiData = await geminiRes.json();
        aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      } catch (err) {
        console.error('Gemini API error:', err);
        aiResponse = 'Sorry, there was an error connecting to Gemini. Please try again later.';
      }
    } else {
      // For demo purposes, keep simulated responses for other models
      const responses = {
        'claude': generateSimulatedResponse(message, model),
        'gemini': generateSimulatedResponse(message, model),
        'gpt-4': generateSimulatedResponse(message, model),
        'mistral': generateSimulatedResponse(message, model),
      };
      aiResponse = responses[model] || responses['claude'];
    }

    return NextResponse.json({ message: aiResponse });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper function to generate simulated responses
function generateSimulatedResponse(message: string, model: AIModel): string {
  const lowerMessage = message.toLowerCase();
  
  // Handle slash commands
  if (message.startsWith('/code')) {
    const content = message.replace('/code', '').trim();
    return content ? `\`\`\`\n${content}\n\`\`\`` : "```\n// Your code here\n```";
  }
  
  if (message.startsWith('/')) {
    // Handle other potential slash commands
    return `I see you're trying to use a slash command. Currently supported commands:
- \`/code\` - Create a code block
- For other formatting, you can use markdown syntax directly.`;
  }
  
  // Check for common agricultural topics
  if (lowerMessage.includes('sustainable') || lowerMessage.includes('practice')) {
    return `## Sustainable Agricultural Practices

Based on current research, here are some sustainable farming practices that can help reduce environmental impact while maintaining productivity:

1. **Crop Rotation** - Alternating crops in a specific sequence to improve soil health and reduce pest pressure
2. **Cover Cropping** - Planting specific crops to cover soil between growing seasons to prevent erosion and add organic matter
3. **Reduced Tillage** - Minimizing soil disturbance to preserve soil structure and reduce erosion
4. **Precision Agriculture** - Using technology (GPS, sensors, drones) to apply inputs exactly where and when needed
5. **Integrated Pest Management (IPM)** - Using a combination of practices to control pests while minimizing chemical use

These practices not only benefit the environment but can also improve long-term farm profitability by reducing input costs and improving soil health.`;
  }
  
  if (lowerMessage.includes('crop') && (lowerMessage.includes('disease') || lowerMessage.includes('pest'))) {
    return `## Crop Disease Management

Effective crop disease management requires an integrated approach:

1. **Prevention**:
   - Choose disease-resistant varieties when available
   - Ensure proper crop rotation to break disease cycles
   - Maintain optimal plant spacing for air circulation

2. **Monitoring**:
   - Scout fields regularly (at least weekly during growing season)
   - Look for symptoms on leaves, stems, and fruit
   - Consider using disease prediction models where available

3. **Intervention**:
   - Cultural: Remove infected plant material
   - Biological: Use beneficial organisms when appropriate
   - Chemical: Apply fungicides or bactericides only when necessary

Early detection is critical - most diseases are much easier to manage when caught early. Consider working with an extension service for assistance with diagnosis and treatment recommendations.`;
  }
  
  if (lowerMessage.includes('water') || lowerMessage.includes('irrigation')) {
    return `## Optimizing Irrigation for Water Conservation

Water conservation in agriculture is increasingly important as water resources become more constrained. Here are key strategies:

1. **Irrigation Scheduling**:
   - Use soil moisture sensors to determine when to irrigate
   - Consider evapotranspiration (ET) data to estimate crop water needs
   - Irrigate during cooler times of day to reduce evaporation

2. **Efficient Delivery Systems**:
   - Drip irrigation can be 90% efficient compared to 50-70% for sprinklers
   - Subsurface drip irrigation further reduces evaporation losses
   - Maintain and inspect systems regularly for leaks or clogs

3. **Agronomic Practices**:
   - Build soil organic matter to increase water-holding capacity
   - Use mulch to reduce evaporation from soil surface
   - Consider deficit irrigation for certain crops during non-critical growth stages

4. **Technology Adoption**:
   - Smart irrigation controllers that adjust based on weather conditions
   - Remote monitoring systems to track soil moisture and system performance
   - Variable rate irrigation to apply different amounts based on field conditions

These approaches can typically reduce water use by 15-30% while maintaining crop yields.`;
  }
  
  // Default response if no specific topic is matched
  return `Thank you for your question about "${message}". 

As an agricultural assistant, I'm here to help with questions about farming techniques, crop management, sustainable practices, agricultural technology, and related topics.

Could you provide a bit more detail about your specific interest in this area? For example:
- Are you looking for information about a specific crop or farming system?
- Do you have a particular challenge you're trying to address?
- Are you interested in conventional or organic approaches?

With more context, I can provide more targeted and useful information for your situation.`;
} 