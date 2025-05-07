// src/app/[locale]/chatbot/LeftPanel.tsx
import React from 'react'
import { ChatMode, ConversationMetadata } from './lib/regular-chat.types'
import { X, HomeIcon, History as HistoryIcon, Bot, Radio, AlignJustify } from 'lucide-react'
import ConversationList from './sidepanel/ConversationList'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/src/navigation' // Thêm usePathname
import type { ComponentProps } from 'react'

interface LeftPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  currentChatMode: ChatMode; // Là chatMode từ useChatSettings
  onChatModeChange: (mode: ChatMode) => void;
  isLiveConnected: boolean;
  conversationList: ConversationMetadata[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
  isLoadingConversations: boolean;
  onDeleteConversation: (conversationId: string) => void;
  onClearConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  onPinConversation: (conversationId: string, isPinned: boolean) => void;
  // onShowHistoryView: () => void; // <-- ĐÃ XÓA
  currentView: 'chat' | 'history'; // Được xác định từ pathname trong MainLayoutComponent
}

type AppHref = ComponentProps<typeof Link>['href'];
interface NavItemBase { id: string; label: string; icon: React.ElementType; isActive: boolean; disabled?: boolean; }
interface NavLinkItem extends NavItemBase { type: 'link'; href: AppHref; }
interface NavButtonItem extends NavItemBase { type: 'button'; action: () => void; }
type NavItem = NavLinkItem | NavButtonItem;

const LeftPanel: React.FC<LeftPanelProps> = ({
  isOpen,
  onToggleOpen,
  currentChatMode, // Đây chính là chatMode từ context
  onChatModeChange,
  isLiveConnected,
  conversationList,
  activeConversationId,
  onSelectConversation,
  onStartNewConversation,
  isLoadingConversations,
  onDeleteConversation,
  onClearConversation,
  onRenameConversation,
  onPinConversation,
  currentView,
}) => {
  const t = useTranslations()
  const currentPathname = usePathname(); // Unlocalized pathname
  const disableChatModeSelection = isLiveConnected;

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: t('Home'),
      icon: HomeIcon,
      href: '/',
      isActive: currentPathname === '/', // Active khi ở trang chủ
      type: 'link'
    },
    {
      id: 'regularChat',
      label: t('Regular_Chat'),
      icon: Bot,
      // action nên điều hướng hoặc gọi hàm điều hướng từ context
      // onChatModeChange trong MainLayout đã gọi handleChatModeNavigation (điều hướng)
      // action: () => onChatModeChange('regular'),
      // isActive: currentView === 'chat' && currentChatMode === 'regular',
      href: { pathname: '/chatbot/regularchat' }, // Thay action bằng href
      isActive: currentView === 'chat' && currentChatMode === 'regular' && currentPathname === '/chatbot/regularchat',
      disabled: disableChatModeSelection,
      type: 'link' // Giữ button nếu action xử lý điều hướng qua context
    },
    {
      id: 'liveStream',
      label: t('Live_Stream'),
      icon: Radio,
      // action: () => onChatModeChange('live'),
      // isActive: currentView === 'chat' && currentChatMode === 'live',
      href: { pathname: '/chatbot/livechat' }, // Thay action bằng href
      isActive: currentView === 'chat' && currentChatMode === 'live' && currentPathname === '/chatbot/livechat',
      disabled: disableChatModeSelection,
      type: 'link'
    },
    {
      id: 'chatHistory',
      label: t('Chat_History'),
      icon: HistoryIcon,
      href: { pathname: '/chatbot/history' }, // Sử dụng object href cho next-intl Link
      isActive: currentView === 'history', // currentView đã được xác định là 'history' nếu ở /chatbot/history
      type: 'link'
    },
  ];

  const iconOnlyButtonBaseClasses = "h-12 w-12 justify-center p-2";
  const commonButtonInteractiveClasses = "rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const expandedButtonBaseClasses = "px-3 py-2.5 text-sm font-medium";

  return (
    <div
      className={`h-full flex-shrink-0 bg-white shadow-xl transition-all duration-300 ease-in-out dark:bg-gray-900 ${
        isOpen ? 'w-72' : 'w-20'
      }`}
      aria-hidden={!isOpen || undefined}
    >
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className={`flex flex-col flex-shrink-0 ${isOpen ? 'p-3' : 'p-2 space-y-1'}`}>
          <div className={`${isOpen ? 'flex items-center justify-between mb-3' : 'flex justify-center'}`}>
            <button
              onClick={onToggleOpen}
              className={`flex items-center
                ${isOpen ? `${expandedButtonBaseClasses} ${commonButtonInteractiveClasses}` : `${iconOnlyButtonBaseClasses} ${commonButtonInteractiveClasses}`}
                ${isOpen ? 'w-auto' : 'w-full' }
              `}
              title={isOpen ? t('Close_panel') : t('Open_panel')}
              aria-label={isOpen ? t('Close_panel') : t('Open_panel')}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <>
                  <span className="text-lg font-semibold flex-grow">{/* Menu */}</span>
                  <X size={20} className='h-5 w-5 ml-auto' aria-hidden='true' />
                </>
              ) : (
                <AlignJustify size={24} className='h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>

          <nav className={`${isOpen ? 'space-y-1' : 'space-y-1'}`}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActiveClasses = item.isActive
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300'
                : commonButtonInteractiveClasses;
              
              const disabledClasses = item.disabled ? 'cursor-not-allowed opacity-50' : '';

              const buttonLayoutClasses = isOpen
                ? expandedButtonBaseClasses
                : iconOnlyButtonBaseClasses;

              if (item.type === 'link') {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center w-full group ${buttonLayoutClasses} ${isActiveClasses} ${disabledClasses}`}
                    title={isOpen ? undefined : item.label}
                    aria-current={item.isActive ? 'page' : undefined}
                    aria-disabled={item.disabled}
                    onClick={(e) => {
                      if (item.disabled) e.preventDefault();
                    }}
                    tabIndex={item.disabled ? -1 : undefined}
                  >
                    <IconComponent
                      size={isOpen ? 20 : 24}
                      className={`${isOpen ? 'mr-3' : ''} flex-shrink-0 ${item.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'}`}
                      strokeWidth={1.75}
                    />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                );
              }
              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={item.action}
                  disabled={item.disabled}
                  className={`flex items-center w-full group ${buttonLayoutClasses} ${isActiveClasses} ${disabledClasses}`}
                  title={isOpen ? undefined : item.label}
                  aria-pressed={item.isActive}
                  aria-label={!isOpen ? item.label : undefined}
                >
                  <IconComponent
                    size={isOpen ? 20 : 24}
                    className={`${isOpen ? 'mr-3' : ''} flex-shrink-0 ${item.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'}`}
                    strokeWidth={1.75}
                  />
                  {isOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {isOpen && (
          <div className='mx-3 my-2 border-t border-gray-200 dark:border-gray-600'></div>
        )}

        {isOpen && currentView === 'chat' && ( // Chỉ hiển thị ConversationList khi ở view 'chat'
          <ConversationList
            conversationList={conversationList}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onStartNewConversation={onStartNewConversation}
            isLoading={isLoadingConversations}
            onDeleteConversation={onDeleteConversation}
            onClearConversation={onClearConversation}
            onRenameConversation={onRenameConversation}
            onPinConversation={onPinConversation}
            currentView={currentView} // Truyền currentView để ConversationList có thể xử lý khác nếu cần
          />
        )}
      </div>
    </div>
  );
};

export default LeftPanel;