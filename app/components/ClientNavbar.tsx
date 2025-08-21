'use client';

import { usePathname } from 'next/navigation';
import Navbar from "./Navbar";

export default function ClientNavbar() {
  const pathname = usePathname();
  const isKnowledgeHub = pathname?.startsWith('/knowledgehub');
  
  if (isKnowledgeHub) {
    return null;
  }
  
  return <Navbar />;
}
