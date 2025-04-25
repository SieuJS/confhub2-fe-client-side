// src/lib/constants.ts
import { LanguageOption, PrebuiltVoice, Language, OutputModality } from './live-chat.types';

export const AVAILABLE_VOICES: PrebuiltVoice[] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Orus", "Zephyr"];

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English', flagCode: 'gb' },
    { code: 'vi', name: 'Tiếng Việt', flagCode: 'vn' },
    { code: 'zh', name: '中文', flagCode: 'cn' },
    // Add other languages
];

export const DEFAULT_LANGUAGE: Language = 'vi';
export const DEFAULT_VOICE: PrebuiltVoice = 'Puck';
export const DEFAULT_MODALITY: OutputModality = 'audio';

// API Configuration (Consider environment variables)
export const API_HOST = "generativelanguage.googleapis.com";
export const API_URI = `wss://${API_HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;