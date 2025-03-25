// src/hooks/useAuthApi.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserResponse } from '@/src/models/response/user.response';
import { useSearchParams } from 'next/navigation';

interface AuthApiResult {
  signIn: (credentials: Record<string, string>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  user: UserResponse | null;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const useAuthApi = (): AuthApiResult => {
  const [isLoading, setIsLoading] = useState(true); // Initialize to true
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchParams = useSearchParams();

  // Helper function to get cookies
  const getCookieValue = (name: string) => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  };

  // Load user and login status (from localStorage OR cookies)
  const loadFromStorage = useCallback(() => {
    console.log("[useAuthApi - loadFromStorage] Loading from storage...");

    // Try localStorage FIRST
    const storedUser = localStorage.getItem('user');
    const storedLoginStatus = localStorage.getItem('loginStatus');

    if (storedLoginStatus === 'true' && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
        console.log("[useAuthApi - loadFromStorage] User loaded from localStorage:", parsedUser);
        return; // Important: Exit early if loaded from localStorage
      } catch (e) {
        console.error("[useAuthApi - loadFromStorage] Error parsing user from localStorage", e);
        localStorage.removeItem('user');
        localStorage.removeItem('loginStatus');
      }
    }

    // Fallback to cookies if not found in localStorage
    const cookieUser = getCookieValue('user');
    const cookieLoginStatus = getCookieValue('loginStatus');

    if (cookieLoginStatus === 'true' && cookieUser) {
      try {
        const parsedUser = JSON.parse(cookieUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
        console.log("[useAuthApi - loadFromStorage] User loaded from cookie:", parsedUser);

        // **Sync to localStorage**
        localStorage.setItem('user', JSON.stringify(parsedUser));
        localStorage.setItem('loginStatus', 'true');

      } catch (e) {
        console.error("[useAuthApi - loadFromStorage] Error parsing user cookie", e);
        document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "loginStatus=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
      console.log("[useAuthApi - loadFromStorage] No valid user/loginStatus found.");
    }
  }, []);

    useEffect(() => {
        loadFromStorage(); // Initial load

        const handleCookieChange = () => {
          console.log("[useAuthApi - handleCookieChange] Cookie changed, reloading...");
          loadFromStorage(); // Reload from storage (localStorage OR cookies)
        };

        window.addEventListener('focus', loadFromStorage);
        document.addEventListener('cookiechange', handleCookieChange);

        return () => {
          window.removeEventListener('focus', loadFromStorage);
          document.removeEventListener('cookiechange', handleCookieChange);
        };
    }, [loadFromStorage]);

  // Set loading to false after initial load
    useEffect(() => {
        setIsLoading(false)
    }, [user, isLoggedIn])


  // Update localStorage whenever user or isLoggedIn changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }

        if (isLoggedIn) {
            localStorage.setItem('loginStatus', 'true');
        } else {
            localStorage.removeItem('loginStatus');
        }
    }, [user, isLoggedIn]);


  const signIn = async (credentials: Record<string, string>): Promise<void> => {
        setIsLoading(true);
        setError(null);
        console.log("[useAuthApi - signIn] Starting sign-in process...");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            console.log("[useAuthApi - signIn] Server response:", data);

            if (response.ok) {
                console.log("[useAuthApi - signIn] Sign-in successful. Setting loginStatus and user...");
                // Set cookies directly (for immediate effect)
                document.cookie = `loginStatus=true; path=/;`;
                document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/;`;

              // Set localStorage (now handled in the useEffect)

                // Get returnUrl *right before* redirect, not from initial state
                const currentReturnUrl = localStorage.getItem('returnUrl');
                let redirectPath = currentReturnUrl || '/';
                console.log("[useAuthApi - signIn] Initial redirectPath:", redirectPath);

                try {
                    const parsedUrl = new URL(redirectPath, window.location.origin);
                    redirectPath = parsedUrl.pathname + parsedUrl.search;
                    console.log("[useAuthApi - signIn] Parsed redirectPath:", redirectPath);
                } catch (e) {
                    console.error("[useAuthApi - signIn] Invalid return URL:", currentReturnUrl, e);
                }

                // Clear returnUrl *right after* using it, using localStorage directly
                localStorage.removeItem('returnUrl');
                console.log("[useAuthApi - signIn] Redirecting to:", redirectPath);
                router.push(redirectPath);
            } else {
                console.log("[useAuthApi - signIn] Sign-in failed.");
                setError(data.message || 'Incorrect email or password');
            }
        } catch (err: any) {
            console.error("[useAuthApi - signIn] Login error:", err);
            setError('Username or password is incorrect');
        } finally {
            setIsLoading(false);
            console.log("[useAuthApi - signIn] Sign-in process complete.");
        }
    };


  const googleSignIn = async () => {
    const fullUrl = `${window.location.pathname}?${searchParams.toString()}`;
    console.log("[useAuthApi - googleSignIn] Storing return URL:", fullUrl);
    localStorage.setItem('returnUrl', fullUrl); // Keep this for return URL
    console.log("[useAuthApi - googleSignIn] Redirecting to /api/auth/google");
    window.location.href = `/api/auth/google`;
  };

  const logout = useCallback(async () => {
    console.log("[useAuthApi - logout] Initiating logout...");
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout');
      setUser(null);
      setIsLoggedIn(false);
      // localStorage clearing now handled in the useEffect
      console.log("[useAuthApi - logout] Logout successful.");
      router.push("/");
    } catch (error) {
      console.error("[useAuthApi - logout] Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { signIn, isLoading, error, user, googleSignIn, logout, isLoggedIn };
};

export default useAuthApi;