'use client';

import { usePathname } from 'next/navigation';
import Footer from "./Footer";

export default function ClientFooter() {
  const pathname = usePathname();
  const isKnowledgeHub = pathname?.startsWith('/knowledgehub');
  const isSummit = pathname?.startsWith('/africa-food-futures');

  if (isKnowledgeHub || isSummit) {
    return null;
  }

  return <Footer />;
}
