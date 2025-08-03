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
      title: 'Dashboard Admin Features',
      description:
        'Includes how to manage user accounts, manage conferences, crawl conferences and journals data, analyze date, moderate conferences, and more.',
      youtubeUrl: 'https://youtu.be/st-DAnQz-ZY' // Thay bằng URL thật
    },
    {
      id: 'tut-2',
      title: 'Find Conferences and View Details',
      description:
        'Demo how to use the find conferences feature to search for conferences by keywords, categories, and more.',
      youtubeUrl: 'https://youtu.be/dfn_GnzyOh0' // Định dạng youtu.be cũng hoạt động
    },
    {
      id: 'tut-3',
      title:
        'Other features: Chatbot, Visualization, Publish conference, Dashboard User',
      description:
        'Demo how to use the other features of the platform, including the chatbot, data visualization, and user dashboard.',
      youtubeUrl: 'https://youtu.be/B5Xz1tw3Vg8' // Định dạng embed cũng hoạt động
    }
  ]
  return (
    <>
      <About />
      {/* <FeatureTutorials tutorials={sampleTutorials} title='Feature Tutorials' /> */}
      <PolicyPage />
      <Support />
      {/* <SupportForm /> */}
      {/* <ContactMethods /> */}
    </>
  )
}

export default FAQ
