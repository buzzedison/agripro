export type AIModel = 'claude' | 'gemini' | 'gpt-4' | 'mistral';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: Date;
  model?: AIModel;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export interface ModelSelectorProps {
  selectedModel: AIModel;
  models: AIModel[];
  onChange: (model: AIModel) => void;
}

export interface EmptyStateProps {
  onExampleClick: (message: string) => void;
} 