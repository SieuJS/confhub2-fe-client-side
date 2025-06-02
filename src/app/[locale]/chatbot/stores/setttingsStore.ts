// src/app/[locale]/chatbot/stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import {
    IS_STREAMING_ENABLED_DEFAULT,
    DEFAULT_LANGUAGE_REGULAR_CHAT,
    AVAILABLE_LANGUAGES_REGULAR_CHAT
} from '@/src/app/[locale]/chatbot/lib/constants';
import { AVAILABLE_MODELS, DEFAULT_MODEL, ModelOption as ModelOptionType } from '@/src/app/[locale]/chatbot/lib/models';

export type LanguageCode = 'en' | 'vi' | 'zh' | 'de' | 'fr' | 'es' | 'ru' | 'ja' | 'ko' | 'ar';
export type ChatMode = 'live' | 'regular';
export interface LanguageOption {
    code: LanguageCode;
    name: string;
    flagCode: string;
}

export type ModelOption = ModelOptionType;

export interface SettingsStoreState {
    chatMode: ChatMode;
    currentLocale: string;
    isStreamingEnabled: boolean;
    isConversationToolbarHiddenInFloatingChat: boolean;
    isThoughtProcessHiddenInFloatingChat: boolean;
    currentLanguage: LanguageOption;
    availableLanguages: LanguageOption[];
    isPersonalizationEnabled: boolean;
    selectedModel: ModelOption; // Đây sẽ là object ModelOption đầy đủ trong state
}

// Interface cho state được lưu vào localStorage (chỉ chứa value của model)
interface PersistedSettingsState {
    chatMode: ChatMode;
    currentLocale: string;
    isStreamingEnabled: boolean;
    isConversationToolbarHiddenInFloatingChat: boolean;
    isThoughtProcessHiddenInFloatingChat: boolean;
    currentLanguage: LanguageOption;
    isPersonalizationEnabled: boolean;
    selectedModelValue: string; // <<< Chỉ lưu value của model
}

export interface SettingsStoreActions {
    setChatMode: (mode: ChatMode) => void;
    setCurrentLocale: (locale: string) => void;
    setIsStreamingEnabled: (enabled: boolean) => void;
    setIsConversationToolbarHiddenInFloatingChat: (hidden: boolean) => void;
    setIsThoughtProcessHiddenInFloatingChat: (hidden: boolean) => void;
    setCurrentLanguage: (language: LanguageOption) => void;
    setIsPersonalizationEnabled: (enabled: boolean) => void;
    setSelectedModel: (model: ModelOption) => void;
}

const initialSettingsStoreState: SettingsStoreState = {
    chatMode: 'regular',
    currentLocale: 'vi',
    isStreamingEnabled: IS_STREAMING_ENABLED_DEFAULT,
    isConversationToolbarHiddenInFloatingChat: true,
    isThoughtProcessHiddenInFloatingChat: true,
    currentLanguage: DEFAULT_LANGUAGE_REGULAR_CHAT,
    availableLanguages: AVAILABLE_LANGUAGES_REGULAR_CHAT,
    isPersonalizationEnabled: false,
    selectedModel: DEFAULT_MODEL,
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
                setSelectedModel: (model) => set({ selectedModel: model }, false, 'setSelectedModel'),

            }),
            {
                name: 'chatbot-settings-storage-v1',
                storage: createJSONStorage(() => localStorage),
                // partialize để chỉ lưu những gì cần thiết và có thể serialize
                partialize: (state): PersistedSettingsState => ({
                    chatMode: state.chatMode,
                    currentLocale: state.currentLocale,
                    isStreamingEnabled: state.isStreamingEnabled,
                    isConversationToolbarHiddenInFloatingChat: state.isConversationToolbarHiddenInFloatingChat,
                    isThoughtProcessHiddenInFloatingChat: state.isThoughtProcessHiddenInFloatingChat,
                    currentLanguage: state.currentLanguage,
                    isPersonalizationEnabled: state.isPersonalizationEnabled,
                    selectedModelValue: state.selectedModel.value, // <<< Chỉ lưu value
                }),
                // onRehydrateStorage để khôi phục state đầy đủ từ persisted state
                onRehydrateStorage: () => (state, error) => {
                    if (error) {
                        console.error("Failed to rehydrate settings store:", error);
                        // Có thể reset về initial state nếu có lỗi nghiêm trọng
                        // Object.assign(state, initialSettingsStoreState);
                        // return;
                    }
                    if (state) {
                        // Luôn gán lại availableLanguages vì nó không được persist
                        state.availableLanguages = AVAILABLE_LANGUAGES_REGULAR_CHAT;

                        // Khôi phục currentLanguage
                        if (!AVAILABLE_LANGUAGES_REGULAR_CHAT.find(lang => lang.code === state.currentLanguage?.code)) {
                            state.currentLanguage = DEFAULT_LANGUAGE_REGULAR_CHAT;
                        }

                        // Khôi phục isPersonalizationEnabled
                        if (typeof state.isPersonalizationEnabled === 'undefined') {
                            state.isPersonalizationEnabled = false;
                        }

                        // Khôi phục selectedModel đầy đủ từ selectedModelValue
                        // state.selectedModelValue là giá trị đã được persist
                        const persistedModelValue = (state as any).selectedModelValue as string | undefined;
                        let rehydratedModel = DEFAULT_MODEL; // Mặc định

                        if (persistedModelValue) {
                            const foundModel = AVAILABLE_MODELS.find(m => m.value === persistedModelValue);
                            if (foundModel) {
                                rehydratedModel = foundModel;
                            }
                        }
                        state.selectedModel = rehydratedModel; // Gán object model đầy đủ

                        // Xóa selectedModelValue khỏi state sau khi đã dùng để khôi phục
                        // để state trong bộ nhớ khớp với SettingsStoreState
                        delete (state as any).selectedModelValue;
                    }
                }
            }
        ),
        { name: "SettingsStore" }
    )
);