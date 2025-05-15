// src/app/[locale]/chatbot/LeftPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import ConversationList from './regularchat/ConversationList';
import { useUiStore, useConversationStore, useSettingsStore } from './stores';
import { useShallow } from 'zustand/react/shallow';
import { useLeftPanelNavigation } from '@/src/hooks/chatbot/useLeftPanelNavigation';
import NavigationMenu from './NavigationMenu';
import PanelToggleButton from './PanelToggleButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserIcon, LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/src/navigation'; // Đảm bảo import đúng
import { useSearchParams } from 'next/navigation'; // Import riêng nếu dùng cho searchParams

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
  const searchParams = useSearchParams(); // Sử dụng từ next/navigation cho search params

  const {
    isLeftPanelOpen,
    toggleLeftPanel,
    hasFatalError: uiHasFatalError,
    fatalErrorCode: uiFatalErrorCode, // <<<< LẤY THÊM fatalErrorCode TỪ UiStore >>>>
    // clearFatalError // Không cần clearFatalError ở đây, AuthContext hoặc ChatbotErrorDisplay sẽ xử lý
  } = useUiStore(
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      toggleLeftPanel: state.toggleLeftPanel,
      hasFatalError: state.hasFatalError,
      fatalErrorCode: state.fatalErrorCode, // <<<< THÊM VÀO SELECTOR >>>>
      // clearFatalError: state.clearFatalError,
    }))
  );
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);


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

  useEffect(() => {
    if (!isClient) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (isLoggedIn && isUserDropdownOpen) {
        if (
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          avatarButtonRef.current && !avatarButtonRef.current.contains(event.target as Node)
        ) {
          setIsUserDropdownOpen(false);
        }
      }
    };
    if (isUserDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen, isClient, isLoggedIn]);

  useEffect(() => {
    if (!isLeftPanelOpen && isUserDropdownOpen) setIsUserDropdownOpen(false);
  }, [isLeftPanelOpen, isUserDropdownOpen]);


  // Xác định xem lỗi hiện tại có phải là lỗi xác thực hay không DỰA TRÊN UiStore
  const isCurrentFatalErrorAuthRelated = uiHasFatalError && uiFatalErrorCode &&
    ['AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED', 'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED']
      .includes(uiFatalErrorCode);

  const handleAvatarClick = () => {
    // Chỉ không cho mở dropdown nếu:
    // 1. Có lỗi nghiêm trọng (uiHasFatalError)
    // 2. Lỗi đó KHÔNG PHẢI là lỗi xác thực (vì nếu là lỗi auth, dropdown có nút Logout là hợp lý)
    // 3. Người dùng ĐÃ đăng nhập (nếu chưa đăng nhập thì nút avatar không hiển thị)
    if (uiHasFatalError && !isCurrentFatalErrorAuthRelated && isLoggedIn) return;
    setIsUserDropdownOpen(prev => !prev);
  };

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    await logout({ callApi: true });
  };

  const handleLoginClick = () => {
    const currentSearchParamsString = searchParams.toString();
    const fullUnlocalizedUrl = `${pathname}${currentSearchParamsString ? `?${currentSearchParamsString}` : ''}`;
    try {
      localStorage.setItem('returnUrl', fullUnlocalizedUrl);
    } catch (e) {
      console.error('[LeftPanel] Failed to set returnUrl in localStorage', e);
    }
    router.push('/auth/login' as any); // Đảm bảo path đúng
  };

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  // Nếu AuthProvider đang khởi tạo, có thể hiển thị một trạng thái loading cơ bản
  if (isAuthInitializing) {
    return (
      <div
        className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out ${isLeftPanelOpen ? 'w-72' : 'w-16'
          } flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div> {/* Basic spinner */}
      </div>
    );
  }

  const isChatFunctionalityDisabled = uiHasFatalError;

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
            // Chỉ disable nút khi: có lỗi nghiêm trọng VÀ panel đang đóng
            // (cho phép người dùng đóng panel nếu nó đang mở và có lỗi)
            disabled={isChatFunctionalityDisabled && !isLeftPanelOpen}
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
            // ... props
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
          <div className={`relative mt-auto flex items-center p-3 ${isLeftPanelOpen ? 'justify-start' : 'justify-center'}`}>
            {isLoggedIn ? (
              <>
                <button
                  ref={avatarButtonRef}
                  onClick={handleAvatarClick}
                  // Nút Avatar nên được disabled nếu có lỗi nghiêm trọng VÀ lỗi đó KHÔNG phải là lỗi xác thực
                  // (vì nếu là lỗi auth, người dùng có thể muốn logout từ dropdown)
                  disabled={uiHasFatalError && !isCurrentFatalErrorAuthRelated}
                  className={`rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isLeftPanelOpen ? '' : '-m-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  aria-label={t('Toggle user menu')}
                >
                  <UserIcon />
                </button>
                {isLeftPanelOpen && (firstName || lastName) && (
                  <span className='ml-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white'>
                    {firstName} {lastName}
                  </span>
                )}
                {isUserDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className={`absolute bottom-full z-50 mb-2 w-max rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800 ${isLeftPanelOpen ? 'left-0' : 'left-0 sm:left-auto sm:right-0'}`}
                  >
                    <div className='flex flex-col py-1'>
                      <button
                        onClick={handleLogout}
                        className='block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
                      >
                        {t('Logout')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                ref={loginButtonRef}
                onClick={handleLoginClick}
                // Ép kiểu kết quả thành boolean rõ ràng
                disabled={!!(uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode !== 'AUTH_REQUIRED')}
                className={`group relative inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${(uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode !== 'AUTH_REQUIRED') ? 'opacity-50 cursor-not-allowed' : ''}`}
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