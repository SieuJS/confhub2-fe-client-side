// src/hooks/useAuthApi.ts
import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  firstName: string; // Sửa thành firstName
  lastName: string;  // Sửa thành lastName
  email: string;
}

interface AuthApiResult {
  signIn: (credentials: Record<string, string>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  user: User | null; // Thêm user vào đây để component có thể truy cập
}

const useAuthApi = (): AuthApiResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>('loginStatus', null);
  const [user, setUser] = useLocalStorage<User | null>('user', null);

  const signIn = async (credentials: Record<string, string>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginStatus('true');
        setUser({
          id: data.user.id,
          firstName: data.user.firstName, // Sửa thành firstName
          lastName: data.user.lastName,  // Sửa thành lastName
          email: data.user.email,
        });

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

    const signInWithGoogle = async (): Promise<void> => {
        try {
            window.location.href = 'http://localhost:3000/api/v1/auth/google';
        } catch (error) {
            console.error('Google login error:', error);
            setError('Unable to sign in with Google. Please try again.');
        }
    };

  return { signIn, signInWithGoogle, isLoading, error, user };
};

export default useAuthApi;