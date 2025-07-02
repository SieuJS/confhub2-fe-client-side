'use client';

import { useEffect } from 'react';
import { useWhatsNewStore } from './store/useWhatsNewStore';
import { CURRENT_VERSION } from './data/announcementData';
import { WhatsNewModal } from './WhatsNewModal';

export function WhatsNewController() {
  const { openModal } = useWhatsNewStore();

  useEffect(() => {
    // Chỉ chạy ở phía client
    const lastSeenVersion = localStorage.getItem('gcjh-whats-new-version');

    // Nếu người dùng chưa từng thấy modal, hoặc phiên bản họ thấy cũ hơn phiên bản hiện tại
    if (lastSeenVersion !== CURRENT_VERSION) {
      // Mở modal sau một khoảng trễ nhỏ để không quá đột ngột
      const timer = setTimeout(() => {
        openModal();
      }, 1500); // 1.5 giây

      return () => clearTimeout(timer); // Dọn dẹp timer
    }
  }, [openModal]);

  // Component này sẽ render modal, nhưng modal chỉ hiển thị khi state `isOpen` là true
  return <WhatsNewModal />;
}