import { createClient } from '@/lib/supabase/client';

export type ReportTargetType = 'post' | 'comment' | 'user';
export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
    spam: 'Spam or scam',
    harassment: 'Harassment or hate speech',
    misinformation: 'False or misleading information',
    inappropriate: 'Inappropriate content',
    other: 'Something else',
};

export async function reportContent(params: {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
}) {
    const supabase = createClient();
    const { error } = await supabase.from('content_reports').insert({
        reporter_id: params.reporterId,
        target_type: params.targetType,
        target_id: params.targetId,
        reason: params.reason,
        details: params.details?.trim() || null,
    });
    if (error) throw error;
}

export async function blockUser(blockerId: string, blockedId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('user_blocks')
        .insert({ blocker_id: blockerId, blocked_id: blockedId });
    if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);
    if (error) throw error;
}

export async function muteUser(muterId: string, mutedId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('user_mutes')
        .insert({ muter_id: muterId, muted_id: mutedId });
    if (error) throw error;
}

export async function unmuteUser(muterId: string, mutedId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('user_mutes')
        .delete()
        .eq('muter_id', muterId)
        .eq('muted_id', mutedId);
    if (error) throw error;
}

export async function getBlockedUserIds(userId: string): Promise<Set<string>> {
    const supabase = createClient();
    const { data } = await supabase.from('user_blocks').select('blocked_id').eq('blocker_id', userId);
    return new Set((data || []).map((r) => r.blocked_id));
}

export async function getMutedUserIds(userId: string): Promise<Set<string>> {
    const supabase = createClient();
    const { data } = await supabase.from('user_mutes').select('muted_id').eq('muter_id', userId);
    return new Set((data || []).map((r) => r.muted_id));
}
