// src/app/[locale]/chatbot/stores/pageContextStore.ts
import { create } from 'zustand';

interface PageContextState {
  currentPageText: string | null;
  isCurrentPageFeatureEnabled: boolean; // True if not on main chatbot page and floating bot is open
  isContextAttachedNextSend: boolean; // Flag to indicate context should be sent with the next message
}

interface PageContextActions {
  setPageContext: (text: string | null, isEnabled: boolean) => void;
  clearPageContext: () => void;
  toggleContextAttachedNextSend: (attach: boolean) => void;
  resetContextAttachedNextSend: () => void;
}

const initialState: PageContextState = {
  currentPageText: null,
  isCurrentPageFeatureEnabled: false,
  isContextAttachedNextSend: false,
};

export const usePageContextStore = create<PageContextState & PageContextActions>()(
  (set) => ({
    ...initialState,
    setPageContext: (text, isEnabled) => set({ currentPageText: text, isCurrentPageFeatureEnabled: isEnabled }),
    clearPageContext: () => set({ currentPageText: null, isCurrentPageFeatureEnabled: false, isContextAttachedNextSend: false }),
    toggleContextAttachedNextSend: (attach) => set(state => {
      // Only allow attaching if the feature is enabled and context exists
      if (attach && state.isCurrentPageFeatureEnabled && state.currentPageText) {
        return { isContextAttachedNextSend: true };
      }
      return { isContextAttachedNextSend: false };
    }),
    resetContextAttachedNextSend: () => set({ isContextAttachedNextSend: false }),
  })
);