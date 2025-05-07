// src/app/[locale]/chatbot/LeftPanel.tsx
import React from 'react'
import { ChatMode, ConversationMetadata } from './lib/regular-chat.types'
import { X, HomeIcon, History as HistoryIcon, Bot, Radio, AlignJustify } from 'lucide-react'
import ConversationList from './sidepanel/ConversationList'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import type { ComponentProps } from 'react'

// --- PROPS INTERFACE (as before) ---
interface LeftPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  currentChatMode: ChatMode;
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
  onShowHistoryView: () => void;
  currentView: 'chat' | 'history';
}

// --- TYPES FOR NAVIGATION ITEMS (as before) ---
type AppHref = ComponentProps<typeof Link>['href'];
interface NavItemBase { id: string; label: string; icon: React.ElementType; isActive: boolean; disabled?: boolean; }
interface NavLinkItem extends NavItemBase { type: 'link'; href: AppHref; }
interface NavButtonItem extends NavItemBase { type: 'button'; action: () => void; }
type NavItem = NavLinkItem | NavButtonItem;
// ----------------------------------


const LeftPanel: React.FC<LeftPanelProps> = ({
  isOpen,
  onToggleOpen,
  currentChatMode,
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
  onShowHistoryView,
  currentView,
}) => {
  const t = useTranslations()
  const disableChatModeSelection = isLiveConnected

  const navItems: NavItem[] = [
    { id: 'home', label: t('Home'), icon: HomeIcon, href: '/', isActive: false, type: 'link' },
    { id: 'regularChat', label: t('Regular_Chat'), icon: Bot, action: () => onChatModeChange('regular'), isActive: currentView === 'chat' && currentChatMode === 'regular', disabled: disableChatModeSelection, type: 'button' },
    { id: 'liveStream', label: t('Live_Stream'), icon: Radio, action: () => onChatModeChange('live'), isActive: currentView === 'chat' && currentChatMode === 'live', disabled: disableChatModeSelection, type: 'button' },
    { id: 'chatHistory', label: t('Chat_History'), icon: HistoryIcon, action: onShowHistoryView, isActive: currentView === 'history', type: 'button' },
  ]

  // Define common classes for icon-only buttons (toggle and nav items when collapsed)
  const iconOnlyButtonBaseClasses = "h-12 w-12 justify-center p-2"; // Matches nav items when collapsed
  const commonButtonInteractiveClasses = "rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500";

  // Common classes for expanded buttons (toggle and nav items when expanded)
  const expandedButtonBaseClasses = "px-3 py-2.5 text-sm font-medium"; // Matches nav items when expanded

  return (
    <div
      className={`h-full flex-shrink-0 bg-white shadow-xl transition-all duration-300 ease-in-out dark:bg-gray-900 ${
        isOpen ? 'w-72' : 'w-20' // w-20 = 5rem, fits a 3rem (h-12/w-12) button + 1rem padding (p-2 on button, p-2 on container)
      }`}
      aria-hidden={!isOpen || undefined}
    >
      <div className='flex h-full w-full flex-col overflow-hidden'>
        {/* Container for Toggle Button and Navigation. Controls padding for alignment. */}
        {/* When collapsed (isOpen=false), p-2 allows the h-12 w-12 buttons to fit nicely in w-20 */}
        <div className={`flex flex-col flex-shrink-0 ${isOpen ? 'p-3' : 'p-2 space-y-1'}`}>
          {/* Toggle Button (X or AlignJustify) */}
          <div className={`${isOpen ? 'flex items-center justify-between mb-3' : 'flex justify-center'}`}>
            <button
              onClick={onToggleOpen}
              className={`flex items-center
                ${isOpen ? `${expandedButtonBaseClasses} ${commonButtonInteractiveClasses}` : `${iconOnlyButtonBaseClasses} ${commonButtonInteractiveClasses}`}
                ${isOpen ? 'w-auto' : 'w-full' } // Full width for collapsed to match nav items
              `}
              title={isOpen ? t('Close_panel') : t('Open_panel')}
              aria-label={isOpen ? t('Close_panel') : t('Open_panel')}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                // When open, the X button might not need to be full width if there's a title next to it
                // For now, keeping it simple, it takes available space or has fixed size
                <>
                  <span className="text-lg font-semibold flex-grow">{/* Optional: Menu title */}</span>
                  <X size={20} className='h-5 w-5 ml-auto' aria-hidden='true' />
                </>
              ) : (
                <AlignJustify size={24} className='h-6 w-6' aria-hidden='true' /> // Icon size matches collapsed nav items
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className={`${isOpen ? 'space-y-1' : 'space-y-1'}`}> {/* space-y-1 for collapsed as well */}
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
                    onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                    tabIndex={item.disabled ? -1 : undefined}
                  >
                    <IconComponent
                      size={isOpen ? 20 : 24}
                      className={`${isOpen ? 'mr-3' : ''} flex-shrink-0 ${item.isActive ? 'text-blue-600' : 'group-hover:text-gray-500 dark:group-hover:text-gray-400'}`}
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
                    size={isOpen ? 20 : 24} // Icon size 24 for collapsed state
                    className={`${isOpen ? 'mr-3' : ''} flex-shrink-0 ${item.isActive ? 'text-blue-600' : 'group-hover:text-gray-500 dark:group-hover:text-gray-400'}`}
                    strokeWidth={1.75}
                  />
                  {isOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div> {/* End of Toggle Button and Navigation container */}


        {/* Divider - only visible when panel is open */}
        {isOpen && (
          <div className='mx-3 my-2 border-t border-gray-200 dark:border-gray-600'></div>
        )}

        {/* Conversation List - only visible when panel is open */}
        {isOpen && (
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
            currentView={currentView}
          />
        )}
      </div>
    </div>
  );
};

export default LeftPanel;