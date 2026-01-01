'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page redirects to the new vendor dashboard
export default function OldVendorDashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/greenmarket/vendor-dashboard');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
    );
}
