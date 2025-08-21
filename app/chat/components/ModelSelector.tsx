'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckIcon } from 'lucide-react';
import { ModelSelectorProps } from '../types';
import Image from 'next/image';

export default function ModelSelector({ selectedModel, models, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modelLabels: Record<string, string> = {
    'claude': 'Claude',
    'gemini': 'Gemini',
    'gpt-4': 'GPT-4',
    'mistral': 'Mistral',
  };
  
  const modelDescriptions: Record<string, string> = {
    'claude': 'Balanced and thoughtful responses by Anthropic',
    'gemini': 'Google\'s most capable and general model',
    'gpt-4': 'Advanced reasoning capabilities by OpenAI',
    'mistral': 'Efficient open-source language model',
  };
  
  const modelColors: Record<string, string> = {
    'claude': 'border-purple-200 text-purple-600',
    'gemini': 'border-blue-200 text-blue-600',
    'gpt-4': 'border-emerald-200 text-emerald-600',
    'mistral': 'border-sky-200 text-sky-600',
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectModel = (model: string) => {
    onChange(model as any);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  const getModelIcon = (model: string) => {
    return `/images/${model}-icon.png`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors ${modelColors[selectedModel]} border-opacity-50`}
      >
        <div className="relative w-5 h-5 mr-1">
          <Image 
            src={getModelIcon(selectedModel)} 
            alt={selectedModel} 
            width={20} 
            height={20} 
            className="object-contain"
          />
        </div>
        <span className="font-medium">{modelLabels[selectedModel]}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1.5">
              Select AI Model
            </div>
            
            <div className="space-y-1">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => handleSelectModel(model)}
                  className={`w-full text-left p-2.5 text-sm flex items-center gap-3 rounded-md transition-colors ${
                    selectedModel === model 
                      ? 'bg-green-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-full bg-white border p-1.5 flex-shrink-0">
                    <Image 
                      src={getModelIcon(model)} 
                      alt={model} 
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{modelLabels[model]}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{modelDescriptions[model]}</p>
                  </div>
                  
                  {selectedModel === model && (
                    <CheckIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 