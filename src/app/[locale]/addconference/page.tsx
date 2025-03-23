// src/app/[locale]/addconference/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '../utils/Header'  //  Header component
import Footer from '../utils/Footer'      //  Footer component
import ConferenceForm from './ConferenceForm'
import { useLocalStorage } from 'usehooks-ts'
import { useRouter, usePathname } from 'next/navigation';
import { getPathname } from '@/src/navigation';

const AddConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('')
  const router = useRouter();

  const [loginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  );

  useEffect(() => {
    if (!loginStatus) {
      // Redirect to the login page.  Crucially, use `router.push` for client-side
      // navigation, *not* `redirect`.  `redirect` is for server-side redirects
      // and will cause hydration errors here.
      router.push(`/${locale}/auth/login`);
    }
  }, [loginStatus, router, locale]); // Include router and locale in the dependency array

  //  Render a loading state (or nothing) while the redirect is happening.
  //  This prevents the ConferenceForm from flashing before the redirect.
  if (!loginStatus) {
     return <div>Loading...</div>; // Or return null, or a loading spinner, etc.
    //return null;
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
  )
}

export default AddConference