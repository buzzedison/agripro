export const WEBINAR_PLACEHOLDERS = {
    date: '[Insert Date]',
    time: '[Insert Time]',
    registrationLink: '[Insert Registration Link]',
} as const;

export const DEFAULT_WEBINAR = {
    title: 'How Women-Led Agribusinesses Can Access Markets, Capital, and Scale Support',
    subtitle: 'A practical webinar for women agripreneurs ready to become buyer-ready, capital-ready, and growth-ready.',
    summary:
        'Many women-led agribusinesses are not stuck because they lack ambition. They are stuck because something specific is blocking the next stage of growth. This webinar will help you identify your real growth constraint, understand what buyers look for, prepare your business for capital conversations, and know what kind of support you need to scale sustainably.',
    metaDescription:
        'Join this practical webinar for women-led agribusinesses across Africa and learn how to access markets, prepare for capital, identify growth constraints, and scale with the right support.',
    durationMinutes: 75,
    cost: 'Free',
    format: 'online' as const,
    bodyContent: `Across Africa, women are building the farms, food businesses, processing ventures, logistics systems, market platforms, and agri-solutions that keep food systems moving.

But growth does not happen by effort alone.

Many women-led agribusinesses are not stuck because they lack ambition. They are stuck because they lack the right access — to buyers, capital, market information, infrastructure, partners, and support that matches their real stage of growth.

This webinar is designed to help women agripreneurs understand what it takes to move from survival to structure, from opportunity to readiness, and from effort to scale.

## About the Webinar

This is a practical session for women founders and agribusiness leaders who want to grow stronger, enter better markets, attract the right support, and prepare their ventures for bigger opportunities.

This is not a motivational talk. It is a working session.

We will break down the real growth questions every agribusiness founder should be asking: What is stopping the next stage of growth? Is the business ready for buyers? Are the numbers clear enough for capital? Can the operation handle larger opportunities? What kind of support does the business actually need?

The goal is simple: to help women-led agribusinesses become easier to buy from, easier to fund, easier to partner with, and harder to ignore.

## What You Will Learn

By the end of this session, you will understand how to:

- Identify the real growth constraint holding your agribusiness back
- Prepare your business to approach buyers with confidence
- Understand what buyers look for before they transact
- Get your numbers, records, and story ready for capital conversations
- Know the difference between needing funding, markets, structure, or operational support
- Position your agribusiness for partnerships, investment, and scale opportunities
- Avoid wasting time in rooms that do not match your current growth stage

## Key Topics We Will Cover

### The Growth Constraint

Growth often slows down when a founder is solving the wrong problem. This session will help you name the real constraint before chasing the wrong solution.

### Buyer Readiness

Markets reward trust. We will explore what it means to become buyer-ready — product clarity, volume and supply capacity, quality standards, pricing, packaging, delivery, proof of reliability, and buyer communication.

### Capital Readiness

Capital follows clarity. We will break down what funders, investors, lenders, and partners often want to see before supporting an agribusiness — revenue records, margins, buyer evidence, use of funds, and a simple financial story.

### Scale Support

Not every business needs the same support. This webinar will help you understand what kind of support fits your business now — buyer introductions, compliance, packaging, logistics, processing, technology, financial modelling, or mentorship.

## Who Should Attend

This session is for women founders, operators, and leaders building in farming, food processing, value addition, farm technology, agri-finance, agri-logistics, market access, aggregation, food distribution, storage and cold chain, input supply, food systems infrastructure, climate-smart agriculture, export-ready food products, and agribusiness services.

It is also useful for ecosystem builders, partners, investors, funders, and organisations supporting women in agriculture and food systems.

## Why This Matters

Africa's food economy is full of opportunity. But opportunity does not automatically become growth. We are moving the conversation from inspiration to readiness — from "women need support" to "what specific support will unlock growth?"

## What You Will Leave With

You will leave the session with a clearer understanding of your current growth stage, the constraint most likely holding your agribusiness back, what to prepare before approaching buyers or funders, what kind of partner or support you need next, and how to think more strategically about markets, capital, and scale.

## About AgriPro Catalyst W

AgriPro Catalyst W is a 12-week accelerator for women-led agribusinesses across Africa — helping 40 women-led ventures strengthen their business models, connect to markets, prepare for capital, and build within a Pan-African ecosystem.

Catalyst W is built around four impact tracks: Farm Tech, Value Addition, Market Infrastructure, and Agri-Fintech. Applications are currently open.`,
};

export function slugifyTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
}

export function formatWebinarDate(iso: string, timezone: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: timezone,
        });
    } catch {
        return new Date(iso).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
}

export function formatWebinarTime(iso: string, timezone: string): string {
    try {
        const time = new Date(iso).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone,
        });
        const tz = timezone.replace('_', ' ');
        return `${time} (${tz})`;
    } catch {
        return new Date(iso).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}

export type CatalystWebinar = {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    summary?: string | null;
    body_content?: string | null;
    starts_at: string;
    timezone: string;
    duration_minutes: number;
    format: 'online' | 'in_person' | 'hybrid';
    venue?: string | null;
    cost: string;
    registration_url?: string | null;
    image_url?: string | null;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    featured: boolean;
    meta_description?: string | null;
    created_at: string;
    updated_at: string;
};
