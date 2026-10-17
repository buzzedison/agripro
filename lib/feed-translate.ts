// Shared between the Translate button and /api/ai/translate.
export const TRANSLATE_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'pt', label: 'Português' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'ha', label: 'Hausa' },
    { code: 'yo', label: 'Yorùbá' },
    { code: 'ig', label: 'Igbo' },
    { code: 'am', label: 'አማርኛ (Amharic)' },
    { code: 'ar', label: 'العربية' },
    { code: 'tw', label: 'Twi' },
] as const;

export type TranslateLanguage = typeof TRANSLATE_LANGUAGES[number]['code'];

export const LANGUAGE_NAMES: Record<TranslateLanguage, string> = {
    en: 'English', fr: 'French', pt: 'Portuguese', sw: 'Swahili', ha: 'Hausa',
    yo: 'Yoruba', ig: 'Igbo', am: 'Amharic', ar: 'Arabic', tw: 'Twi (Akan)',
};

export const MAX_TRANSLATE_CHARS = 5000;
