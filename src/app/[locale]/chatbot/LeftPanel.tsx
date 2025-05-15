// src/app/[locale]/chatbot/LeftPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import ConversationList from './regularchat/ConversationList';
import { useUiStore, useConversationStore, useSettingsStore } from './stores';
import { useShallow } from 'zustand/react/shallow';
import { useLeftPanelNavigation } from '@/src/hooks/chatbot/useLeftPanelNavigation';
import NavigationMenu from './NavigationMenu';
import PanelToggleButton from './PanelToggleButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { LogIn, LogOut } from 'lucide-react'; // Thêm LogOut icon
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import { UserIcon } from '../utils/header/Icon';

interface LeftPanelProps {
  onSelectConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  currentView: 'chat' | 'history';
  isLiveServiceConnected?: boolean;
  deletingConversationId: string | null;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  onSelectConversation,
  onStartNewConversation,
  onDeleteConversation,
  currentView,
  isLiveServiceConnected,
  deletingConversationId
}) => {
  const { user, isLoggedIn, logout, isInitializing: isAuthInitializing } = useAuth();
  const t = useTranslations('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    isLeftPanelOpen,
    toggleLeftPanel,
    hasFatalError: uiHasFatalError,
    fatalErrorCode: uiFatalErrorCode,
  } = useUiStore(
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      toggleLeftPanel: state.toggleLeftPanel,
      hasFatalError: state.hasFatalError,
      fatalErrorCode: state.fatalErrorCode,
    }))
  );

  // Bỏ state isUserDropdownOpen và logic liên quan
  // const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Bỏ refs không cần thiết
  // const dropdownRef = useRef<HTMLDivElement>(null);
  // const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null); // Ref cho nút logout

  const {
    conversationList,
    activeConversationId,
    isLoadingHistory,
    clearConversation,
    renameConversation,
    pinConversation
  } = useConversationStore(
    useShallow(state => ({
      conversationList: state.conversationList,
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      clearConversation: state.clearConversation,
      renameConversation: state.renameConversation,
      pinConversation: state.pinConversation
    }))
  );

  const { chatMode } = useSettingsStore(useShallow(state => ({ chatMode: state.chatMode })));
  const { navItems } = useLeftPanelNavigation({ currentView, isLiveServiceConnected });
  const showConversationList = isLeftPanelOpen && currentView === 'chat' && chatMode !== 'live';

  useEffect(() => { setIsClient(true); }, []);

  // Bỏ useEffect xử lý click outside cho dropdown
  // useEffect(() => {
  //   if (!isClient) return;
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (isLoggedIn && isUserDropdownOpen) {
  //       if (
  //         dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
  //         avatarButtonRef.current && !avatarButtonRef.current.contains(event.target as Node)
  //       ) {
  //         setIsUserDropdownOpen(false);
  //       }
  //     }
  //   };
  //   if (isUserDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
  //   else document.removeEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, [isUserDropdownOpen, isClient, isLoggedIn]);

  // Bỏ useEffect đóng dropdown khi panel đóng
  // useEffect(() => {
  //   if (!isLeftPanelOpen && isUserDropdownOpen) setIsUserDropdownOpen(false);
  // }, [isLeftPanelOpen, isUserDropdownOpen]);

  const isCurrentFatalErrorAuthRelated = uiHasFatalError && uiFatalErrorCode &&
    ['AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED', 'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED']
      .includes(uiFatalErrorCode);

  // Bỏ handleAvatarClick vì không còn dropdown từ avatar
  // const handleAvatarClick = () => {
  //   if (uiHasFatalError && !isCurrentFatalErrorAuthRelated && isLoggedIn) return;
  //   setIsUserDropdownOpen(prev => !prev);
  // };

  const handleLogout = async () => {
    // setIsUserDropdownOpen(false); // Bỏ dòng này
    try {
      await logout({ callApi: true });
      // AuthContext sẽ tự động xử lý việc redirect hoặc cập nhật state
      // Không cần router.push ở đây trừ khi bạn muốn một hành vi redirect cụ thể sau logout từ left panel
    } catch (error) {
      console.error("[LeftPanel] Error during logout:", error);
      // Xử lý lỗi nếu cần, ví dụ hiển thị thông báo
    }
  };

  const handleLoginClick = async () => {
    const currentSearchParamsString = searchParams.toString();
    const fullUnlocalizedUrl = `${pathname}${currentSearchParamsString ? `?${currentSearchParamsString}` : ''}`;
    try {
      localStorage.setItem('returnUrl', fullUnlocalizedUrl);
    } catch (e) {
      console.error('[LeftPanel] Failed to set returnUrl in localStorage', e);
    }

    // Logic thử nghiệm: Logout trước khi điều hướng đến login
    // Mục đích là để cố gắng dọn dẹp session cũ trên server trước khi thử login mới.
    // Chỉ thực hiện nếu đang ở trang chatbot và có dấu hiệu cần logout
    if (pathname.includes('/chatbot')) {
      // Dấu hiệu cần logout: vẫn còn `isLoggedIn` true (ví dụ token hết hạn nhưng client chưa biết)
      // hoặc có lỗi xác thực đang hiển thị (trường hợp này user thường đã bị coi là logout ở client)
      const shouldAttemptLogout = isLoggedIn || (uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode !== 'AUTH_REQUIRED');

      if (shouldAttemptLogout) {
        console.log('[LeftPanel] Attempting pre-login logout. isLoggedIn:', isLoggedIn, 'uiHasFatalError:', uiHasFatalError, 'isCurrentFatalErrorAuthRelated:', isCurrentFatalErrorAuthRelated, 'uiFatalErrorCode:', uiFatalErrorCode);
        try {
          await logout({ callApi: true, preventRedirect: true });
          console.log('[LeftPanel] Pre-login logout successful.');
        } catch (e) {
          console.error('[LeftPanel] Error during pre-login logout:', e);
        }
      }
    }
    router.push('/auth/login' as any);
  };

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  if (isAuthInitializing && !isClient) { // Chỉ hiển thị spinner nếu chưa client-side hydrated và auth đang init
    return (
      <div
        className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out ${isLeftPanelOpen ? 'w-72' : 'w-16'} flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Điều kiện disable chung cho các chức năng chính của chatbot (ngoại trừ toggle panel và auth)
  const isChatFunctionalityDisabled = uiHasFatalError && !isCurrentFatalErrorAuthRelated;
  // Điều kiện disable cho nút login: khi có lỗi auth nhưng KHÔNG PHẢI là AUTH_REQUIRED
  // (ví dụ TOKEN_EXPIRED thì user nên được phép bấm login để lấy token mới)
  const isLoginButtonDisabled = !!(uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode !== 'AUTH_REQUIRED');
  // Điều kiện disable cho nút logout: khi có lỗi auth nhưng KHÔNG PHẢI là các lỗi cần login lại (ví dụ ACCESS_DENIED khi đã login)
  const isLogoutButtonDisabled = !!(uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode === 'AUTH_REQUIRED');


  return (
    <div
      className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out ${isLeftPanelOpen ? 'w-72' : 'w-16'}`}
      aria-hidden={!isLeftPanelOpen || undefined}
    >
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className={`flex flex-shrink-0 flex-col ${isLeftPanelOpen ? 'p-3' : 'space-y-1 p-2'}`}>
          <PanelToggleButton
            isPanelOpen={isLeftPanelOpen}
            onTogglePanel={toggleLeftPanel}
            disabled={(uiHasFatalError && !isCurrentFatalErrorAuthRelated) && !isLeftPanelOpen}
          />
          <NavigationMenu
            navItems={navItems}
            isLeftPanelOpen={isLeftPanelOpen}
            disabled={isChatFunctionalityDisabled}
          />
        </div>

        {isLeftPanelOpen && <div className='mx-3 my-2 border-t border-gray-200'></div>}

        {showConversationList && (
          <ConversationList
            conversationList={conversationList}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onStartNewConversation={onStartNewConversation}
            isLoading={isLoadingHistory}
            onDeleteConversation={onDeleteConversation}
            onClearConversation={clearConversation}
            onRenameConversation={renameConversation}
            onPinConversation={pinConversation}
            currentView={currentView}
            deletingConversationId={deletingConversationId}
            disabled={isChatFunctionalityDisabled}
          />
        )}

        {isClient && (
          // Điều chỉnh lại layout cho footer
          <div className={`mt-auto flex items-center border-t border-gray-200 dark:border-gray-700 ${isLeftPanelOpen ? 'p-3 justify-between' : 'p-2 justify-center'}`}>
            {isAuthInitializing ? (
              <div className={`flex items-center ${isLeftPanelOpen ? 'w-full' : ''}`}>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-300"></div>
                {isLeftPanelOpen && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{t('Initializing')}</span>}
              </div>
            ) : isLoggedIn && user ? (
              // Khi đã đăng nhập
              <>
                {isLeftPanelOpen ? (
                  // Hiển thị khi panel mở
                  <div className="flex items-center w-full justify-between"> {/* Dùng flexbox để căn chỉnh */}
                    <div className="flex items-center"> {/* Avatar và Tên */}
                      {/* Icon User */}
                      <button
                        // ref={avatarButtonRef} // Không cần ref nữa
                        // onClick={handleAvatarClick} // Không cần handler nữa
                        disabled={uiHasFatalError && !isCurrentFatalErrorAuthRelated} // Disable nếu có lỗi nghiêm trọng không phải auth
                        className={`rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isLeftPanelOpen ? '' : 'p-1 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        aria-label={t('User profile')} // Điều chỉnh aria-label
                        title={`${firstName} ${lastName}`.trim() || t('User profile')} // Điều chỉnh title
                      >
                        <UserIcon />
                      </button>
                      {/* **Phần hiển thị tên cần điều chỉnh** */}
                      <span className='ml-2 max-w-[calc(100%-2rem)] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200'>
                        {`${firstName} ${lastName}`.trim() || user.email}
                      </span>
                    </div>
                    {/* Nút Logout - Chỉ hiển thị khi panel mở và đã đăng nhập */}
                    <button
                      ref={logoutButtonRef}
                      onClick={handleLogout}
                      disabled={isLogoutButtonDisabled || (uiHasFatalError && !isCurrentFatalErrorAuthRelated)} // Disable nếu có lỗi auth cần login lại hoặc lỗi nghiêm trọng khác
                      className={`rounded-md p-1 text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 dark:text-red-400 dark:hover:bg-gray-700
                                     ${isLogoutButtonDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                      aria-label={t('Logout')}
                      title={t('Logout')}
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  // Hiển thị khi panel đóng (chỉ icon user)
                  <button
                    // ref={avatarButtonRef} // Không cần ref nữa
                    // onClick={handleAvatarClick} // Không cần handler nữa
                    disabled={uiHasFatalError && !isCurrentFatalErrorAuthRelated} // Disable nếu có lỗi nghiêm trọng không phải auth
                    className={`rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:hover:bg-gray-700`}
                    aria-label={t('User profile')} // Điều chỉnh aria-label
                    title={`${firstName} ${lastName}`.trim() || t('User profile')} // Điều chỉnh title
                  >
                    <UserIcon />
                  </button>
                )}
              </>
            ) : (
              // Khi chưa đăng nhập (chỉ nút Login)
              <button
                ref={loginButtonRef}
                onClick={handleLoginClick}
                disabled={isLoginButtonDisabled}
                className={`group relative inline-flex items-center rounded-md px-3 pb-1.5 pt-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${isLoginButtonDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }
                            ${isLeftPanelOpen ? 'w-full justify-center' : ''}
                          `}
                aria-label={t('Login')}
              >
                <LogIn size={18} className={`${isLeftPanelOpen ? 'mr-2' : ''}`} />
                {isLeftPanelOpen && t('Login')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;