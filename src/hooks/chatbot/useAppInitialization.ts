// src/hooks/chatbot/layout/useAppInitialization.ts
import { useEffect } from 'react';
import { usePathname } from '@/src/navigation';
// import { useSocketStore } from '@/src/app/[locale]/chatbot/stores'; // Không cần socketStore ở đây nữa
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';

export function useAppInitialization() {
  // const { initializeAuth } = useSocketStore( // <<<< LOẠI BỎ PHẦN NÀY
  //   useShallow(state => ({
  //     initializeAuth: state.initializeAuth,
  //   }))
  // );
  const { setCurrentLocale } = useSettingsStore(
    useShallow(state => ({
      setCurrentLocale: state.setCurrentLocale,
    }))
  );
  const currentPathname = usePathname();

  // Initialize auth token - KHÔNG CẦN NỮA, useChatSocketManager sẽ làm
  // useEffect(() => {
  //   initializeAuth();
  // }, [initializeAuth]);

  // Set current UI locale from path
  useEffect(() => {
    // Lấy locale từ path, ví dụ: /en/chatbot -> en
    const segments = currentPathname.split('/');
    const localeFromPath = segments.length > 1 ? segments[1] : 'en'; // Mặc định 'en'
    setCurrentLocale(localeFromPath);
    console.log(`[AppInitialization] Locale set to: ${localeFromPath} from path: ${currentPathname}`);
  }, [currentPathname, setCurrentLocale]);
}