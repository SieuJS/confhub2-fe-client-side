// src/app/[locale]/chatbot/stores/pageContextStore.ts
import { create } from 'zustand';

interface PageContextState {
  currentPageText: string | null;
  currentPageUrl: string | null;
  isCurrentPageFeatureEnabled: boolean;
  isContextAttachedNextSend: boolean;
}

interface PageContextActions {
  setPageContext: (text: string | null, url: string | null, isEnabled: boolean) => void;
  clearPageContext: () => void;
  // <<< THAY ĐỔI: Giữ nguyên các thay đổi của bạn, chúng rất hợp lý >>>
  toggleContextAttachedNextSend: () => void;
  resetContextAttachedNextSend: () => void;
}

const initialState: PageContextState = {
  currentPageText: null,
  currentPageUrl: null,
  isCurrentPageFeatureEnabled: false,
  isContextAttachedNextSend: false,
};

export const usePageContextStore = create<PageContextState & PageContextActions>()(
  (set) => ({
    ...initialState,
    setPageContext: (text, url, isEnabled) => set({ 
      currentPageText: text, 
      currentPageUrl: url,
      isCurrentPageFeatureEnabled: isEnabled 
    }),
    clearPageContext: () => set({ 
      currentPageText: null, 
      currentPageUrl: null,
      isCurrentPageFeatureEnabled: false, 
      isContextAttachedNextSend: false 
    }),
    // <<< THAY ĐỔI: Logic này đã được cập nhật đúng để tự động đảo ngược trạng thái >>>
    toggleContextAttachedNextSend: () => set(state => {
      // Chỉ cho phép bật nếu tính năng được kích hoạt và có nội dung trang
      if (state.isCurrentPageFeatureEnabled && state.currentPageText) {
        // Đảo ngược giá trị hiện tại
        return { isContextAttachedNextSend: !state.isContextAttachedNextSend };
      }
      // Nếu không đủ điều kiện, luôn đảm bảo nó là false
      return { isContextAttachedNextSend: false };
    }),
    resetContextAttachedNextSend: () => set({ isContextAttachedNextSend: false }),
  })
);