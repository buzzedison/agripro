export type AIModel = 'llama-70b' | 'llama-8b' | 'qwen-72b' | 'qwen-qwq';

export const MODEL_META: Record<AIModel, {
    label: string;
    description: string;
    badge: string;
    badgeColor: string;
    groqId: string;
    speed: 'fast' | 'standard';
}> = {
    'llama-70b': {
        label: 'AgriPro Smart',
        description: 'Best overall quality — deep reasoning, long answers',
        badge: 'Best Quality',
        badgeColor: 'bg-green-100 text-green-700',
        groqId: 'llama-3.3-70b-versatile',
        speed: 'standard',
    },
    'llama-8b': {
        label: 'AgriPro Quick',
        description: 'Fastest responses — great for quick questions',
        badge: 'Fastest',
        badgeColor: 'bg-blue-100 text-blue-700',
        groqId: 'llama-3.1-8b-instant',
        speed: 'fast',
    },
    'qwen-72b': {
        label: 'AgriPro Multilingual',
        description: 'French, Swahili, Hausa and more — ask in your language',
        badge: 'Multilingual',
        badgeColor: 'bg-purple-100 text-purple-700',
        groqId: 'qwen/qwen3-32b',
        speed: 'standard',
    },
    'qwen-qwq': {
        label: 'AgriPro Analyst',
        description: 'Deep analysis — best for research, finance and structured problems',
        badge: 'Analyst',
        badgeColor: 'bg-amber-100 text-amber-700',
        groqId: 'qwq-32b',
        speed: 'standard',
    },
};

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
    onChange: (model: AIModel) => void;
}

export interface EmptyStateProps {
    onExampleClick: (message: string) => void;
}
