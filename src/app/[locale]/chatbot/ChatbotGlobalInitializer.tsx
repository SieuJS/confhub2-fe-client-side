// src/app/[locale]/chatbot/ChatbotGlobalInitializer.tsx
'use client'; // Quan trọng: Đánh dấu đây là Client Component

import { AppWideInitializers } from './AppWideInitializers'; // Import component có 'use client'

export default function ChatbotGlobalInitializer() {
  return <AppWideInitializers />;
}