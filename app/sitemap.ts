import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agripro.com'

    // Static pages
    const staticPages = [
        '',
        '/about',
        '/services',
        '/contact',
        '/knowledgehub',
        '/knowledgehub/insights',
        '/knowledgehub/research',
        '/knowledgehub/practices',
        '/knowledgehub/videos',
        '/knowledgehub/whitepapers',
        '/connect',
        '/connect/directory',
        '/greenmarket',
        '/greenmarket/marketplace',
        '/greenmarket/vendors',
        '/fellowship',
        '/careers',
        '/get-involved',
    ]

    const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
        url: `${baseUrl}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page.includes('knowledgehub') || page.includes('greenmarket') ? 0.9 : 0.7,
    }))

    return sitemapEntries
}
