
// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse, UserResponse } from '@/src/models/response/user.response';
import { appConfig } from '@/src/middleware';
import { useMessageStore } from '../app/[locale]/chatbot/stores';

// --- Helper: LocalStorage Management ---
const LOCAL_STORAGE_KEYS = {
  USER: 'user',
  LOGIN_STATUS: 'loginStatus',
  TOKEN: 'token',
  RETURN_URL: 'returnUrl',
};

const _getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
};

// Hàm này được gọi khi user state thay đổi để persist vào localStorage
const _persistUserToLocalStorage = (userData: UserResponse | null): void => {
  if (typeof window === 'undefined') return;
  if (userData) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData));
    // Token và loginStatus thường được set khi login, không nhất thiết phải set lại ở đây
    // trừ khi API update user cũng trả về token mới.
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }
};


const _persistAuthDataToLocalStorage = (authData: AuthResponse): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(authData.user));
  localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, authData.token);
  localStorage.setItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS, 'true');
};

const _clearAuthDataFromLocalStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURN_URL);
};

// --- Auth Context Interface ---
interface AuthContextType {
  user: UserResponse | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  signIn: (credentials: Record<string, string>) => Promise<void>;
  googleSignIn: () => Promise<void>;
  processTokenFromOAuth: (token: string, customRedirectPath?: string) => Promise<void>;
  logout: (options?: { callApi?: boolean }) => Promise<void>;
  getToken: () => string | null;
  // <<<< THÊM HÀM CẬP NHẬT USER VÀO INTERFACE >>>>
  updateAuthUser: (newUserData: UserResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<UserResponse | null>(null); // Đổi tên state setter
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // <<<< HÀM MỚI ĐỂ CẬP NHẬT USER STATE VÀ LOCALSTORAGE >>>>
  const updateAuthUser = useCallback((newUserData: UserResponse) => {
    console.log("[AuthProvider] Updating auth user state with new data:", newUserData);
    setUserState(newUserData); // Cập nhật React state
    _persistUserToLocalStorage(newUserData); // Cập nhật localStorage
    // Không cần cập nhật isLoggedIn ở đây vì user chỉ được update khi đã login
  }, []);


  const _handleAuthSuccess = useCallback((authData: AuthResponse, customRedirectPath?: string) => {
    _persistAuthDataToLocalStorage(authData);
    setUserState(authData.user); // Sử dụng setUserState
    setIsLoggedIn(true);
    setError(null);

    const returnUrl = customRedirectPath || localStorage.getItem(LOCAL_STORAGE_KEYS.RETURN_URL) || '/';
    localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURN_URL);
    console.log("[AuthProvider] Auth success. Redirecting to:", returnUrl);
    router.push(returnUrl);
  }, [router]); // Không cần updateAuthUser ở đây vì _handleAuthSuccess đã xử lý cả user và token

  const _performLogout = useCallback(async (options?: { preventRedirect?: boolean; callApi?: boolean }) => {
    console.log("[AuthProvider] Performing logout. Options:", options);
    _clearAuthDataFromLocalStorage();
    setUserState(null); // Sử dụng setUserState
    setIsLoggedIn(false);
    setError(null);

    // Thêm dòng này để reset MessageStore khi logout
    useMessageStore.getState().resetChatUIForNewConversation(false); // false để không clear active ID nếu không cần thiết ở đây


    if (options?.callApi) {
      try {
        await fetch('/api/auth/logout', { method: 'GET' });
      } catch (e) {
        console.warn("[AuthProvider] Failed to call server logout API.", e);
      }
    }
    if (!options?.preventRedirect) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    console.log("[AuthProvider] Initializing authentication state...");

    const initializeAuth = async () => {
      const token = _getStoredToken();
      const storedLoginStatus = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEYS.LOGIN_STATUS) === 'true';

      if (token && storedLoginStatus) {
        console.log("[AuthProvider] Token found. Verifying with /me endpoint...");
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          });

          if (!isMounted) return;

          if (response.ok) {
            const userData = await response.json() as UserResponse;
            console.log("[AuthProvider] /me verification successful. User:", userData.email);
            // Ở đây, chúng ta đang xử lý đăng nhập/khởi tạo, nên dùng _persistAuthDataToLocalStorage
            // nếu API /me cũng có thể trả về token mới (ít phổ biến)
            // Hoặc chỉ cần cập nhật user và đảm bảo token cũ vẫn hợp lệ
            _persistAuthDataToLocalStorage({ user: userData, token }); // Giả sử token không đổi
            setUserState(userData); // Sử dụng setUserState
            setIsLoggedIn(true);
          } else if (response.status === 401 || response.status === 403) {
            console.warn("[AuthProvider] /me verification failed (401/403). Logging out.");
            await _performLogout({ preventRedirect: true });
          } else {
            console.error(`[AuthProvider] /me verification failed with status: ${response.status}. Logging out.`);
            if (isMounted) setError(`Session check failed (Status: ${response.status})`);
            await _performLogout({ preventRedirect: true });
          }
        } catch (err) {
          if (!isMounted) return;
          console.error("[AuthProvider] Network or fetch error during /me verification:", err);
          if (isMounted) setError("Network error during session verification.");
          await _performLogout({ preventRedirect: true });
        }
      } else {
        console.log("[AuthProvider] No valid token or login status. Ensuring logged out state.");
        if (isLoggedIn || user) {
          await _performLogout({ preventRedirect: true });
        }
      }
      if (isMounted) setIsInitializing(false);
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [_performLogout]); // user không nên là dependency ở đây để tránh vòng lặp

  const signIn = async (credentials: Record<string, string>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, mode: "user" }),
      });
      const data = await response.json();
      if (response.ok && data.user && data.token) {
        _handleAuthSuccess(data as AuthResponse);
      } else {
        setError(data.message || 'Incorrect email or password.');
      }
    } catch (err: any) {
      setError('Login failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem(LOCAL_STORAGE_KEYS.RETURN_URL, currentPath);
    window.location.href = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/google`;
  };

  const processTokenFromOAuth = useCallback(async (token: string, customRedirectPath?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const userData = await response.json();
      if (response.ok && userData) {
        _handleAuthSuccess({ user: userData as UserResponse, token }, customRedirectPath);
      } else {
        setError(userData.message || 'Failed to complete login after OAuth.');
        await _performLogout({ preventRedirect: true });
      }
    } catch (err: any) {
      setError('Network error while completing login.');
      await _performLogout({ preventRedirect: true });
    } finally {
      setIsLoading(false);
    }
  }, [_handleAuthSuccess, _performLogout]);

  const logout = async (options?: { callApi?: boolean }): Promise<void> => {
    setIsLoading(true);
    await _performLogout({ callApi: options?.callApi ?? true });
    setIsLoading(false);
  };

  const getToken = useCallback((): string | null => _getStoredToken(), []); // Bọc trong useCallback

  const contextValue = {
    user, // State user
    isLoggedIn,
    isLoading,
    isInitializing,
    error,
    signIn,
    googleSignIn,
    processTokenFromOAuth,
    logout,
    getToken,
    updateAuthUser, // <<<< TRUYỀN HÀM MỚI VÀO VALUE CỦA PROVIDER >>>>
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

