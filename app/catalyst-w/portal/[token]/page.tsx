import type { Metadata } from 'next';
import FounderPortal from './FounderPortal';

// Private, per-founder page: never indexed, never cached.
export const metadata: Metadata = {
    title: 'Your Catalyst W founder page',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
};
export const dynamic = 'force-dynamic';

export default async function FounderPortalPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <FounderPortal token={token} />;
}
