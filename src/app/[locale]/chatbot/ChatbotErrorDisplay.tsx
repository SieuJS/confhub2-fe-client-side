// src/app/[locale]/chatbot/ChatbotErrorDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUiStore } from './stores/uiStore';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from '@/src/navigation';
import { XIcon } from 'lucide-react';
import { useMessageStore } from './stores'; // Đảm bảo import đúng

interface ChatbotErrorDisplayProps {
  isFloatingContext?: boolean; // Thêm prop này
}

function ChatbotErrorDisplay({ isFloatingContext = false }: ChatbotErrorDisplayProps) {
    const router = useRouter();
    const { clearAuthErrorMessages } = useMessageStore();

    const hasFatalError = useUiStore(state => state.hasFatalError);
    const fatalErrorCode = useUiStore(state => state.fatalErrorCode);
    const clearFatalErrorAction = useUiStore(state => state.clearFatalError);

    const { logout, user, isInitializing: isAuthInitializing } = useAuth();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", message: "" });
    const [userDismissedError, setUserDismissedError] = useState(false);

    // prevUserRef và prevHasFatalErrorRef không còn cần thiết cho logic hiện tại,
    // nhưng có thể giữ lại nếu bạn có kế hoạch sử dụng chúng cho việc khác.
    // const prevUserRef = useRef(user);
    // const prevHasFatalErrorRef = useRef(hasFatalError);

    const getIsAuthRelated = useCallback((code: string | null): boolean => {
        if (!code) return false;
        const authErrorCodes = [
            'AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED',
            'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED',
        ];
        return authErrorCodes.includes(code);
    }, []);

    useEffect(() => {
        if (user && hasFatalError && getIsAuthRelated(fatalErrorCode)) {
            console.log(`[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] User '${user.email}' is logged in and an auth error ('${fatalErrorCode}') is present. Clearing it.`);
            clearFatalErrorAction();
            clearAuthErrorMessages();
        }
    }, [user, hasFatalError, fatalErrorCode, clearFatalErrorAction, getIsAuthRelated, clearAuthErrorMessages, isFloatingContext]);

    useEffect(() => {
        const isCurrentErrorAuthRelated = getIsAuthRelated(fatalErrorCode);

        if (isAuthInitializing && isCurrentErrorAuthRelated) {
            console.log(`[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] Main Effect: Auth initializing and auth error present. Hiding modal.`);
            if (isModalVisible) setIsModalVisible(false);
            return;
        }

        if (hasFatalError && fatalErrorCode) {
            console.log(
                `[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] Main Effect: Detected fatal error. Code: ${fatalErrorCode}, User dismissed: ${userDismissedError}, Auth initializing: ${isAuthInitializing}, User: ${user ? user.email : 'null'}, IsModalVisible: ${isModalVisible}`
            );

            if (user && fatalErrorCode === 'AUTH_REQUIRED') {
                console.warn(`[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] Main Effect: User '${user.email}' is logged in, but fatalErrorCode is still 'AUTH_REQUIRED'. This may indicate an issue or a new error.`);
            }

            if (!userDismissedError) {
                let newTitle = "";
                let newMessage = "";

                if (isCurrentErrorAuthRelated) {
                    newTitle = "Yêu Cầu Xác Thực";
                    if (!user && fatalErrorCode === 'AUTH_REQUIRED') {
                        newMessage = "Bạn cần đăng nhập để sử dụng tính năng này. Vui lòng đăng nhập.";
                    } else {
                        newMessage = `Phiên đăng nhập của bạn không hợp lệ, đã hết hạn hoặc có sự cố kết nối xác thực. (Mã lỗi: ${fatalErrorCode}). Vui lòng đăng nhập lại.`;
                    }
                } else {
                    switch (fatalErrorCode) {
                        case 'CONNECTION_FAILED':
                            newTitle = "Lỗi Kết Nối";
                            newMessage = "Không thể kết nối đến máy chủ chatbot. Vui lòng kiểm tra lại đường truyền mạng và thử lại.";
                            break;
                        case 'FATAL_SERVER_ERROR':
                            newTitle = "Lỗi Máy Chủ Chatbot";
                            newMessage = "Đã có lỗi nghiêm trọng xảy ra phía máy chủ chatbot. Vui lòng thử lại sau.";
                            break;
                        default:
                            newTitle = "Lỗi Không Xác Định";
                            newMessage = `Đã có lỗi xảy ra trong quá trình hoạt động của chatbot (Mã: ${fatalErrorCode}). Vui lòng thử lại.`;
                    }
                }

                if (modalContent.title !== newTitle || modalContent.message !== newMessage) {
                    setModalContent({ title: newTitle, message: newMessage });
                }
                if (!isModalVisible) {
                    console.log(`[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] Main Effect: Setting modal visible.`);
                    setIsModalVisible(true);
                }
            } else {
                if (isModalVisible) {
                    console.log(`[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] Main Effect: User dismissed error, hiding modal.`);
                    setIsModalVisible(false);
                }
            }
        } else {
            if (isModalVisible) {
                console.log(`[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] Main Effect: No fatal error, hiding modal.`);
                setIsModalVisible(false);
            }
            if (userDismissedError) {
                console.log(`[ChatbotErrorDisplay ${isFloatingContext ? '(Floating)' : '(Global)'}] Main Effect: No fatal error, resetting userDismissedError.`);
                setUserDismissedError(false);
            }
        }
        // prevHasFatalErrorRef.current = hasFatalError; // Không còn cần thiết
    }, [
        hasFatalError, fatalErrorCode, user, isAuthInitializing, userDismissedError,
        isModalVisible, modalContent.title, modalContent.message, getIsAuthRelated,
        isFloatingContext // Thêm isFloatingContext vào dependencies để log chính xác
    ]);

    const handleLoginOrRetryAction = useCallback(async () => {
        const currentFatalErrorCode = fatalErrorCode;
        const isAuthError = getIsAuthRelated(currentFatalErrorCode);

        if (isAuthError) {
            if (!user && currentFatalErrorCode === 'AUTH_REQUIRED') {
                router.push('/auth/login' as any);
            } else {
                try {
                    await logout({ callApi: true });
                    if (hasFatalError && fatalErrorCode === currentFatalErrorCode) {
                        clearFatalErrorAction();
                    }
                } catch (error) {
                    console.error("Error during logout from ChatbotErrorDisplay:", error);
                    router.push('/auth/login' as any);
                    if (hasFatalError && fatalErrorCode === currentFatalErrorCode) {
                        clearFatalErrorAction();
                    }
                }
            }
        } else {
            clearFatalErrorAction();
        }
    }, [router, logout, clearFatalErrorAction, user, fatalErrorCode, getIsAuthRelated, hasFatalError]);

    const handleDismissModal = useCallback(() => {
        setIsModalVisible(false);
        setUserDismissedError(true);
    }, []);

    const isCurrentErrorAuthRelatedForRender = getIsAuthRelated(fatalErrorCode);
    if (!isModalVisible || (isAuthInitializing && isCurrentErrorAuthRelatedForRender)) {
        return null;
    }

    const containerClasses = isFloatingContext
        ? "absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-2" // z-index cao hơn nội dung chat (ví dụ: header của floating chat có z-10, content có z-0, settings có z-20)
        : "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4";

    const modalDialogClasses = isFloatingContext
        ? "bg-white p-4 sm:p-5 rounded-lg shadow-xl max-w-[calc(100%-2rem)] w-full sm:max-w-xs relative" // Giảm padding, max-w
        : "bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full relative";

    return (
        <div className={containerClasses} aria-live="assertive">
            <div className={modalDialogClasses} role="alertdialog" aria-labelledby={`chatbotErrorDialogTitle-${isFloatingContext ? 'float' : 'main'}`} aria-describedby={`chatbotErrorDialogDesc-${isFloatingContext ? 'float' : 'main'}`}>
                <button
                    onClick={handleDismissModal}
                    className={`absolute text-gray-400 hover:text-gray-600 focus:outline-none ${isFloatingContext ? 'top-2 right-2' : 'top-3 right-3'}`}
                    aria-label="Đóng thông báo"
                >
                    <XIcon size={isFloatingContext ? 20 : 24} />
                </button>

                <h3 id={`chatbotErrorDialogTitle-${isFloatingContext ? 'float' : 'main'}`} className={`font-semibold ${isFloatingContext ? 'text-lg mb-2' : 'text-xl sm:text-2xl mb-3'} ${isCurrentErrorAuthRelatedForRender ? 'text-red-600' : 'text-yellow-600'}`}>
                    {modalContent.title}
                </h3>
                <p id={`chatbotErrorDialogDesc-${isFloatingContext ? 'float' : 'main'}`} className={`text-gray-700 ${isFloatingContext ? 'text-sm mb-4' : 'text-sm sm:text-base mb-6'}`}>
                    {modalContent.message}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={handleLoginOrRetryAction}
                        className={`flex-1 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ${isFloatingContext ? 'py-2 px-3 text-sm' : 'py-2.5 px-4'} ${isCurrentErrorAuthRelatedForRender ? 'bg-red-500 hover:bg-red-700 focus:ring-red-500' : 'bg-blue-500 hover:bg-blue-700 focus:ring-blue-500'}`}
                    >
                        {isCurrentErrorAuthRelatedForRender
                            ? ((!user && fatalErrorCode === 'AUTH_REQUIRED') ? "Đăng nhập" : "Đăng nhập lại")
                            : "Đã hiểu / Thử lại"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatbotErrorDisplay;