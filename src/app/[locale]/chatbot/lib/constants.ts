// src/app/[locale]/chatbot/lib/constants.ts
import { Modality } from '@google/genai';
import {
    LanguageOption as LiveChatLanguageOption,
    PrebuiltVoice,
    Language as LiveChatLanguageCode,
} from './live-chat.types';

import { LanguageOption as RegularChatLanguageOption } from './regular-chat.types';
// --- Constants cho Live Chat ---
export const AVAILABLE_VOICES_LIVE_CHAT: PrebuiltVoice[] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Leda", "Orus", "Zephyr"];

// BỎ thuộc tính 'value' nếu không cần thiết
export const AVAILABLE_LANGUAGES_LIVE_CHAT: LiveChatLanguageOption[] = [
    { name: 'Tiếng Việt', code: 'vi', flagCode: 'vn' },
    { name: 'English', code: 'en', flagCode: 'gb' },
    { name: '中文', code: 'zh', flagCode: 'cn' },
    { name: 'Deutsch', code: 'de', flagCode: 'de' },
    { name: 'Français', code: 'fr', flagCode: 'fr' },
    { name: 'Español', code: 'es', flagCode: 'es' },
    { name: 'Русский', code: 'ru', flagCode: 'ru' },
    { name: '日本語', code: 'ja', flagCode: 'jp' },
    { name: '한국어', code: 'ko', flagCode: 'kr' },
    { name: 'العربية', code: 'ar', flagCode: 'sa' },
];

export const DEFAULT_LANGUAGE_LIVE_CHAT: LiveChatLanguageCode = 'vi';
export const DEFAULT_VOICE_LIVE_CHAT: PrebuiltVoice = 'Puck';
export const DEFAULT_MODALITY_LIVE_CHAT = Modality.AUDIO;

// --- Constants cho Regular Chat (VÀ CÓ THỂ DÙNG CHUNG) ---
export const AVAILABLE_LANGUAGES_REGULAR_CHAT: RegularChatLanguageOption[] = [
    { name: 'Tiếng Việt', code: 'vi', flagCode: 'vn' },
    { name: 'English', code: 'en', flagCode: 'gb' },
    { name: '中文', code: 'zh', flagCode: 'cn' },
    { name: 'Deutsch', code: 'de', flagCode: 'de' },
    { name: 'Français', code: 'fr', flagCode: 'fr' },
    { name: 'Español', code: 'es', flagCode: 'es' },
    { name: 'Русский', code: 'ru', flagCode: 'ru' },
    { name: '日本語', code: 'ja', flagCode: 'jp' },
    { name: '한국어', code: 'ko', flagCode: 'kr' },
    { name: 'العربية', code: 'ar', flagCode: 'sa' },
];

export const DEFAULT_LANGUAGE_REGULAR_CHAT: RegularChatLanguageOption = AVAILABLE_LANGUAGES_REGULAR_CHAT[0];
export const IS_STREAMING_ENABLED_DEFAULT: boolean = true;

// --- API Configuration ---
export const API_HOST = "generativelanguage.googleapis.com";
export const API_URI = `wss://${API_HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;



// Đường dẫn đến trang chatbot chính (không có locale prefix)
// Đảm bảo nó khớp với định nghĩa trong `pathnames` của `src/navigation.ts`
export const MAIN_CHATBOT_PAGE_PATH = '/chatbot/regularchat';

export const CURRENT_PAGE_CONTEXT_COMMAND = "@currentpage";
export const CURRENT_PAGE_CONTEXT_SUGGESTION_KEY = "ChatInput_Suggestion_CurrentPage";
export const CURRENT_PAGE_CONTEXT_INFO_TEXT_KEY = "ChatInput_Info_UsingCurrentPageContext";
export const CURRENT_PAGE_CONTEXT_DISABLED_TEXT_KEY = "ChatInput_Error_CurrentPageDisabled";