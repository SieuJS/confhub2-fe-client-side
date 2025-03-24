// src/app/[locale]/UpdateConference/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '../utils/Header' //  Header component
import Footer from '../utils/Footer' //  Footer component
import ConferenceForm from './ConferenceForm'
import { useLocalStorage } from 'usehooks-ts'
import { useRouter } from 'next/navigation'

const UpdateConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('')
  const router = useRouter()

  const [loginStatus] = useLocalStorage<string | null>('loginStatus', null)

  useEffect(() => {
    if (!loginStatus) {
      router.push(`/${locale}/auth/login`)
    }
  }, [loginStatus, router, locale]) // Include router and locale in the dependency array

  if (!loginStatus) {
    return <div>Loading...</div> // Or return null, or a loading spinner, etc.
    //return null;
  }

  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>
        <h1 className='mb-4 text-2xl font-bold'>{t('Update_Conference')}</h1>
        <ConferenceForm locale={locale} />
      </div>
      <Footer />
    </>
  )
}

export default UpdateConference
