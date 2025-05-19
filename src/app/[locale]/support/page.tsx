// src/app/[locale]/support/page.tsx

'use client'

import React from 'react'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import About from './about'
import Support from './support'
import SupportForm from './supportForm'
import ContactMethods from './ContactMethods'
import FloatingChatbot from '@/src/app/[locale]/floatingchatbot/FloatingChatbot' // <-- IMPORT MỚI

const FAQ = ({ locale }: { locale: string }) => {
  return (
    <>
      <Header locale={locale} />
      <About />
      <Support />
      {/* <SupportForm /> */}
      {/* <ContactMethods /> */}
      <Footer />
      <FloatingChatbot /> {/* <-- THÊM CHATBOT NỔI Ở ĐÂY */}
    </>
  )
}

export default FAQ
