'use client';

import { useWhatsNewStore } from './store/useWhatsNewStore';
import { Gift } from 'lucide-react';

export const WhatsNewButton = () => {
  const { openModal } = useWhatsNewStore();

  return (
    <button
      onClick={openModal}
      // aria-label rất quan trọng cho khả năng truy cập (accessibility)
      // Nó giúp trình đọc màn hình hiểu được chức năng của nút bấm này.
      aria-label="Xem có gì mới"
      className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background-secondary hover:text-primary"
    >
      <Gift className="h-5 w-5" />
    </button>
  );
};