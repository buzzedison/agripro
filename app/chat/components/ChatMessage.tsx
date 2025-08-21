'use client';

import React from 'react';
import { User, Bot, AlertCircle } from 'lucide-react';
import { ChatMessageProps } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

export default function ChatMessage({ message, isTyping }: ChatMessageProps) {
  const { role, content, createdAt, model } = message;
  
  const getModelIcon = (model: string | undefined) => {
    switch (model) {
      case 'claude':
        return '/images/claude-icon.png';
      case 'gemini':
        return '/images/gemini-icon.png';
      case 'gpt-4':
        return '/images/gpt-icon.png';
      case 'mistral':
        return '/images/mistral-icon.png';
      default:
        return null;
    }
  };

  const getBgColorClass = () => {
    switch (role) {
      case 'user':
        return 'bg-white';
      case 'assistant':
        return 'bg-green-50';
      case 'system':
        return 'bg-red-50';
      default:
        return 'bg-white';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const modelColor = {
    'claude': 'text-purple-600 bg-purple-50 border-purple-200',
    'gemini': 'text-blue-600 bg-blue-50 border-blue-200',
    'gpt-4': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'mistral': 'text-sky-600 bg-sky-50 border-sky-200',
  }[model || 'claude'];

  return (
    <div className={`p-5 rounded-xl mb-5 ${getBgColorClass()} border border-gray-100 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {role === 'user' ? (
            <div className="bg-blue-100 p-2.5 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          ) : role === 'assistant' ? (
            <div className="bg-green-100 p-2.5 rounded-full relative">
              {getModelIcon(model) ? (
                <div className="relative h-5 w-5">
                  <Image src={getModelIcon(model)!} alt={model || 'AI'} fill className="object-contain" />
                </div>
              ) : (
                <Bot className="h-5 w-5 text-green-600" />
              )}
            </div>
          ) : (
            <div className="bg-red-100 p-2.5 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">
              {role === 'user' ? 'You' : role === 'assistant' ? `AgriPro AI` : 'System'}
            </h4>
            
            {role === 'assistant' && model && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${modelColor}`}>
                {model}
              </span>
            )}
            
            <span className="text-xs text-gray-500">
              {formatTime(createdAt)}
            </span>
          </div>
          
          {role === 'assistant' && isTyping ? (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0ms' }}></span>
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '200ms' }}></span>
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
              <span>AgriPro AI is typing…</span>
            </div>
          ) : role === 'assistant' ? (
            <div className="prose prose-green prose-sm max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-3 mb-2 text-gray-900" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2 text-gray-900" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-2 text-gray-900" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  a: ({node, ...props}) => <a className="text-green-600 hover:text-green-700 underline" {...props} />,
                  // Fixed approach for code elements
                  code: (props) => {
                    const {className} = props;
                    // Check if it's an inline code block
                    const isInline = !className || !className.includes('language-');
                    
                    return isInline 
                      ? <code className="px-1 py-0.5 rounded-md bg-gray-100 text-gray-800 text-sm" {...props} />
                      : <code className="block bg-gray-800 text-gray-100 rounded-md p-3 text-sm overflow-x-auto" {...props} />;
                  },
                  pre: ({node, ...props}) => <pre className="bg-gray-800 rounded-md overflow-x-auto" {...props} />
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
} 