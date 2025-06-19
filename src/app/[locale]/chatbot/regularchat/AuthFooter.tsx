// src/app/[locale]/chatbot/regularchat/AuthFooter.tsx
import React from 'react'
import { LogIn, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLeftPanelAuthControls } from '@/src/hooks/regularchat/useLeftPanelAuthControls'
import { UserIcon } from '../../utils/header/Icon'

interface AuthFooterProps {
  isLeftPanelOpen: boolean
}

export default function AuthFooter({ isLeftPanelOpen }: AuthFooterProps) {
  const t = useTranslations('')
  const {
    user,
    isLoggedIn,
    isAuthInitializing,
    handleLoginClick,
    handleLogout,
    isLoginButtonDisabled,
    isLogoutButtonDisabled,
    isGenericChatFunctionalityDisabled
  } = useLeftPanelAuthControls()

  const firstName = user?.firstName || ''
  const lastName = user?.lastName || ''

  if (isAuthInitializing) {
    return (
      <div
        className={`mt-auto flex items-center border-t border-gray-200 dark:border-gray-700 ${isLeftPanelOpen ? 'w-full p-3' : 'justify-center p-2'}`}
      >
        <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-gray-700 dark:border-gray-300'></div>
        {isLeftPanelOpen && (
          <span className='ml-2 text-sm '>{t('Initializing')}</span>
        )}
      </div>
    )
  }

  // Common wrapper for the entire footer content, allowing for flexible stacking
  return (
    <div
      className={`mt-auto border-t border-gray-200 dark:border-gray-700 ${isLeftPanelOpen ? 'p-3' : 'p-2'}`}
    >
      {/* Lưu ý cho người dùng về chatbot */}
      {/* {isLeftPanelOpen && (
        <div className="mb-3 text-xs text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-950 rounded-md">
          <p className="font-semibold">{t('Lưu ý')}:</p>
          <p>{t('Chatbot có thể mắc sai lầm. Vui lòng kiểm tra lại thông tin quan trọng.')}</p>
        </div>
      )} */}

      {isLoggedIn && user ? (
        // Logged in state
        <div
          className={`flex items-center ${isLeftPanelOpen ? 'justify-between' : 'justify-center'}`}
        >
          {isLeftPanelOpen ? (
            <div className='flex w-full items-center justify-between'>
              <div className='flex min-w-0 items-center'>
                <button
                  disabled={isGenericChatFunctionalityDisabled}
                  className={`flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                  aria-label={t('User profile')}
                  title={`${firstName} ${lastName}`.trim() || t('User profile')}
                >
                  <UserIcon />
                </button>
                <span className='ml-2 max-w-[calc(100%-2rem)] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium '>
                  {`${firstName} ${lastName}`.trim() || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={
                  isLogoutButtonDisabled || isGenericChatFunctionalityDisabled
                }
                className={`flex-shrink-0 rounded-md p-1 text-red-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 dark:text-red-400 dark:hover:bg-gray-700
                                     ${isLogoutButtonDisabled || isGenericChatFunctionalityDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
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
      ) : (
        // Not logged in state
        <button
          onClick={handleLoginClick}
          disabled={isLoginButtonDisabled}
          className={`group relative inline-flex items-center rounded-md px-3 pb-1.5 pt-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      isLoginButtonDisabled
                        ? 'cursor-not-allowed bg-gray-400'
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
  )
}
