// src/app/[locale]/support/page.tsx

'use client'

import React from 'react'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import About from './about'
import Support from './support'
import SupportForm from './supportForm'
import ContactMethods from './ContactMethods'

const FAQ = ({ locale }: { locale: string }) => {
  return (
    <>
      <Header locale={locale} />
      <About />
      <Support />
      {/* <SupportForm /> */}
      {/* <ContactMethods /> */}
      <Footer />
    </>
  )
}

export default FAQ
