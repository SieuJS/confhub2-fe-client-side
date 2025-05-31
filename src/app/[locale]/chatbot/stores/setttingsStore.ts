// src/app/[locale]/chatbot/stores/settingStore.ts // Corrected path from "sotres" to "stores"
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import {
    IS_STREAMING_ENABLED_DEFAULT,
    DEFAULT_LANGUAGE_REGULAR_CHAT,
    AVAILABLE_LANGUAGES_REGULAR_CHAT
} from '@/src/app/[locale]/chatbot/lib/constants';

// --- Types for Settings Store ---
export type LanguageCode = 'en' | 'vi' | 'zh' | 'de' | 'fr' | 'es' | 'ru' | 'ja' | 'ko' | 'ar';
export type ChatMode = 'live' | 'regular';
export interface LanguageOption {
    code: LanguageCode;
    name: string;
    flagCode: string;
}

export interface SettingsStoreState {
    chatMode: ChatMode;
    currentLocale: string;
    isStreamingEnabled: boolean;
    isConversationToolbarHiddenInFloatingChat: boolean;
    isThoughtProcessHiddenInFloatingChat: boolean;
    currentLanguage: LanguageOption;
    availableLanguages: LanguageOption[];
    isPersonalizationEnabled: boolean;
    isGoogleSearchEnabled: boolean; // <<< NEW STATE for Google Search
}

export interface SettingsStoreActions {
    setChatMode: (mode: ChatMode) => void;
    setCurrentLocale: (locale: string) => void;
    setIsStreamingEnabled: (enabled: boolean) => void;
    setIsConversationToolbarHiddenInFloatingChat: (hidden: boolean) => void;
    setIsThoughtProcessHiddenInFloatingChat: (hidden: boolean) => void;
    setCurrentLanguage: (language: LanguageOption) => void;
    setIsPersonalizationEnabled: (enabled: boolean) => void;
    setIsGoogleSearchEnabled: (enabled: boolean) => void; // <<< NEW ACTION for Google Search
}

const initialSettingsStoreState: SettingsStoreState = {
    chatMode: 'regular',
    currentLocale: 'vi', // Or your default locale
    isStreamingEnabled: IS_STREAMING_ENABLED_DEFAULT,
    isConversationToolbarHiddenInFloatingChat: true,
    isThoughtProcessHiddenInFloatingChat: true,
    currentLanguage: DEFAULT_LANGUAGE_REGULAR_CHAT,
    availableLanguages: AVAILABLE_LANGUAGES_REGULAR_CHAT,
    isPersonalizationEnabled: false,
    isGoogleSearchEnabled: false, // <<< Default to false
};

export const useSettingsStore = create<SettingsStoreState & SettingsStoreActions>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialSettingsStoreState,

                setChatMode: (mode) => {
                    if (get().chatMode === mode) return;
                    set({ chatMode: mode }, false, `setChatMode/${mode}`);
                },
                setCurrentLocale: (locale) => {
                    if (get().currentLocale === locale) return;
                    set({ currentLocale: locale }, false, 'setCurrentLocale');
                },
                setIsStreamingEnabled: (enabled) => set({ isStreamingEnabled: enabled }, false, 'setIsStreamingEnabled'),
                setIsConversationToolbarHiddenInFloatingChat: (hidden) => set({ isConversationToolbarHiddenInFloatingChat: hidden }, false, 'setIsConversationToolbarHiddenInFloatingChat'),
                setIsThoughtProcessHiddenInFloatingChat: (hidden) => set({ isThoughtProcessHiddenInFloatingChat: hidden }, false, 'setIsThoughtProcessHiddenInFloatingChat'),
                setCurrentLanguage: (language) => set({ currentLanguage: language }, false, 'setCurrentLanguage'),
                setIsPersonalizationEnabled: (enabled) => set({ isPersonalizationEnabled: enabled }, false, 'setIsPersonalizationEnabled'),
                setIsGoogleSearchEnabled: (enabled) => set({ isGoogleSearchEnabled: enabled }, false, 'setIsGoogleSearchEnabled'), // <<< IMPLEMENT NEW ACTION

            }),
            {
                name: 'chatbot-settings-storage-v1',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    // Only persist necessary fields
                    chatMode: state.chatMode,
                    currentLocale: state.currentLocale,
                    isStreamingEnabled: state.isStreamingEnabled,
                    isConversationToolbarHiddenInFloatingChat: state.isConversationToolbarHiddenInFloatingChat,
                    isThoughtProcessHiddenInFloatingChat: state.isThoughtProcessHiddenInFloatingChat,
                    currentLanguage: state.currentLanguage,
                    isPersonalizationEnabled: state.isPersonalizationEnabled,
                    isGoogleSearchEnabled: state.isGoogleSearchEnabled, // <<< PERSIST NEW STATE
                }),
                onRehydrateStorage: () => (state, error) => {
                    if (error) {
                        console.error("Error rehydrating settings store:", error);
                        // Potentially reset to initial state or handle error
                    }
                    if (state) {
                        // Ensure dynamic/non-serializable parts are re-initialized
                        state.availableLanguages = AVAILABLE_LANGUAGES_REGULAR_CHAT;

                        // Validate currentLanguage or reset to default
                        if (!AVAILABLE_LANGUAGES_REGULAR_CHAT.find(lang => lang.code === state.currentLanguage?.code)) {
                            state.currentLanguage = DEFAULT_LANGUAGE_REGULAR_CHAT;
                        }

                        // Ensure new boolean flags have defaults if not present in older storage
                        if (typeof state.isPersonalizationEnabled === 'undefined') {
                            state.isPersonalizationEnabled = initialSettingsStoreState.isPersonalizationEnabled;
                        }
                        if (typeof state.isGoogleSearchEnabled === 'undefined') {
                            state.isGoogleSearchEnabled = initialSettingsStoreState.isGoogleSearchEnabled;
                        }
                        if (typeof state.isThoughtProcessHiddenInFloatingChat === 'undefined') {
                            state.isThoughtProcessHiddenInFloatingChat = initialSettingsStoreState.isThoughtProcessHiddenInFloatingChat;
                        }
                    }
                }
            }
        ),
        { name: "SettingsStore" }
    )
);