'use client';

import { useState, useEffect, useRef } from 'react';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import ModelSelector from './components/ModelSelector';
import EmptyState from './components/EmptyState';
import { Message, AIModel } from './types';
import { Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Style to hide any parent layouts
const HideFooterStyle = () => (
  <style jsx global>{`
    footer, nav {
      display: none !important;
    }
    
    /* Ensure our layout takes full height */
    body > div, 
    body > main {
      height: 100vh !important;
      overflow: hidden !important;
    }
  `}</style>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available AI models
  const models: AIModel[] = ['claude', 'gemini', 'gpt-4', 'mistral'];

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          model: selectedModel,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        content: data.message,
        role: 'assistant',
        createdAt: new Date(),
        model: selectedModel,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        content: 'Sorry, there was an error processing your request. Please try again.',
        role: 'system',
        createdAt: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
  };

  // Change AI model
  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
  };

  return (
    <>
      <HideFooterStyle />
      <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="mr-6 flex items-center text-green-700 hover:text-green-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="font-medium">Back to AgriPro</span>
              </Link>
              <h1 className="text-2xl font-bold flex items-center text-green-700">
                <Sparkles className="mr-2 h-5 w-5" />
                AgriPro AI Assistant
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ModelSelector 
                selectedModel={selectedModel} 
                models={models} 
                onChange={handleModelChange} 
              />
              <button
                onClick={handleClearChat}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Clear chat"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Clear</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent p-4 bg-[url('/images/subtle-pattern.png')] bg-repeat">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <EmptyState onExampleClick={handleSendMessage} />
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <ChatMessage
                    message={{
                      id: 'typing-indicator',
                      content: 'AgriPro AI is typing…',
                      role: 'assistant',
                      createdAt: new Date(),
                      model: selectedModel,
                    }}
                    isTyping
                  />
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
} 