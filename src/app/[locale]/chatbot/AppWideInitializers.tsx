// src/app/[locale]/chatbot/AppWideInitializers.tsx
'use client';
import { useChatSocketManager } from '@/src/hooks/regularchat/useChatSocketManager';

export function AppWideInitializers() {
  useChatSocketManager();
  return null;
}