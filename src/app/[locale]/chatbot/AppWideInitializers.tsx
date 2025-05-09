// src/app/[locale]/chatbot/AppWideInitializers.tsx
'use client';

// Không cần useEffect nếu không có logic khởi tạo cụ thể nào ở đây nữa
import { useChatSocketManager } from '@/src/hooks/chatbot/useChatSocketManager';

export function AppWideInitializers() {
  // Hook này sẽ tự quản lý vòng đời của socket dựa trên authToken trong socketStore.
  // authToken sẽ được socketStore.initializeAuth() (gọi từ nơi khác) load.
  useChatSocketManager();

  // console.log("AppWideInitializers: Mounted. Socket manager active."); // Có thể thêm log nếu muốn

  return null;
}