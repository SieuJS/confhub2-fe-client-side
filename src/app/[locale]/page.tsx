'use client'
import PopularConferences from './home/PopularConferences'
import Footer from './utils/Footer'
import ConsumerInsights from './home/ConsumerInsights'
import { Header } from './utils/Header'
import IntroduceVisualization from './home/IntroduceVisualization'
import FeatureComparisonTable from './home/FeatureComparisonTable'
import SuperBannerTree from './home/SuperBannerTree'
import FloatingChatbot from '@/src/app/[locale]/floatingchatbot/FloatingChatbot'

export default function HomePage({ locale }: { locale: string }) {
  return (
    <div className=''>
      <Header locale={locale} />
      <SuperBannerTree />
      <PopularConferences />
      <ConsumerInsights />
      <IntroduceVisualization />
      <FeatureComparisonTable />
      <Footer />
      <FloatingChatbot />
    </div>
  )
}
