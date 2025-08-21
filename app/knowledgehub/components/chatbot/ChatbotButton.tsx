'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatbotDialog from './ChatbotDialog';

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <ChatbotDialog isOpen={isOpen} onCloseDialog={() => setIsOpen(false)} />
    </>
  );
}
