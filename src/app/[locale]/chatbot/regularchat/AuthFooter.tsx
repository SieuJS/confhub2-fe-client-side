// src/app/[locale]/chatbot/regularchat/AuthFooter.tsx
import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLeftPanelAuthControls } from '@/src/hooks/regularchat/useLeftPanelAuthControls'; // Adjust path
import { UserIcon } from '../../utils/header/Icon'; // Adjust path

interface AuthFooterProps {
  isLeftPanelOpen: boolean;
}

export default function AuthFooter({ isLeftPanelOpen }: AuthFooterProps) {
  const t = useTranslations('');
  const {
    user,
    isLoggedIn,
    isAuthInitializing,
    handleLoginClick,
    handleLogout,
    isLoginButtonDisabled,
    isLogoutButtonDisabled,
    isGenericChatFunctionalityDisabled, // Use this for disabling user avatar interaction
  } = useLeftPanelAuthControls();

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  if (isAuthInitializing) {
    return (
      <div className={`mt-auto flex items-center border-t border-gray-200 dark:border-gray-700 ${isLeftPanelOpen ? 'p-3 w-full' : 'p-2 justify-center'}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-300"></div>
        {isLeftPanelOpen && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{t('Initializing')}</span>}
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className={`mt-auto flex items-center border-t border-gray-200 dark:border-gray-700 ${isLeftPanelOpen ? 'p-3 justify-between' : 'p-2 justify-center'}`}>
        {isLeftPanelOpen ? (
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center min-w-0"> {/* Added min-w-0 for better text truncation */}
              <button
                disabled={isGenericChatFunctionalityDisabled}
                className={`flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                aria-label={t('User profile')}
                title={`${firstName} ${lastName}`.trim() || t('User profile')}
              >
                <UserIcon />
              </button>
              <span className='ml-2 max-w-[calc(100%-2rem)] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200'>
                {`${firstName} ${lastName}`.trim() || user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLogoutButtonDisabled || isGenericChatFunctionalityDisabled}
              className={`flex-shrink-0 rounded-md p-1 text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 dark:text-red-400 dark:hover:bg-gray-700
                                     ${(isLogoutButtonDisabled || isGenericChatFunctionalityDisabled) ? 'cursor-not-allowed opacity-50' : ''}`}
              aria-label={t('Logout')}
              title={t('Logout')}
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button
            disabled={isGenericChatFunctionalityDisabled}
            className={`rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:hover:bg-gray-700`}
            aria-label={t('User profile')}
            title={`${firstName} ${lastName}`.trim() || t('User profile')}
          >
            <UserIcon />
          </button>
        )}
      </div>
    );
  }

  // Not logged in
  return (
    <div className={`mt-auto border-t border-gray-200 dark:border-gray-700 ${isLeftPanelOpen ? 'p-3' : 'p-2'}`}>
      <button
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
    </div>
  );
}