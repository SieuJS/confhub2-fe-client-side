// src/app/[locale]/support/page.tsx

'use client'

import About from './about'
import Support from './support'
// import SupportForm from './supportForm'
// import ContactMethods from './ContactMethods'
import PolicyPage from './policy'
import FeatureTutorials from './FeatureTutorials'

const FAQ = ({ params: { locale } }: { params: { locale: string } }) => {
  const sampleTutorials = [
    {
      id: 'tut-1',
      title: 'Dashboard admin features',
      description:
        'Includes how to manage user accounts, manage conferences, crawl conferences and journals data, analyze date, moderate conferences, and more.',
      youtubeUrl: 'https://youtu.be/R4hw0Kd3frU' // Thay bằng URL thật
    },
    {
      id: 'tut-2',
      title: 'Chatbot features',
      description:
        'Demo how to use the chatbot to get answers to your questions about conferences.',
      youtubeUrl: 'https://youtu.be/-c3DDqzTBLo' // Định dạng youtu.be cũng hoạt động
    },
    {
      id: 'tut-3',
      title: 'Publish conference feature',
      description:
        'Demo how to publish a conference, including setting up the conference details, managing submissions, and more.',
      youtubeUrl: 'https://youtu.be/JFrMYOIhzRU' // Định dạng embed cũng hoạt động
    },
    {
      id: 'tut-4',
      title: 'Find conferences feature',
      description:
        'Demo how to use the find conferences feature to search for conferences by keywords, categories, and more.',
      youtubeUrl: 'https://youtu.be/elfUCmlHJjI'
    },
    {
      id: 'tut-5',
      title: 'Sign up and login features',
      description:
        'Demo how to sign up for an account and log in to the platform.',
      youtubeUrl: 'https://youtu.be/DJcZmTq4sz4'
    }
  ]
  return (
    <>
      <About />
      <PolicyPage />
      <FeatureTutorials tutorials={sampleTutorials} title='Feature Tutorials' />
      <Support />
      {/* <SupportForm /> */}
      {/* <ContactMethods /> */}
    </>
  )
}

export default FAQ
