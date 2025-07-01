// src/hooks/chatbot/useLeftPanelAuthControls.ts
import { useAuth } from '@/src/contexts/AuthContext';
import { useUiStore } from '@/src/app/[locale]/chatbot/stores'; // Adjust path
import { useShallow } from 'zustand/react/shallow';
import { useRouter, usePathname } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';

export function useLeftPanelAuthControls() {
  const { user, isLoggedIn, logout, isInitializing: isAuthInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    hasFatalError: uiHasFatalError,
    fatalErrorCode: uiFatalErrorCode,
  } = useUiStore(
    useShallow(state => ({
      hasFatalError: state.hasFatalError,
      fatalErrorCode: state.fatalErrorCode,
    }))
  );

  const isCurrentFatalErrorAuthRelated =
    uiHasFatalError &&
    uiFatalErrorCode &&
    ['AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED', 'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED'].includes(
      uiFatalErrorCode
    );

  const handleLogout = async () => {
    try {
      await logout({ callApi: true });
    } catch (error) {
      // console.error("[useLeftPanelAuthControls] Error during logout:", error);
    }
  };

  const handleLoginClick = async () => {
    const currentSearchParamsString = searchParams.toString();
    const fullUnlocalizedUrl = `${pathname}${currentSearchParamsString ? `?${currentSearchParamsString}` : ''}`;
    try {
      localStorage.setItem('returnUrl', fullUnlocalizedUrl);
    } catch (e) {
      // console.error('[useLeftPanelAuthControls] Failed to set returnUrl in localStorage', e);
    }

    if (pathname.includes('/chatbot')) {
      const shouldAttemptLogout = isLoggedIn || (uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode !== 'AUTH_REQUIRED');
      if (shouldAttemptLogout) {
        // console.log('[useLeftPanelAuthControls] Attempting pre-login logout. isLoggedIn:', isLoggedIn, 'uiHasFatalError:', uiHasFatalError, 'isCurrentFatalErrorAuthRelated:', isCurrentFatalErrorAuthRelated, 'uiFatalErrorCode:', uiFatalErrorCode);
        try {
          await logout({ callApi: true, preventRedirect: true });
          // console.log('[useLeftPanelAuthControls] Pre-login logout successful.');
        } catch (e) {
          // console.error('[useLeftPanelAuthControls] Error during pre-login logout:', e);
        }
      }
    }
    router.push('/auth/login' as any); // Cast to any if AppPathname doesn't include /auth/login directly
  };

  const isLoginButtonDisabled = !!(uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode !== 'AUTH_REQUIRED');
  const isLogoutButtonDisabled = !!(uiHasFatalError && isCurrentFatalErrorAuthRelated && uiFatalErrorCode === 'AUTH_REQUIRED');
  const isGenericChatFunctionalityDisabled = uiHasFatalError && !isCurrentFatalErrorAuthRelated;


  return {
    user,
    isLoggedIn,
    isAuthInitializing,
    handleLoginClick,
    handleLogout,
    isLoginButtonDisabled,
    isLogoutButtonDisabled,
    isGenericChatFunctionalityDisabled, // Added for other parts of LeftPanel
    uiHasFatalError, // Expose for direct checks if needed
    isCurrentFatalErrorAuthRelated, // Expose for direct checks
  };
}