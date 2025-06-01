// src/app/[locale]/chatbot/stores/pageContextStore.ts
import { create } from 'zustand';

interface PageContextState {
  currentPageText: string | null;
  currentPageUrl: string | null; // <<< THÊM MỚI
  isCurrentPageFeatureEnabled: boolean;
  isContextAttachedNextSend: boolean;
}

interface PageContextActions {
  setPageContext: (text: string | null, url: string | null, isEnabled: boolean) => void; // <<< CẬP NHẬT
  clearPageContext: () => void;
  toggleContextAttachedNextSend: (attach: boolean) => void;
  resetContextAttachedNextSend: () => void;
}

const initialState: PageContextState = {
  currentPageText: null,
  currentPageUrl: null, // <<< THÊM MỚI
  isCurrentPageFeatureEnabled: false,
  isContextAttachedNextSend: false,
};

export const usePageContextStore = create<PageContextState & PageContextActions>()(
  (set) => ({
    ...initialState,
    setPageContext: (text, url, isEnabled) => set({ 
      
      currentPageText: text, 
      currentPageUrl: url, // <<< LƯU URL
      isCurrentPageFeatureEnabled: isEnabled 
    }),
    clearPageContext: () => set({ 
      currentPageText: null, 
      currentPageUrl: null, // <<< XÓA URL
      isCurrentPageFeatureEnabled: false, 
      isContextAttachedNextSend: false 
    }),
    toggleContextAttachedNextSend: (attach) => set(state => {
      if (attach && state.isCurrentPageFeatureEnabled && state.currentPageText) {
        return { isContextAttachedNextSend: true };
      }
      return { isContextAttachedNextSend: false };
    }),
    resetContextAttachedNextSend: () => set({ isContextAttachedNextSend: false }),
  })
);