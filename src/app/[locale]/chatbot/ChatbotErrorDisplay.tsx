
// src/app/[locale]/chatbot/ChatbotErrorDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUiStore } from './stores/uiStore';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from '@/src/navigation';
import { XIcon } from 'lucide-react'; // Icon cho nút đóng

function ChatbotErrorDisplay() {
    const router = useRouter();
    const hasFatalError = useUiStore(state => state.hasFatalError);
    const fatalErrorCode = useUiStore(state => state.fatalErrorCode);
    const clearFatalErrorAction = useUiStore(state => state.clearFatalError); // Vẫn dùng để xóa lỗi hoàn toàn khi logout/login

    const { logout, user, isInitializing: isAuthInitializing } = useAuth();

    const [isModalVisible, setIsModalVisible] = useState(false); // Thay thế showModal
    const [modalContent, setModalContent] = useState({ title: "", message: "" });
    const [isAuthRelatedErrorState, setIsAuthRelatedErrorState] = useState(false);
    const [userDismissedError, setUserDismissedError] = useState(false); // <<<< STATE MỚI >>>>

    useEffect(() => {
        if (isAuthInitializing && fatalErrorCode && ['AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED', 'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED'].includes(fatalErrorCode)) {
            if (isModalVisible) setIsModalVisible(false);
            return;
        }

        if (hasFatalError && fatalErrorCode && !userDismissedError) { // <<<< THÊM ĐIỀU KIỆN !userDismissedError >>>>
            // ... (logic xác định title, message, isAuthRelatedErrorState như cũ) ...
            const authErrorCodes = [
                'AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED',
                'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED',
            ];
            const currentIsAuthError = authErrorCodes.includes(fatalErrorCode);
            setIsAuthRelatedErrorState(currentIsAuthError);

            let newTitle = "";
            let newMessage = "";

            if (currentIsAuthError) {
                newTitle = "Yêu Cầu Xác Thực";
                if (!user && fatalErrorCode === 'AUTH_REQUIRED') {
                    newMessage = "Bạn cần đăng nhập để sử dụng tính năng này. Vui lòng đăng nhập.";
                } else {
                    newMessage = "Phiên đăng nhập của bạn không hợp lệ, đã hết hạn hoặc có sự cố kết nối xác thực. Vui lòng đăng nhập lại.";
                }
            } else {
                // ... (switch case cho các lỗi khác như cũ) ...
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

            if (!isModalVisible || modalContent.title !== newTitle || modalContent.message !== newMessage) {
                setModalContent({ title: newTitle, message: newMessage });
            }
            if (!isModalVisible) {
                setIsModalVisible(true);
            }

        } else if (!hasFatalError || userDismissedError) { // Nếu không có lỗi hoặc user đã dismiss
            if (isModalVisible) {
               setIsModalVisible(false);
            }
            // Không reset isAuthRelatedErrorState ở đây nếu chỉ dismiss, vì nó có thể cần cho nút bấm
        }
        // Nếu hasFatalError là false, reset userDismissedError để modal có thể hiện lại nếu lỗi mới xuất hiện
        if (!hasFatalError && userDismissedError) {
            setUserDismissedError(false);
        }

    }, [hasFatalError, fatalErrorCode, user, isAuthInitializing, isModalVisible, modalContent.title, modalContent.message, userDismissedError]);


    const handleLoginOrRetryAction = useCallback(async () => { // Đổi tên hàm
        // Không cần setIsModalVisible(false) ở đây nữa, vì lỗi sẽ được clear hoặc redirect
        setUserDismissedError(false); // Reset trạng thái dismiss
        if (!user && fatalErrorCode === 'AUTH_REQUIRED') {
            router.push('/auth/login' as any);
        } else { // Các lỗi auth khác hoặc lỗi server
            try {
                // Với lỗi auth, logout sẽ clear token và có thể redirect
                // Với lỗi server/connection, việc logout có thể không cần thiết,
                // nhưng nếu server yêu cầu auth lại sau lỗi, thì đây là cách reset.
                // Cân nhắc: có thể không cần logout nếu chỉ là FATAL_SERVER_ERROR.
                // Tuy nhiên, để đơn giản, logout và yêu cầu đăng nhập lại là một giải pháp an toàn.
                await logout({ callApi: true });
                 // Sau khi logout, AuthContext sẽ điều hướng, hoặc nếu không thì lỗi sẽ được clear
                // và user có thể thử lại (nếu lỗi không phải do auth)
            } catch (error) {
                console.error("Error during logout/retry from ChatbotErrorDisplay:", error);
                router.push('/auth/login' as any); // Fallback
            }
        }
        // Chỉ clear fatal error nếu đó là lỗi server mà không phải lỗi auth,
        // vì lỗi auth sẽ được "clear" bằng cách logout/login.
        if (fatalErrorCode === 'FATAL_SERVER_ERROR' || fatalErrorCode === 'CONNECTION_FAILED') {
            clearFatalErrorAction();
        } else if (isAuthRelatedErrorState) {
             // Đối với lỗi auth, việc logout/redirect đã là hành động chính.
             // clearFatalErrorAction() sẽ được gọi nếu AuthContext không tự xóa
             // hoặc nếu sau khi logout, lỗi vẫn còn (ít khả năng).
             // Thường thì sau logout, token mất, useChatSocketManager sẽ lại thử kết nối và có thể lại lỗi.
             // Để tránh vòng lặp, AuthContext nên xử lý tốt việc redirect.
             // Nếu người dùng đã chủ động nhấn nút "Đăng nhập/Đăng nhập lại", chúng ta có thể clear lỗi trong UI Store.
            clearFatalErrorAction();
        }

    }, [router, logout, clearFatalErrorAction, user, fatalErrorCode, isAuthRelatedErrorState]);

    const handleDismissModal = useCallback(() => {
        setIsModalVisible(false);
        setUserDismissedError(true); // Đánh dấu user đã đóng modal
        // KHÔNG gọi clearFatalErrorAction() ở đây
    }, []);

    // Nếu modal không hiển thị (do không có lỗi, hoặc user đã dismiss, hoặc auth đang init), return null
    if (!isModalVisible || (isAuthInitializing && isAuthRelatedErrorState) ) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4" aria-live="assertive">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full relative" role="alertdialog" aria-labelledby="chatbotErrorDialogTitle" aria-describedby="chatbotErrorDialogDesc">
                {/* Nút đóng modal */}
                <button
                    onClick={handleDismissModal}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Đóng thông báo"
                >
                    <XIcon size={24} />
                </button>

                <h3 id="chatbotErrorDialogTitle" className={`text-xl sm:text-2xl font-semibold mb-3 ${isAuthRelatedErrorState ? 'text-red-600' : 'text-yellow-600'}`}>
                    {modalContent.title}
                </h3>
                <p id="chatbotErrorDialogDesc" className="text-sm sm:text-base text-gray-700 mb-6">
                    {modalContent.message}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                    {isAuthRelatedErrorState ? (
                        <button
                            onClick={handleLoginOrRetryAction}
                            className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-150"
                        >
                            {(!user && fatalErrorCode === 'AUTH_REQUIRED') ? "Đăng nhập" : "Đăng nhập lại"}
                        </button>
                    ) : ( // Lỗi không phải auth (vd: server error, connection error)
                        <button
                            onClick={() => {
                                // Với lỗi không phải auth, "Thử lại" có thể là reload trang hoặc một hành động cụ thể
                                // Ở đây, chúng ta chỉ đơn giản là clear lỗi để user có thể tiếp tục (nếu lỗi là tạm thời)
                                // Hoặc nếu bạn muốn, có thể reload trang: window.location.reload();
                                setUserDismissedError(false); // Cho phép modal hiện lại nếu lỗi vẫn còn
                                clearFatalErrorAction(); // Xóa lỗi khỏi store
                                setIsModalVisible(false); // Ẩn modal
                            }}
                            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150"
                        >
                            Đã hiểu / Thử lại
                        </button>
                    )}
                     {/* Nút "Đóng" thứ 2 nếu bạn muốn nó ở dưới, hoặc chỉ dùng nút X ở trên */}
                    {/* <button
                        onClick={handleDismissModal}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-150"
                    >
                        Đóng
                    </button> */}
                </div>
            </div>
        </div>
    );
}

export default ChatbotErrorDisplay;