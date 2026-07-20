'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    fetch('/api/admin/knowledge-hub/contributors/pending-count')
      .then((r) => r.ok ? r.json() : { count: 0 })
      .then((d) => setPendingSubmissions(d.count || 0))
      .catch(() => {});

    const supabase = createClient();
    (async () => {
      try {
        const { count } = await supabase
          .from('content_reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingReports(count || 0);
      } catch {
        // reports table may not exist yet if migration 043 hasn't been applied
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar pendingSubmissions={pendingSubmissions} pendingReports={pendingReports} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
