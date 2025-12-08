import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Validate URL
        const parsedUrl = new URL(url);

        // Fetch the page HTML
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AgriProBot/1.0; +https://agripro.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        const html = await response.text();

        // Extract Open Graph and meta tags
        const getMetaContent = (html: string, property: string): string | undefined => {
            // Try og: tags first
            const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i'));
            if (ogMatch) return ogMatch[1];

            // Try twitter: tags
            const twitterMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`, 'i'));
            if (twitterMatch) return twitterMatch[1];

            // Try regular meta tags
            const metaMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
                || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'));
            return metaMatch?.[1];
        };

        // Extract title
        let title = getMetaContent(html, 'title');
        if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            title = titleMatch?.[1]?.trim();
        }

        // Extract description
        const description = getMetaContent(html, 'description');

        // Extract image
        let image = getMetaContent(html, 'image');
        if (image && !image.startsWith('http')) {
            // Make relative URLs absolute
            image = new URL(image, url).href;
        }

        // Extract site name
        const siteName = getMetaContent(html, 'site_name') || parsedUrl.hostname;

        // Extract favicon
        let favicon: string | undefined;
        const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
            || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
        if (faviconMatch) {
            favicon = faviconMatch[1];
            if (!favicon.startsWith('http')) {
                favicon = new URL(favicon, url).href;
            }
        } else {
            // Default to /favicon.ico
            favicon = `${parsedUrl.origin}/favicon.ico`;
        }

        return NextResponse.json({
            url,
            title: title ? decodeHTMLEntities(title) : undefined,
            description: description ? decodeHTMLEntities(description) : undefined,
            image,
            siteName,
            favicon,
        });
    } catch (error: any) {
        console.error('Link preview error:', error.message);

        // Return basic info even on error
        try {
            const parsedUrl = new URL(url);
            return NextResponse.json({
                url,
                title: parsedUrl.hostname,
                siteName: parsedUrl.hostname,
            });
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }
    }
}

// Helper to decode HTML entities
function decodeHTMLEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&nbsp;/g, ' ');
}
