// src/contexts/AuthContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useRef // <-- Thêm useRef

} from 'react' // Thêm useMemo
import { useRouter } from 'next/navigation'
import { AuthResponse, UserResponse } from '@/src/models/response/user.response'
import { appConfig } from '@/src/middleware'

// Import các store cần thiết
import { useMessageStore } from '../app/[locale]/chatbot/stores/messageStore/messageStore'
import { useConversationStore } from '../app/[locale]/chatbot/stores/conversationStore/conversationStore'
import { useSocketStore } from '../app/[locale]/chatbot/stores/socketStore'
import { useUiStore } from '../app/[locale]/chatbot/stores/uiStore'
// import { useSettingsStore } from '../app/[locale]/chatbot/stores/setttingsStore';

// --- Helper: LocalStorage Management ---
const LOCAL_STORAGE_KEYS = {
  USER: 'user',
  LOGIN_STATUS: 'loginStatus',
  TOKEN: 'token',
  RETURN_URL: 'returnUrl'
}

const _getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)
}

const _persistUserToLocalStorage = (userData: UserResponse | null): void => {
  if (typeof window === 'undefined') return
  if (userData) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData))
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER)
  }
}

const _persistAuthDataToLocalStorage = (authData: AuthResponse): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(authData.user))
  localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, authData.token)
  localStorage.setItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS, 'true')
}

const _clearAuthDataFromLocalStorage = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER)
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN)
  localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS)
  localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURN_URL)
}

// --- Auth Context Interface ---
interface AuthContextType {
  user: UserResponse | null
  isLoggedIn: boolean
  isLoading: boolean
  isInitializing: boolean
  error: string | null
  signIn: (credentials: Record<string, string>) => Promise<void>
  googleSignIn: () => Promise<void>
  processTokenFromOAuth: (
    token: string,
    customRedirectPath?: string
  ) => Promise<void>
  logout: (options?: {
    callApi?: boolean
    preventRedirect?: boolean
  }) => Promise<void>
  getToken: () => string | null
  updateAuthUser: (newUserData: UserResponse) => void
  deleteAccount: () => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<UserResponse | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const authCheckTimer = useRef<NodeJS.Timeout | null>(null); // <-- Thêm một ref để giữ timer


  // updateAuthUser đã được useCallback trong code gốc, giữ nguyên
  const updateAuthUser = useCallback((newUserData: UserResponse) => {
    console.log(
      '[AuthProvider] Updating auth user state with new data:',
      newUserData
    )
    setUserState(newUserData)
    _persistUserToLocalStorage(newUserData)
  }, [])

