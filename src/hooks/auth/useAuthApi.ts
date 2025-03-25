// src/hooks/useAuthApi.ts
import { useState, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter, usePathname } from 'next/navigation';
import { UserResponse } from '@/src/models/response/user.response';
import { useSearchParams } from 'next/navigation';

interface AuthApiResult {
    signIn: (credentials: Record<string, string>) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    user: UserResponse | null;
    googleSignIn: () => Promise<void>;
}

const useAuthApi = (): AuthApiResult => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [loginStatus, setLoginStatus] = useLocalStorage<string | null>('loginStatus', null);
    const [user, setUser] = useLocalStorage<UserResponse | null>('user', null);
    const searchParams = useSearchParams();


    useEffect(() => {
        console.log("[useAuthApi - useEffect] Checking cookies...");
        const cookieUser = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
        const cookieLoginStatus = document.cookie.split('; ').find(row => row.startsWith('loginStatus='))?.split('=')[1];

        let userNeedsUpdate = false;

        if (cookieUser) {
            try {
                console.log("[useAuthApi - useEffect] Found user cookie:", cookieUser);
                const decodedCookieUser = decodeURIComponent(cookieUser);
                const parsedCookieUser = JSON.parse(decodedCookieUser);

                if (JSON.stringify(user) !== JSON.stringify(parsedCookieUser)) {
                    userNeedsUpdate = true;
                }
            } catch (e) {
                console.error("[useAuthApi - useEffect] Error parsing user cookie", e);
                document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }

        if (cookieLoginStatus) {
            console.log("[useAuthApi - useEffect] Found loginStatus cookie:", cookieLoginStatus);
            if (loginStatus !== cookieLoginStatus) {
                setLoginStatus(cookieLoginStatus);
                console.log("[useAuthApi - useEffect] Login status synced from cookie:", cookieLoginStatus);
            }
        } else {
            console.log("[useAuthApi - useEffect] No loginStatus cookie found.");
        }

        if (userNeedsUpdate) {
            try {
                console.log("[useAuthApi - useEffect] User needs update.  Fetching from cookie...");
                const decodedCookieUser = decodeURIComponent(cookieUser!);
                const parsedUser = JSON.parse(decodedCookieUser);
                setUser(parsedUser);
                console.log("[useAuthApi - useEffect] User synced from cookie:", parsedUser);
            }

            catch (e) {
                console.error("[useAuthApi - useEffect] Error parsing user cookie", e);
                document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        } else {
            console.log("[useAuthApi - useEffect] User is up to date.");
        }
    }, [user, loginStatus, setUser, setLoginStatus]);


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
                setLoginStatus('true');
                setUser(data.user);

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
        localStorage.setItem('returnUrl', fullUrl);
        console.log("[useAuthApi - googleSignIn] Redirecting to /api/auth/google");
        window.location.href = `/api/auth/google`;
    };

    return { signIn, isLoading, error, user, googleSignIn };
};


export default useAuthApi;