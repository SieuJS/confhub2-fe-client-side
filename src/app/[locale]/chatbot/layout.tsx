// src/app/[locale]/chatbot/layout.tsx
"use client";

import { LiveAPIProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import MainLayoutComponent from '@/src/app/[locale]/chatbot/MainLayout';
import { LiveChatSettingsProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveChatSettingsContext';
import { API_URI } from '@/src/app/[locale]/chatbot/lib/constants';
import { usePathname } from '@/src/navigation';
import { useSettingsStore } from './stores/setttingsStore';
import { useEffect } from 'react';
import ChatbotErrorDisplay from './ChatbotErrorDisplay';

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
    const isLandingChatbotPage = unlocalizedPathname === '/chatbot/landingchatbot'; // Thêm biến này cho rõ ràng

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

    // Chỉ hiển thị ChatbotErrorDisplay nếu không phải là trang landing
    // Và chỉ khi các trang chatbot khác đang hoạt động (ví dụ, không phải lỗi config API_KEY)
    const shouldShowChatbotErrorDisplay = !isLandingChatbotPage;

    return (
        <>
            {/* Chỉ render ChatbotErrorDisplay nếu cần */}
            {shouldShowChatbotErrorDisplay && <ChatbotErrorDisplay />}

            {isLiveChatPage ? (
                <LiveAPIProvider url={API_URI} apiKey={API_KEY}>
                    <LiveChatSettingsProvider>
                        <MainLayoutComponent isLiveChatContextActive={true}>
                            {children}
                        </MainLayoutComponent>
                    </LiveChatSettingsProvider>
                </LiveAPIProvider>
            ) : isLandingChatbotPage ? ( // Sử dụng biến đã tạo
                // Trang landing, không có ChatbotErrorDisplay bao bọc trực tiếp ở đây nữa
                // (nó sẽ được bao bọc bởi điều kiện shouldShowChatbotErrorDisplay ở trên nếu logic thay đổi)
                // Với logic hiện tại, nó sẽ không có ChatbotErrorDisplay
                <>{children}</>
            ) : (
                // Các trang chatbot regular khác
                <MainLayoutComponent isLiveChatContextActive={false}>
                    {children}
                </MainLayoutComponent>
            )}
        </>
    );
}