  // _handleAuthSuccess đã được useCallback trong code gốc, giữ nguyên
  const _handleAuthSuccess = useCallback(
    (authData: AuthResponse, customRedirectPath?: string) => {
      _persistAuthDataToLocalStorage(authData)
      setUserState(authData.user)
      setIsLoggedIn(true)
      setError(null)
      useUiStore.getState().clearFatalError()
      useMessageStore.getState().clearAuthErrorMessages()
      const returnUrl =
        customRedirectPath ||
        (typeof window !== 'undefined'
          ? localStorage.getItem(LOCAL_STORAGE_KEYS.RETURN_URL)
          : null) ||
        '/'
      if (typeof window !== 'undefined')
        localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURN_URL)
      console.log('[AuthProvider] Auth success. Redirecting to:', returnUrl)
      router.push(returnUrl)
    },
    [router]
  )

  // _performLogout đã được useCallback trong code gốc, giữ nguyên
  const _performLogout = useCallback(
    async (options?: { preventRedirect?: boolean; callApi?: boolean }) => {
      console.log('[AuthProvider] Performing logout. Options:', options)
      const previousToken = _getStoredToken()
      _clearAuthDataFromLocalStorage()
      setUserState(null)
      setIsLoggedIn(false)
      setError(null)
      console.log('[AuthProvider] Resetting related chatbot stores on logout.')
      useMessageStore.getState().resetChatUIForNewConversation(true)
      useConversationStore.getState().resetConversationState()
      useUiStore.getState().clearFatalError()
      const socketStore = useSocketStore.getState()
      socketStore.disconnectSocket()
      socketStore.setCurrentAuthTokenForSocket(null)
      socketStore.setIsConnected(false, null)
      socketStore.setIsServerReadyForCommands(false)
      socketStore.setHasFatalConnectionError(false)
      if (options?.callApi) {
        try {
          const headers: HeadersInit = { 'Content-Type': 'application/json' }
          if (previousToken) {
            headers['Authorization'] = `Bearer ${previousToken}`
          }
          await fetch(
            `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/logout`,
            {
              method: 'POST',
              headers: headers
            }
          )
          console.log('[AuthProvider] Called server logout API successfully.')
        } catch (e) {
          console.warn('[AuthProvider] Failed to call server logout API.', e)
        }
      }
      if (!options?.preventRedirect) {
        console.log('[AuthProvider] Redirecting to / after logout.')
        router.push('/')
      } else {
        console.log(
          '[AuthProvider] Logout performed, redirect prevented by options.'
        )
      }
    },
    [router]
  )

  // SỬA LẠI useEffect NÀY
  useEffect(() => {
    // Hủy bỏ timer của lần render trước nếu có
    if (authCheckTimer.current) {
      clearTimeout(authCheckTimer.current);
    }

    let isMounted = true;

    const initializeAuth = async () => {
      const token = _getStoredToken()
      const storedLoginStatus =
        typeof window !== 'undefined' &&
        localStorage.getItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS) === 'true'
      if (token && storedLoginStatus) {
        console.log(
          '[AuthProvider] Token found. Verifying with /me endpoint...'
        )
        try {
          const response = await fetch(
            `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/me`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          if (!isMounted) return
          if (response.ok) {
            const userData = (await response.json()) as UserResponse
            console.log(
              '[AuthProvider] /me verification successful. User:',
              userData.email
            )
            _persistAuthDataToLocalStorage({ user: userData, token })
            setUserState(userData)
            setIsLoggedIn(true)
            useUiStore.getState().clearFatalError()
            useMessageStore.getState().clearAuthErrorMessages()
          } else if (response.status === 401 || response.status === 403) {
            console.warn(
              `[AuthProvider] /me verification failed (${response.status}). Token invalid or expired. Logging out.`
            )
            await _performLogout({ preventRedirect: true, callApi: false })
          } else {
            console.error(
              `[AuthProvider] /me verification failed with status: ${response.status}. Logging out.`
            )
            if (isMounted)
              setError(`Session check failed (Status: ${response.status})`)
            await _performLogout({ preventRedirect: true, callApi: false })
          }
        } catch (err) {
          if (!isMounted) return
          console.error(
            '[AuthProvider] Network or fetch error during /me verification:',
            err
          )
          if (isMounted) setError('Network error during session verification.')
          await _performLogout({ preventRedirect: true, callApi: false })
        }
      } else {
        console.log(
          '[AuthProvider] No valid token or login status. Ensuring logged out state.'
        )
        if (isLoggedIn || user) {
          await _performLogout({ preventRedirect: true, callApi: false })
        }
      }
      if (isMounted) setIsInitializing(false)
    }
    // Đặt một timer mới. Chỉ sau 100ms không có lần F5 nào nữa thì mới chạy.
    authCheckTimer.current = setTimeout(() => {
      console.log('[AuthProvider] Debounced auth check triggered.');
      initializeAuth();
    }, 100); // 100ms là một khoảng thời gian hợp lý

    return () => {
      isMounted = false;
      // Dọn dẹp timer khi component unmount
      if (authCheckTimer.current) {
        clearTimeout(authCheckTimer.current);
      }
    };
  }, [_performLogout]); // Dependency vẫn là _performLogout vì nó ổn định

  // Bọc các hàm này trong useCallback
  const signIn = useCallback(
    async (credentials: Record<string, string>): Promise<void> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...credentials, mode: 'user' })
          }
        )
        const data = await response.json()
        if (response.ok && data.user && data.token) {
          _handleAuthSuccess(data as AuthResponse)
        } else {
          setError(data.message || 'Incorrect email or password.')
        }
      } catch (err: any) {
        setError('Login failed. Please check your connection.')
      } finally {
        setIsLoading(false)
      }
    },
    [_handleAuthSuccess]
  ) // Phụ thuộc vào _handleAuthSuccess (đã ổn định)

  const googleSignIn = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    const currentPath =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/'
    if (typeof window !== 'undefined')
      localStorage.setItem(LOCAL_STORAGE_KEYS.RETURN_URL, currentPath)
    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : ''
    console.log(currentOrigin)
    window.alert(currentOrigin)
    const googleAuthUrl = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/google?redirectUrl=${encodeURIComponent(currentOrigin + '/apis/auth/google-callback')}`
    if (typeof window !== 'undefined') window.location.href = googleAuthUrl
    // Không setIsLoading(false) ở đây vì trang sẽ redirect
  }, []) // Không có dependencies thay đổi

  // processTokenFromOAuth đã được useCallback trong code gốc, giữ nguyên
  const processTokenFromOAuth = useCallback(
    async (token: string, customRedirectPath?: string): Promise<void> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/me`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        const userData = await response.json()
        if (response.ok && userData) {
          _handleAuthSuccess(
            { user: userData as UserResponse, token },
            customRedirectPath
          )
        } else {
          setError(userData.message || 'Failed to complete login after OAuth.')
          await _performLogout({ preventRedirect: true, callApi: false })
        }
      } catch (err: any) {
        setError('Network error while completing login.')
        await _performLogout({ preventRedirect: true, callApi: false })
      } finally {
        setIsLoading(false)
      }
    },
    [_handleAuthSuccess, _performLogout]
  )

  const logout = useCallback(
    async (options?: {
      callApi?: boolean
      preventRedirect?: boolean
    }): Promise<void> => {
      setIsLoading(true)
      await _performLogout({
        callApi: options?.callApi ?? true,
        preventRedirect: options?.preventRedirect ?? false
      })
      setIsLoading(false)
    },
    [_performLogout]
  ) // Phụ thuộc vào _performLogout (đã ổn định)

  // getToken đã được useCallback trong code gốc, giữ nguyên
  const getToken = useCallback((): string | null => _getStoredToken(), [])

  // THÊM HÀM NÀY: deleteAccount
  const deleteAccount = useCallback(async (): Promise<{
    success: boolean
    error?: string
  }> => {
    // Đảm bảo có user ID và token trước khi xóa
    if (!user?.id || !getToken()) {
      const errorMessage = 'User not authenticated or ID missing.'
      console.error('[AuthProvider] ' + errorMessage)
      return { success: false, error: errorMessage }
    }

    setIsLoading(true) // Bắt đầu trạng thái loading
    setError(null) // Xóa lỗi chung trước đó

    try {
      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/delete`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}` // Sử dụng token hiện tại
          }
        }
      )

      if (response.ok) {
        console.log('[AuthProvider] Account deleted successfully on server.')
        // Sau khi xóa thành công trên server, thực hiện logout cục bộ
        // Không gọi API logout của server nữa vì tài khoản đã bị xóa
        await _performLogout({ callApi: false, preventRedirect: false }) // Chuyển hướng về trang chủ
        return { success: true }
      } else {
        const errorData = await response.json()
        const errorMessage =
          errorData.message ||
          `Failed to delete account (Status: ${response.status})`
        console.error('[AuthProvider] Failed to delete account:', errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err: any) {
      console.error(
        '[AuthProvider] Network or fetch error during account deletion:',
        err
      )
      return { success: false, error: 'Network error during account deletion.' }
    } finally {
      setIsLoading(false) // Kết thúc trạng thái loading
    }
  }, [user, getToken, _performLogout]) // Các dependencies cần thiết

  // Memoize contextValue
  const contextValue = useMemo(
    () => ({
      user,
      isLoggedIn,
      isLoading,
      isInitializing,
      error,
      signIn, // Tham chiếu đến signIn đã được useCallback
      googleSignIn, // Tham chiếu đến googleSignIn đã được useCallback
      processTokenFromOAuth, // Tham chiếu đến processTokenFromOAuth đã được useCallback
      logout, // Tham chiếu đến logout đã được useCallback
      getToken, // Tham chiếu đến getToken đã được useCallback
      updateAuthUser, // Tham chiếu đến updateAuthUser đã được useCallback
      deleteAccount // THÊM DÒNG NÀY: Thêm deleteAccount vào danh sách dependencies
    }),
    [
      user,
      isLoggedIn,
      isLoading,
      isInitializing,
      error,
      signIn, // Các hàm này giờ là dependencies ổn định
      googleSignIn,
      processTokenFromOAuth,
      logout,
      getToken,
      updateAuthUser,
      deleteAccount // THÊM DÒNG NÀY: Thêm deleteAccount vào danh sách dependencies
    ]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
