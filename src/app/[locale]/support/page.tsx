'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import About from './about'
import Support from './support'
import SupportForm from './supportForm'
import ContactMethods from './ContactMethods'
import FloatingChatbot from '@/src/app/[locale]/floatingchatbot/FloatingChatbot'; // <-- IMPORT MỚI

const FAQ = ({ locale }: { locale: string }) => {
  const t = useTranslations('FAQ')

  return (
    <>
      <Header locale={locale} />
      <About />
      <Support />
      <SupportForm />
      <ContactMethods />
      <Footer />
      <FloatingChatbot /> {/* <-- THÊM CHATBOT NỔI Ở ĐÂY */}

    </>
  )
}

export default FAQ
