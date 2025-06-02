// src/app/[locale]/chatbot/layout.tsx
"use client";

import { LiveAPIProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import MainLayoutComponent from '@/src/app/[locale]/chatbot/MainLayout';
import { LiveChatSettingsProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveChatSettingsContext';
// import { API_URI } from '@/src/app/[locale]/chatbot/lib/constants'; // Loại bỏ API_URI vì không còn dùng
import { usePathname } from '@/src/navigation';
import { useSettingsStore } from './stores/setttingsStore'; // Đảm bảo đường dẫn đúng
import { useEffect } from 'react';
import ChatbotErrorDisplay from './ChatbotErrorDisplay'; // Đảm bảo đường dẫn đúng

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function ChatbotRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const unlocalizedPathname = usePathname();
    const setChatMode = useSettingsStore(state => state.setChatMode);
    const currentStoreChatMode = useSettingsStore(state => state.chatMode);

    const isLiveChatPage = unlocalizedPathname.includes('/chatbot/livechat');
    const isLandingChatbotPage = unlocalizedPathname === '/chatbot/landingchatbot';

    useEffect(() => {
        const newMode = isLiveChatPage ? 'live' : 'regular';
        if (currentStoreChatMode !== newMode) {
            setChatMode(newMode);
        }
    }, [isLiveChatPage, currentStoreChatMode, setChatMode, unlocalizedPathname]);


    if (typeof API_KEY !== "string" || !API_KEY) {
        console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set or invalid.");
        return (
            <div className="flex h-screen items-center justify-center text-lg font-semibold text-red-600">
                Configuration Error: Live Chat API Key is missing. Please contact support.
            </div>
        );
    }

    const shouldShowChatbotErrorDisplay = !isLandingChatbotPage;

    return (
        <>
            {shouldShowChatbotErrorDisplay && <ChatbotErrorDisplay />}

            {isLiveChatPage ? (
                // Loại bỏ prop 'url' không còn cần thiết
                <LiveAPIProvider apiKey={API_KEY}>
                    <LiveChatSettingsProvider>
                        <MainLayoutComponent isLiveChatContextActive={true}>
                            {children}

                        </MainLayoutComponent>
                    </LiveChatSettingsProvider>
                </LiveAPIProvider>
            ) : isLandingChatbotPage ? (
                <>{children}</>
            ) : (
                <MainLayoutComponent isLiveChatContextActive={false}>
                    {children}
                </MainLayoutComponent>
            )}
            <div id="tooltip-portal-root"></div> {/* <<< ĐẶT PORTAL ROOT Ở ĐÂY */}

        </>
    );
}