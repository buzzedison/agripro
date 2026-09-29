export const FEED_TOPICS = [
    { value: 'general', label: 'Community' },
    { value: 'farming', label: 'Farming & growing' },
    { value: 'markets', label: 'Markets & trade' },
    { value: 'opportunities', label: 'Opportunities' },
    { value: 'questions', label: 'Questions' },
    { value: 'research', label: 'Research & insights' },
];
export type FeedAnnouncement = { id: string; title: string; body: string; active: boolean; expires_at: string | null };
export const communityError = (error: unknown) => (error as { message?: string })?.message || 'Something went wrong. Please try again.';
