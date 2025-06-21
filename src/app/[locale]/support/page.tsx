// src/app/[locale]/support/page.tsx

'use client'

import About from './about'
import Support from './support'
// import SupportForm from './supportForm'
// import ContactMethods from './ContactMethods'
import PolicyPage from './policy'

const FAQ = ({ params: { locale } }: { params: { locale: string } }) => {
  return (
    <>
      <About />
      <PolicyPage />
      <Support />
      {/* <SupportForm /> */}
      {/* <ContactMethods /> */}
    </>
  )
}

export default FAQ
