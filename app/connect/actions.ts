'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';

export async function getConnectionStatus(targetUserId: string): Promise<ConnectionStatus> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 'none';
    if (user.id === targetUserId) return 'none'; // No connection with self

    const { data: connection } = await supabase
        .from('user_connections')
        .select('requester_id, receiver_id, status')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
        .single();

    if (!connection) return 'none';

    if (connection.status === 'accepted') return 'accepted';
    if (connection.status === 'rejected') return 'rejected';

    if (connection.requester_id === user.id) return 'pending_sent';
    return 'pending_received';
}

export async function sendConnectionRequest(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_connections')
        .insert({
            requester_id: user.id,
            receiver_id: targetUserId,
            status: 'pending'
        });

    if (error) {
        console.error('Error sending connection request:', error);
        throw new Error('Failed to send connection request');
    }

    revalidatePath(`/connect/${targetUserId}`); // Revalidate profile page (if slug is ID)
    // We might need to handle slug revalidation if specific path is needed
}

export async function cancelConnectionRequest(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('requester_id', user.id)
        .eq('receiver_id', targetUserId)
        .eq('status', 'pending');

    if (error) {
        console.error('Error cancelling connection request:', error);
        throw new Error('Failed to cancel connection request');
    }

    revalidatePath(`/connect/${targetUserId}`);
}

export async function acceptConnectionRequest(requesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('requester_id', requesterId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

    if (error) {
        console.error('Error accepting connection request:', error);
        throw new Error('Failed to accept connection request');
    }

    revalidatePath(`/connect/${requesterId}`);
}

export async function rejectConnectionRequest(requesterId: string) {
    // We can either delete it or mark as rejected. 
    // Usually LinkedIn allows 'Ignore' (which deletes request) or keeps it hidden?
    // Let's go with DELETE for now so they can request again later, 
    // OR status='rejected' if we want to block span. 
    // Plan said 'rejected' status is possible. Let's use delete for "Ignore" behavior, 
    // but if we want explicit reject:

    // Implementation Plan Phase 1: Simple Reject (Delete request)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('requester_id', requesterId)
        .eq('receiver_id', user.id);

    if (error) {
        console.error('Error rejecting connection request:', error);
        throw new Error('Failed to reject connection request');
    }

    revalidatePath(`/connect/${requesterId}`);
}

export async function disconnect(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_connections')
        .delete()
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${user.id})`);

    if (error) {
        console.error('Error disconnecting:', error);
        throw new Error('Failed to disconnect');
    }

    revalidatePath(`/connect/${targetUserId}`);
}

export type PrivacySettings = {
    email: 'public' | 'connections' | 'private';
    phone: 'public' | 'connections' | 'private';
    location: 'public' | 'connections' | 'private';
    bio: 'public' | 'connections' | 'private';
};


export async function updatePrivacySettings(settings: PrivacySettings) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('profiles')
        .update({ privacy_settings: settings })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating privacy settings:', error);
        throw new Error('Failed to update privacy settings');
    }

    revalidatePath(`/connect/${user.id}`);
    revalidatePath(`/connect/profile/edit`);
}

export async function getProfileSecurely(identifier: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profileData: any = null;
    let error = null;

    // Resolve identifier to profile
    // Logic similar to page.tsx resolution (UUID vs Slug)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    if (isUUID) {
        const result = await supabase.from('profiles').select('*').eq('id', identifier).single();
        profileData = result.data;
        error = result.error;
    } else {
        // Slug resolution logic
        // ... (Simplified: assume direct ID lookup or perform slug query)
        // For security, strict slug lookup:
        // Attempt fetch by slug pattern logic
        const parts = identifier.split('-');
        const shortId = parts[parts.length - 1];
        const hasShortId = /^[0-9a-f]{8}$/i.test(shortId);

        if (hasShortId) {
            const { data: profiles } = await supabase.from('profiles').select('*');
            profileData = profiles?.find(p => p.id.toLowerCase().startsWith(shortId.toLowerCase()));
        }

        if (!profileData) {
            // Name search fallback
            const nameSearch = hasShortId ? parts.slice(0, -1).join(' ') : identifier.replace(/-/g, ' ');
            let result = await supabase.from('profiles').select('*').ilike('full_name', nameSearch).maybeSingle();
            if (!result.data) {
                result = await supabase.from('profiles').select('*').ilike('full_name', `%${nameSearch}%`).maybeSingle();
            }
            profileData = result.data;
        }
    }

    if (!profileData) return { data: null, error: 'Profile not found' };

    // Apply Privacy Masking
    const isOwner = user?.id === profileData.id;

    if (isOwner) {
        return { data: profileData, error: null };
    }

    // Check Connection Status
    let status: ConnectionStatus = 'none';
    if (user) {
        status = await getConnectionStatus(profileData.id);
    }

    const privacy = profileData.privacy_settings || {
        email: 'connections',
        phone: 'connections',
        location: 'public',
        bio: 'public'
    };

    const maskedProfile = { ...profileData };

    // Helper
    const canView = (field: keyof PrivacySettings) => {
        const value = privacy[field];
        if (value === 'public') return true;
        if (value === 'private') return false;
        if (value === 'connections') return status === 'accepted';
        return false;
    };

    if (!canView('email')) maskedProfile.email = null;
    if (!canView('phone')) maskedProfile.phone = null;
    // For Location: we might want to show Country but hide City? 
    // Current UI logic hides everything if 'location' is private. 
    // Let's stick to simple boolean masking for now. 
    if (!canView('location')) {
        maskedProfile.city = null;
        maskedProfile.region = null;
        // maskedProfile.country = null; // Maybe keep country visible? 
        // User request: "location". Usually country is fine, precise location (city) is private.
        // Let's hide City and Region, keep Country? or hide all?
        // Let's hide all for "Location hidden" message to make sense.
        maskedProfile.country = null;
    }
    if (!canView('bio')) maskedProfile.bio = null;

    // Mask whatsapp if phone is hidden (usually linked) or add explicit whatsapp setting? 
    // Current PrivacySettings has 'phone', let's treat whatsapp as phone.
    if (!canView('phone')) maskedProfile.whatsapp = null;

    return { data: maskedProfile, error: null };
}
