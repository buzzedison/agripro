export interface SearchSource {
    title: string;
    url: string;
    snippet: string;
    domain: string;
}

export async function webSearch(query: string): Promise<SearchSource[]> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return [];

    try {
        const res = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                max_results: 5,
                search_depth: 'basic',
                include_answer: false,
                include_raw_content: false,
            }),
        });

        if (!res.ok) return [];
        const data = await res.json();

        return (data.results ?? []).slice(0, 5).map((r: any) => ({
            title: r.title ?? '',
            url: r.url ?? '',
            snippet: (r.content ?? '').slice(0, 180),
            domain: (() => { try { return new URL(r.url).hostname.replace('www.', ''); } catch { return r.url; } })(),
        }));
    } catch {
        return [];
    }
}
