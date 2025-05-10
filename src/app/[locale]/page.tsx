'use client'
import Button from './utils/Button'
import Banner from './home/Banner'
import PopularConferences from './home/PopularConferences'
import { useEffect, useState } from 'react'
import Footer from './utils/Footer'
import ConsumerInsights from './home/ConsumerInsights'
import { Header } from './utils/Header'
import IntroduceVisualization from './home/IntroduceVisualization'
import FeatureComparisonTable from './home/FeatureComparisonTable'
import SuperBannerTree from './home/SuperBannerTree'
import FloatingChatbot from '@/src/app/[locale]/floatingchatbot/FloatingChatbot'; // <-- IMPORT MỚI


export default function HomePage({ locale }: { locale: string }) {
  const [isVisibleButton, setIsVisibleButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        // Adjust 300 to your preferred scroll distance
        setIsVisibleButton(true)
      } else {
        setIsVisibleButton(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // for smooth scrolling
    })
  }

  return (
    <div className=''>
      <Header locale={locale} />
      {/* <SuperBanner /> */}
      <SuperBannerTree />
      <PopularConferences />
      {/* <SubjectAreasJournals
        speed='90s' // You can still customize other props
        imageHeight='h-60'
        imageWidth='w-40'
        innerClasses='space-x-6 py-4'
      /> */}
      <ConsumerInsights />
      <IntroduceVisualization />
      <FeatureComparisonTable />
      <Footer />
      <FloatingChatbot /> {/* <-- THÊM CHATBOT NỔI Ở ĐÂY */}

    </div>
  )
}
