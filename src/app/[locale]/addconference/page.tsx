// src/app/[locale]/addconference/page.tsx
'use client'

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '../utils/Header';  // Header component
import Footer from '../utils/Footer';      // Footer component
import ConferenceForm from './ConferenceForm';
import { useRouter } from 'next/navigation';
import useAuthApi from '@/src/hooks/auth/useAuthApi'; // Import useAuthApi

const AddConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('');
  const router = useRouter();

  // Use useAuthApi for authentication status
  const { isLoggedIn } = useAuthApi();

  useEffect(() => {
    if (!isLoggedIn) {
      // Redirect to the login page using router.push
      router.push(`/${locale}/auth/login`);
    }
  }, [isLoggedIn, router, locale]); // Depend on isLoggedIn, router, and locale

  // Render a loading state while checking authentication
  if (!isLoggedIn) {
    return <div>Loading...</div>; // Or a more elaborate loading indicator
  }

  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>
        <h1 className='mb-4 text-2xl font-bold'>{t('Add_New_Conference')}</h1>
        <ConferenceForm locale={locale} />
      </div>
      <Footer />
    </>
  );
};

export default AddConference;