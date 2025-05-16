// src/hooks/chatbot/layout/useAppInitialization.ts
import { useEffect } from 'react';
import { usePathname } from '@/src/navigation';
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores'; // Chỉ cần useSettingsStore
import { useShallow } from 'zustand/react/shallow';

export function useAppInitialization() {
  // Không còn initializeAuth từ socketStore nữa
  // const { initializeAuth } = useSocketStore(
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

  // // useEffect cho initializeAuth bị loại bỏ
  // useEffect(() => {
  //   initializeAuth();
  // }, [initializeAuth]);

  // Set current UI locale from path
  useEffect(() => {
    const localeFromPath = currentPathname.split('/')[1] || 'en';
    setCurrentLocale(localeFromPath);
  }, [currentPathname, setCurrentLocale]);
}