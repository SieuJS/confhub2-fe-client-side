// src/hooks/useAuthApi.ts
import { useState, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter, usePathname } from 'next/navigation';
import { UserResponse } from '@/src/models/response/user.response';

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
    const pathname = usePathname();
    const [loginStatus, setLoginStatus] = useLocalStorage<string | null>('loginStatus', null);
    const [user, setUser] = useLocalStorage<UserResponse | null>('user', null);

    useEffect(() => {
        const cookieUser = document.cookie.split('; ').find(row => row.startsWith('user='))?.split('=')[1];
        const cookieLoginStatus = document.cookie.split('; ').find(row => row.startsWith('loginStatus='))?.split('=')[1];
        console.log(cookieUser)
        let userNeedsUpdate = false;

        if (cookieUser) {
            try {
                // Decode the URL-encoded cookie value
                const decodedCookieUser = decodeURIComponent(cookieUser);
                const parsedCookieUser = JSON.parse(decodedCookieUser);

                if (JSON.stringify(user) !== JSON.stringify(parsedCookieUser)) {
                    userNeedsUpdate = true;
                }
            } catch (e) {
                console.error("[Client - useAuthApi] Error parsing user cookie", e);
                document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }

        if (cookieLoginStatus && loginStatus !== cookieLoginStatus) {
            setLoginStatus(cookieLoginStatus);
            console.log("[Client - useAuthApi] Login status synced from cookie:", cookieLoginStatus);
        }

        if (userNeedsUpdate) {
            try{
                const decodedCookieUser = decodeURIComponent(cookieUser!); // Decode here too
                const parsedUser = JSON.parse(decodedCookieUser);
                setUser(parsedUser);
                 console.log("[Client - useAuthApi] User synced from cookie:", parsedUser);
            }catch (e) {
                console.error("[Client - useAuthApi] Error parsing user cookie", e);
                document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }
    }, [user, loginStatus, setUser, setLoginStatus]);

    const signIn = async (credentials: Record<string, string>): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signin`, { // Gọi backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                setLoginStatus('true');
                setUser(data.user);

                const localePrefix = pathname.split('/')[1];
                const pathWithLocale = `/${localePrefix}`;
                router.push(pathWithLocale);
            } else {
                setError(data.message || 'Incorrect email or password');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Username or password is incorrect');
        } finally {
            setIsLoading(false);
        }
    };

    const googleSignIn = async () => {
        console.log("[Client - useAuthApi] Redirecting to /api/auth/google"); // Log 1
        window.location.href = `/api/auth/google`;
    };

    return { signIn, isLoading, error, user, googleSignIn };
};

export default useAuthApi;