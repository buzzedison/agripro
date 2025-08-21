'use client';

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Loader2 } from 'lucide-react';
import { ChatInputProps } from '../types';

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div 
        className={`relative border rounded-xl transition-shadow duration-200 ${
          isFocused 
            ? 'shadow-[0_0_0_2px_rgba(34,197,94,0.4)] border-green-500' 
            : 'shadow-sm border-gray-200 hover:border-gray-300'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask anything about agriculture, farming techniques, crops, and more..."
          className="w-full p-4 pr-24 rounded-xl resize-none focus:outline-none min-h-[60px] max-h-[200px]"
          disabled={isLoading}
          rows={1}
        />
        
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <button
            type="button"
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Add attachment (coming soon)"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Add emoji (coming soon)"
          >
            <Smile className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`p-2 rounded-full transition-colors ${
              !message.trim() || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2 ml-2">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </form>
  );
} 