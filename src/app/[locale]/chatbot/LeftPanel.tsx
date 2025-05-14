// src/app/[locale]/chatbot/LeftPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import ConversationList from './regularchat/ConversationList';
import { useUiStore, useConversationStore, useSettingsStore } from './stores';
import { useShallow } from 'zustand/react/shallow';
import { useLeftPanelNavigation } from '@/src/hooks/chatbot/useLeftPanelNavigation';
import NavigationMenu from './NavigationMenu';
import PanelToggleButton from './PanelToggleButton';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG
import { UserIcon } from '../utils/header/Icon';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Bỏ interface UserData ở đây vì thông tin user sẽ đến từ useAuth().user

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
  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  const { user, isLoggedIn, logout, isInitializing: isAuthInitializing } = useAuth();
  const t = useTranslations('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isLeftPanelOpen, toggleLeftPanel } = useUiStore(
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      toggleLeftPanel: state.toggleLeftPanel
    }))
  );
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // Thông tin firstName, lastName sẽ lấy trực tiếp từ `user` object của `useAuth`
  // const [firstName, setFirstName] = useState<string | null>(null);
  // const [lastName, setLastName] = useState<string | null>(null);
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

  const { chatMode } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode
    }))
  );

  const { navItems } = useLeftPanelNavigation({
    currentView,
    isLiveServiceConnected
  });

  const showConversationList =
    isLeftPanelOpen && currentView === 'chat' && chatMode !== 'live';

  useEffect(() => {
    setIsClient(true);
    // Không cần đọc localStorage cho user nữa, vì `useAuth` đã làm điều đó và cung cấp `user` object.
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isLoggedIn && isUserDropdownOpen) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          avatarButtonRef.current &&
          !avatarButtonRef.current.contains(event.target as Node)
        ) {
          setIsUserDropdownOpen(false);
        }
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen, isClient, isLoggedIn]);

  useEffect(() => {
    // Nếu panel bị đóng, đóng luôn dropdown người dùng
    if (!isLeftPanelOpen && isUserDropdownOpen) {
      setIsUserDropdownOpen(false);
    }
  }, [isLeftPanelOpen, isUserDropdownOpen]);

  const handleAvatarClick = () => {
    setIsUserDropdownOpen(prev => !prev);
  };

  const handleLogout = async () => {
    await logout(); // logout từ useAuth sẽ xóa localStorage và cập nhật state
    setIsUserDropdownOpen(false);
    // Không cần router.push('/') ở đây nếu logout() đã tự động redirect
    // Nếu logout() không redirect, bạn có thể thêm:
    // router.push('/');
  };

  const handleLoginClick = () => {
    const localePrefix = pathname.split('/')[1] || 'en';
    const currentSearchParams = searchParams.toString();
    const fullUrl = `${pathname}${currentSearchParams ? `?${currentSearchParams}` : ''}`;

    try {
      localStorage.setItem('returnUrl', fullUrl);
      console.log('[LeftPanel] Return URL set in localStorage:', fullUrl);
    } catch (e) {
      console.error('[LeftPanel] Failed to set returnUrl in localStorage', e);
    }
    const pathWithLocale = `/${localePrefix}/auth/login`;
    router.push(pathWithLocale);
  };

  // Lấy firstName và lastName từ user object (nếu user tồn tại)
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  // Nếu AuthProvider đang khởi tạo, có thể hiển thị một trạng thái loading cơ bản
  if (isAuthInitializing) {
    return (
      <div
        className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out ${
          isLeftPanelOpen ? 'w-72' : 'w-16'
        } flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div> {/* Basic spinner */}
      </div>
    );
  }


  return (
    <div
      className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out  ${
        isLeftPanelOpen ? 'w-72' : 'w-16'
      }`}
      aria-hidden={!isLeftPanelOpen || undefined}
    >
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div
          className={`flex flex-shrink-0 flex-col ${isLeftPanelOpen ? 'p-3' : 'space-y-1 p-2'}`}
        >
          <PanelToggleButton
            isPanelOpen={isLeftPanelOpen}
            onTogglePanel={toggleLeftPanel}
          />
          <NavigationMenu
            navItems={navItems}
            isLeftPanelOpen={isLeftPanelOpen}
          />
        </div>

        {isLeftPanelOpen && (
          <div className='mx-3 my-2 border-t border-gray-200'></div>
        )}

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
          />
        )}

        {isClient && ( // isClient vẫn hữu ích để tránh render phần này phía server nếu không cần
          <div
            className={`relative mt-auto flex items-center p-3 ${isLeftPanelOpen ? 'justify-start' : 'justify-center'}`}
          >
            {isLoggedIn ? ( // Sử dụng isLoggedIn từ useAuth
              <>
                <button
                  ref={avatarButtonRef}
                  onClick={handleAvatarClick}
                  className={`rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isLeftPanelOpen ? '' : '-m-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  aria-label={t('Toggle user menu')}
                >
                  {/* TODO: Hiển thị avatar từ user.avatar nếu có */}
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
                    className={`absolute bottom-full z-50 mb-2 w-max rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800
                                  ${isLeftPanelOpen ? 'left-0' : 'left-0 sm:left-auto sm:right-0'}`} // Điều chỉnh vị trí cho panel đóng
                  >
                    <div className='flex flex-col py-1'>
                      {/* TODO: Thêm link tới trang Profile nếu có */}
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
                className={`group relative inline-flex items-center rounded-md bg-button px-2 py-2 text-sm font-semibold text-button-text shadow-md transition-colors duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-button`}
                aria-label={t('Login')}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor' // Nên là currentColor để thừa hưởng màu từ text-button-text
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className={`lucide lucide-log-in ${isLeftPanelOpen ? 'mr-2' : ''}`}
                >
                  <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' />
                  <polyline points='10 17 15 12 10 7' />
                  <line x1='15' x2='3' y1='12' y2='12' />
                </svg>
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