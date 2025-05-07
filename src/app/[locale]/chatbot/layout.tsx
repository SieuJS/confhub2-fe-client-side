// src/app/[locale]/chatbot/layout.tsx
"use client";

import { LiveAPIProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext'; // Điều chỉnh path
import { ChatSocketProvider } from './context/ChatSocketContext'; // Điều chỉnh path
import MainLayoutComponent from '@/src/app/[locale]/chatbot/MainLayout';
import { ChatSettingsProvider } from '@/src/app/[locale]/chatbot/context/ChatSettingsContext'; // <-- IMPORT PROVIDER
import { API_URI } from '@/src/app/[locale]/chatbot/lib/constants'; // Điều chỉnh path
import { appConfig } from '@/src/middleware';
import { usePathname } from '@/src/navigation';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const SOCKET_SERVER_URL = appConfig.NEXT_PUBLIC_BACKEND_URL;


export default function ChatbotRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const unlocalizedPathname = usePathname(); // Ví dụ: /chatbot, /chatbot/regularchat

    if (typeof API_KEY !== "string" || !API_KEY) {
        console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set or invalid.");
        return (
            <div className="flex h-screen items-center justify-center text-lg font-semibold text-red-600">
                Configuration Error: Live Chat API Key is missing. Please contact support.
            </div>
        );
    }

    // Các provider này có thể cần cho cả trang landing nếu nút trên AIBanner
    // cần chúng. Nếu không, chúng có thể được chuyển vào khối `else`.
    return (
        <LiveAPIProvider url={API_URI} apiKey={API_KEY}>
            <ChatSocketProvider socketUrl={SOCKET_SERVER_URL}>
                {unlocalizedPathname === '/chatbot/landingchatbot' ? (
                    // Đây là trang landing (/chatbot/landingchatbot), không cần MainLayoutComponent và ChatSettingsProvider
                    <>{children}</>
                ) : (
                    // Đây là các trang giao diện chat (/chatbot/regularchat, /chatbot/livechat, ...)
                    <ChatSettingsProvider>
                        <MainLayoutComponent>
                            {children}
                        </MainLayoutComponent>
                    </ChatSettingsProvider>
                )}
            </ChatSocketProvider>
        </LiveAPIProvider>
    );
}