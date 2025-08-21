'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, MessageSquare, Zap, ZapOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from './useChat';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ChatbotDialogProps {
  isOpen: boolean;
  onCloseDialog?: () => void;
}

export default function ChatbotDialog({ isOpen, onCloseDialog }: ChatbotDialogProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, useAI, toggleAIMode } = useChat();
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Suggested questions to help users get started
  const suggestedQuestions = [
    "What are the best drought-resistant crops for East Africa?",
    "How can I improve soil fertility using organic methods?",
    "What are effective pest management techniques for maize?",
    "How is climate change affecting agriculture in Africa?",
    "What irrigation systems work best for small-scale farmers?"
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Hide suggestions once the user has started a conversation
  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (!isLoading) {
      sendMessage(question);
      setShowSuggestions(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      // Remove the chatbot query parameter if it exists
      const url = new URL(window.location.href);
      if (url.searchParams.has('chatbot')) {
        url.searchParams.delete('chatbot');
        router.replace(url.pathname + url.search);
      }
    }
    
    // Call the onCloseDialog callback if provided
    if (onCloseDialog) {
      onCloseDialog();
    }
  };

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (!href) return;
    e.preventDefault();
    
    // Check if it's an internal link (starts with / or #) or an AgriPro link
    const isInternalLink = href.startsWith('/') || 
                          href.startsWith('#') || 
                          href.includes('agripro') || 
                          !href.includes('://');
    
    if (isInternalLink) {
      // For internal links, close the chatbot and navigate
      handleClose();
      
      // Make sure the href has a leading slash for internal navigation
      const formattedHref = href.startsWith('/') ? href : `/${href}`;
      router.push(formattedHref);
    } else {
      // For external links, open in a new tab
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AgriPro AI Assistant</h3>
                  <div className="flex items-center text-xs text-white/80">
                    <span>Powered by {useAI ? 'Gemini AI' : 'Rule-based system'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleAIMode}
                  className="text-white/80 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
                  aria-label={useAI ? "Switch to rule-based mode" : "Switch to AI mode"}
                  title={useAI ? "Switch to rule-based mode" : "Switch to AI mode"}
                >
                  {useAI ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close chat"
                  title="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-lg text-gray-700 mb-2">AgriPro AI Assistant</h4>
                  <p className="max-w-xs mx-auto">
                    Ask me anything about agriculture, farming practices, or crop management in Africa. I can provide information from both AgriPro and external sources!
                  </p>
                  {useAI && (
                    <p className="text-xs text-gray-500 mt-2">
                      Powered by Gemini AI for intelligent responses
                    </p>
                  )}
                  {showSuggestions && (
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {suggestedQuestions.map((question, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(question)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 text-sm px-3 py-2 rounded-full transition-colors"
                          aria-label={`Ask: ${question}`}
                          title={question}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                a: ({ node, ...props }) => {
                                  const href = props.href || '';
                                  // Check if it's an external link
                                  const isExternalLink = href.includes('://') && 
                                                        !href.includes('agripro');
                                  
                                  return (
                                    <a
                                      {...props}
                                      onClick={(e) => handleLinkClick(href, e)}
                                      className={`underline cursor-pointer ${
                                        isExternalLink 
                                          ? 'text-blue-600 hover:text-blue-800' 
                                          : 'text-green-600 hover:text-green-800'
                                      }`}
                                      title={isExternalLink ? "Opens in a new tab" : undefined}
                                    >
                                      {props.children}
                                      {isExternalLink && ' ↗'}
                                    </a>
                                  );
                                },
                                p: ({ node, ...props }) => (
                                  <p {...props} className="mb-2" />
                                ),
                                ul: ({ node, ...props }) => (
                                  <ul {...props} className="list-disc pl-5 mb-2" />
                                ),
                                ol: ({ node, ...props }) => (
                                  <ol {...props} className="list-decimal pl-5 mb-2" />
                                ),
                                li: ({ node, ...props }) => (
                                  <li {...props} className="mb-1" />
                                ),
                                h1: ({ node, ...props }) => (
                                  <h1 {...props} className="text-lg font-bold mb-2 mt-3" />
                                ),
                                h2: ({ node, ...props }) => (
                                  <h2 {...props} className="text-md font-bold mb-2 mt-3" />
                                ),
                                h3: ({ node, ...props }) => (
                                  <h3 {...props} className="text-sm font-bold mb-2 mt-3" />
                                ),
                                code: ({ node, className, ...props }) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const isInline = !className || !match;
                                  return isInline ? 
                                    <code {...props} className="bg-gray-200 px-1 py-0.5 rounded text-sm" /> :
                                    <code {...props} className="block bg-gray-200 p-2 rounded text-sm overflow-x-auto my-2" />;
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                            {message.isAIResponse === false && (
                              <div className="mt-1 text-xs text-gray-500">
                                (Basic response)
                              </div>
                            )}
                            {message.isAIResponse === true && (
                              <div className="mt-1 text-xs text-blue-500">
                                (AI response)
                              </div>
                            )}
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          <p className="text-sm text-gray-500">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isLoading}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  title="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
