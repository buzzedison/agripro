'use client';

import { usePathname } from 'next/navigation';
import Navbar from "./Navbar";
import SummitNavbar from "./SummitNavbar";

export default function ClientNavbar() {
  const pathname = usePathname();
  const isKnowledgeHub = pathname?.startsWith('/knowledgehub');
  const isSummit = pathname?.startsWith('/africa-food-futures');
  const isChat = pathname?.startsWith('/chat');
  const isAdmin = pathname?.startsWith('/admin');

  if (isKnowledgeHub || isChat || isAdmin) return null;
  if (isSummit) return <SummitNavbar />;

  return <Navbar />;
}
