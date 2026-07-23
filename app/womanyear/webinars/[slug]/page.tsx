import { redirect } from 'next/navigation';

export default async function LegacyWebinarRedirect(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    redirect(`/webinars/${slug}`);
}
