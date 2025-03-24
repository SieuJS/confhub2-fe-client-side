// src/app/[locale]/UpdateConference/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '../utils/Header' //  Header component
import Footer from '../utils/Footer' //  Footer component
import ConferenceForm from './ConferenceForm'
import { useLocalStorage } from 'usehooks-ts'
import { useRouter, useSearchParams } from 'next/navigation'

const UpdateConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const conferenceId = searchParams.get('id')

  const [loginStatus] = useLocalStorage<string | null>('loginStatus', null)

  useEffect(() => {
    if (!loginStatus) {
      router.push(`/${locale}/auth/login`)
    }
  }, [loginStatus, router, locale])

  if (!loginStatus) {
    return <div>Loading...</div> // Or return null
  }
  if (!conferenceId) {
    return <div>Error: Conference ID is missing.</div> // Handle missing ID
  }

  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>
        <h1 className='mb-4 text-2xl font-bold'>{t('Update_Conference')}</h1>
        {/* Pass the conferenceId to ConferenceForm */}
        <ConferenceForm locale={locale} conferenceId={conferenceId} />
      </div>
      <Footer />
    </>
  )
}

export default UpdateConference
