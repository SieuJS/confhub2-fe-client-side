"use client";

import LoginForm from "./LoginForm";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthApi from '@/src/hooks/auth/useAuthApi'; // Import useAuthApi

const LoginPage= ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const { isLoggedIn, isLoading } = useAuthApi(); // Get isLoading
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect if NOT logged in AND loading is complete
    if (isLoggedIn && !isLoading) {
      router.push(`/${locale}`);
    }
  }, [isLoggedIn, isLoading]); // Add isLoading and locale to dependencies
  const redirectUri = `${window.location.origin}/${locale}/auth/callback`;

  return (
    <>
    {console.log(isLoading)}
    {console.log(isLoggedIn)}
    {!isLoading && !isLoggedIn &&
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <LoginForm redirectUri={redirectUri} />
      </div>
    }
    </>
  );
}

export default LoginPage;