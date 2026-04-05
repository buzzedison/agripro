import { NextRequest } from 'next/server';
import { groq, AGRIPRO_SYSTEM_PROMPT } from '@/lib/groq';
import { webSearch, SearchSource } from '@/lib/search';
import { AIModel, MODEL_META } from '../../chat/types';

const MODEL_SETTINGS: Record<AIModel, { maxTokens: number; temperature: number; supportsTools: boolean }> = {
    'llama-70b': { maxTokens: 1536, temperature: 0.65, supportsTools: true },
    'llama-8b':  { maxTokens: 800,  temperature: 0.7,  supportsTools: true },
    'qwen-72b':  { maxTokens: 1536, temperature: 0.65, supportsTools: false },
    'qwen-qwq':  { maxTokens: 2048, temperature: 0.4,  supportsTools: false },
};

const WEB_SEARCH_TOOL = {
    type: 'function' as const,
    function: {
        name: 'web_search',
        description: 'Search the web for current market prices, recent news, research papers, policies, or any information that may have changed recently. Use this when the user asks about current prices, latest developments, specific statistics, or anything that benefits from up-to-date information.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'A focused search query. Include context like country or crop name for better results.',
                },
            },
            required: ['query'],
        },
    },
};

export async function POST(request: NextRequest) {
    try {
        const { message, model, history } = await request.json() as {
            message: string;
            model: AIModel;
            history: Array<{ role: 'user' | 'assistant'; content: string }>;
        };

        if (!message?.trim()) {
            return new Response(
                JSON.stringify({ error: 'Message is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!groq) {
            return new Response(
                JSON.stringify({ error: 'AI service not configured. Add GROQ_API_KEY to your environment.' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const modelMeta = MODEL_META[model] ?? MODEL_META['llama-70b'];
        const settings = MODEL_SETTINGS[model] ?? MODEL_SETTINGS['llama-70b'];

        const recentHistory = (history ?? [])
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-20)
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        const baseMessages: Array<{ role: string; content: string }> = [
            { role: 'system', content: AGRIPRO_SYSTEM_PROMPT },
            ...recentHistory,
            { role: 'user', content: message },
        ];

        // ── Round 1: tool-calling decision (non-streaming, fast) ────────────
        let searchSources: SearchSource[] = [];
        let toolMessages: any[] = [];

        if (settings.supportsTools && process.env.TAVILY_API_KEY) {
            try {
                const decision = await groq.chat.completions.create({
                    model: modelMeta.groqId,
                    messages: baseMessages as any,
                    tools: [WEB_SEARCH_TOOL],
                    tool_choice: 'auto',
                    max_tokens: 200,
                    temperature: settings.temperature,
                });

                const choice = decision.choices[0];
                if (choice?.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
                    const toolCall = choice.message.tool_calls[0];
                    if (toolCall.function.name === 'web_search') {
                        const { query } = JSON.parse(toolCall.function.arguments);
                        searchSources = await webSearch(query);

                        toolMessages = [
                            choice.message,
                            {
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(
                                    searchSources.map((s) => ({
                                        title: s.title,
                                        url: s.url,
                                        content: s.snippet,
                                    }))
                                ),
                            },
                        ];
                    }
                }
            } catch {
                // Tool calling failed — proceed without search
            }
        }

        // ── Round 2: streaming final answer ─────────────────────────────────
        const finalMessages = toolMessages.length
            ? [...baseMessages, ...toolMessages]
            : baseMessages;

        const stream = await groq.chat.completions.create({
            model: modelMeta.groqId,
            messages: finalMessages as any,
            max_tokens: settings.maxTokens,
            temperature: settings.temperature,
            stream: true,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    // Emit sources line first if we have any
                    if (searchSources.length > 0) {
                        controller.enqueue(
                            encoder.encode(`__SOURCES__:${JSON.stringify(searchSources)}\n`)
                        );
                    }

                    // Stream response — strip <think> blocks
                    let inThink = false;
                    let buf = '';
                    let firstChunk = true;

                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content ?? '';
                        if (!text) continue;

                        buf += text;
                        let output = '';

                        while (buf.length > 0) {
                            if (inThink) {
                                const end = buf.indexOf('</think>');
                                if (end !== -1) {
                                    buf = buf.slice(end + 8);
                                    inThink = false;
                                } else {
                                    buf = buf.slice(-9);
                                    break;
                                }
                            } else {
                                const start = buf.indexOf('<think>');
                                if (start !== -1) {
                                    output += buf.slice(0, start);
                                    buf = buf.slice(start + 7);
                                    inThink = true;
                                } else {
                                    const tail = buf.match(/<(?:t(?:h(?:i(?:n(?:k)?)?)?)?)?$/);
                                    if (tail?.index !== undefined) {
                                        output += buf.slice(0, tail.index);
                                        buf = buf.slice(tail.index);
                                    } else {
                                        output += buf;
                                        buf = '';
                                    }
                                    break;
                                }
                            }
                        }

                        if (firstChunk && output) {
                            output = output.replace(/^\s+/, '');
                            if (output) firstChunk = false;
                        }

                        if (output) controller.enqueue(encoder.encode(output));
                    }

                    if (!inThink && buf) controller.enqueue(encoder.encode(buf));

                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache, no-store',
                'X-Accel-Buffering': 'no',
            },
        });

    } catch (error: any) {
        console.error('Chat API error:', {
            status: error?.status,
            message: error?.message,
            groqError: error?.error,
        });

        if (error?.status === 429) {
            return new Response(
                JSON.stringify({ error: 'Too many requests — please wait a moment and try again.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
        if (error?.status === 401) {
            return new Response(
                JSON.stringify({ error: 'AI service authentication failed. Please check your API key.' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
        if (error?.status === 400 || error?.status === 404) {
            return new Response(
                JSON.stringify({ error: `Model unavailable: ${error?.error?.message ?? error?.message ?? 'unknown error'}` }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: error?.message ?? 'Something went wrong. Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
