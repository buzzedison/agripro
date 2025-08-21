'use client';

import { usePathname } from 'next/navigation';
import Footer from "./Footer";

export default function ClientFooter() {
  const pathname = usePathname();
  const isKnowledgeHub = pathname?.startsWith('/knowledgehub');
  
  if (isKnowledgeHub) {
    return null;
  }
  
  return <Footer />;
}
