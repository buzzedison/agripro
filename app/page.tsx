// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Hero from './components/Hero';
import Impact from './components/Impact';
import KnowledgeHub from './components/KnowledgeHub';
import Solutions from './components/Solutions';
import GreenMarketPromo from './components/GreenMarketPromo';
import ConnectSection from './components/ConnectSection';
import FlagshipInitiatives from './components/FlagshipInitiatives';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Logged in users go to feed
        router.push('/feed');
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router, supabase]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <main>
      <Hero />
      <FlagshipInitiatives />
      <Solutions />
      <ConnectSection />
      <Impact />
      <KnowledgeHub />
      <GreenMarketPromo />
    </main>
  );
}