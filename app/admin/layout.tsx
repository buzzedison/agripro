'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  useEffect(() => {
    fetch('/api/admin/knowledge-hub/contributors/pending-count')
      .then((r) => r.ok ? r.json() : { count: 0 })
      .then((d) => setPendingSubmissions(d.count || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar pendingSubmissions={pendingSubmissions} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
