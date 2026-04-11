'use client';

import { usePathname } from 'next/navigation';
import Footer from "./Footer";

export default function ClientFooter() {
  const pathname = usePathname();
  const isKnowledgeHub = pathname?.startsWith('/knowledgehub');
  const isSummit = pathname?.startsWith('/africa-food-futures');
  const isChat = pathname?.startsWith('/chat');
  const isAdmin = pathname?.startsWith('/admin');

  if (isKnowledgeHub || isSummit || isChat || isAdmin) {
    return null;
  }

  return <Footer />;
}
