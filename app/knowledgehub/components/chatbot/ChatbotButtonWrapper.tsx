'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ChatbotButton component with no SSR
const ChatbotButton = dynamic(() => import('./ChatbotButton'), { ssr: false });

export default function ChatbotButtonWrapper() {
  return <ChatbotButton />;
}
