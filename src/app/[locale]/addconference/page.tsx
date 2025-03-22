// src/app/[locale]/addconference/page.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import ConferenceForm from './ConferenceForm'

const AddConference = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('')

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
