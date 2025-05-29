// src/app/[locale]/chatbot/sotres/settingStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import {
    IS_STREAMING_ENABLED_DEFAULT,
    DEFAULT_LANGUAGE_REGULAR_CHAT,
    AVAILABLE_LANGUAGES_REGULAR_CHAT
} from '@/src/app/[locale]/chatbot/lib/constants'; // Adjust path

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
    isThoughtProcessHiddenInFloatingChat: boolean; // <-- NEW STATE
    currentLanguage: LanguageOption;
    availableLanguages: LanguageOption[];
    isPersonalizationEnabled: boolean; // <<< NEW STATE

}

export interface SettingsStoreActions {
    setChatMode: (mode: ChatMode) => void;
    setCurrentLocale: (locale: string) => void;
    setIsStreamingEnabled: (enabled: boolean) => void;
    setIsConversationToolbarHiddenInFloatingChat: (hidden: boolean) => void;
    setIsThoughtProcessHiddenInFloatingChat: (hidden: boolean) => void; // <-- NEW ACTION
    setCurrentLanguage: (language: LanguageOption) => void;
    setIsPersonalizationEnabled: (enabled: boolean) => void; // <<< NEW ACTION

}

const initialSettingsStoreState: SettingsStoreState = {
    chatMode: 'regular',
    currentLocale: 'vi',
    isStreamingEnabled: IS_STREAMING_ENABLED_DEFAULT,
    isConversationToolbarHiddenInFloatingChat: true,
    isThoughtProcessHiddenInFloatingChat: true, // <-- Default to hidden for floating chat
    currentLanguage: DEFAULT_LANGUAGE_REGULAR_CHAT,
    availableLanguages: AVAILABLE_LANGUAGES_REGULAR_CHAT,
    isPersonalizationEnabled: false, // <<< Default to false

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
                setIsThoughtProcessHiddenInFloatingChat: (hidden) => set({ isThoughtProcessHiddenInFloatingChat: hidden }, false, 'setIsThoughtProcessHiddenInFloatingChat'), // <-- IMPLEMENT NEW ACTION
                setCurrentLanguage: (language) => set({ currentLanguage: language }, false, 'setCurrentLanguage'),
                setIsPersonalizationEnabled: (enabled) => set({ isPersonalizationEnabled: enabled }, false, 'setIsPersonalizationEnabled'), // <<< IMPLEMENT NEW ACTION

            }),
            {
                name: 'chatbot-settings-storage-v1',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    chatMode: state.chatMode,
                    currentLocale: state.currentLocale,
                    isStreamingEnabled: state.isStreamingEnabled,
                    isConversationToolbarHiddenInFloatingChat: state.isConversationToolbarHiddenInFloatingChat,
                    isThoughtProcessHiddenInFloatingChat: state.isThoughtProcessHiddenInFloatingChat, // <-- PERSIST NEW STATE
                    currentLanguage: state.currentLanguage,
                    isPersonalizationEnabled: state.isPersonalizationEnabled, // <<< PERSIST NEW STATE

                }),
                onRehydrateStorage: () => (state) => {
                    if (state) {
                        state.availableLanguages = AVAILABLE_LANGUAGES_REGULAR_CHAT;
                        if (!AVAILABLE_LANGUAGES_REGULAR_CHAT.find(lang => lang.code === state.currentLanguage?.code)) {
                            state.currentLanguage = DEFAULT_LANGUAGE_REGULAR_CHAT;
                        }
                        // Ensure isPersonalizationEnabled has a default if not present in older storage
                        if (typeof state.isPersonalizationEnabled === 'undefined') {
                            state.isPersonalizationEnabled = false;
                        }
                    }
                }
            }
        ),
        { name: "SettingsStore" }
    )
);