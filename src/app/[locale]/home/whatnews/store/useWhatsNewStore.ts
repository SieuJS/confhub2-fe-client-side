import { create } from 'zustand';

interface WhatsNewState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useWhatsNewStore = create<WhatsNewState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));