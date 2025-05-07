// src/app/[locale]/chatbot/history/page.tsx
import ConversationHistoryPage from '@/src/app/[locale]/chatbot/history/ConversationHistoryPage'; // Sẽ tạo file này ở bước 2
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'Chatbot'}); // Giả sử namespace là Chatbot
  return {
    title: t('Chat_History_Full'),
  };
}

export default function ChatHistoryRoutePage() {
  // Component này sẽ là "children" của MainLayoutComponent khi route là /chatbot/history
  return <ConversationHistoryPage />;
}