// src/app/[locale]/page.tsx
'use client' // Giữ nguyên dòng này nếu toàn bộ trang là Client Component

import dynamic from 'next/dynamic' // Import dynamic

// Import các components khác
import PopularConferences from './home/PopularConferences'
import Footer from './utils/Footer'
import { Header } from './utils/Header'
import IntroduceVisualization from './home/IntroduceVisualization'
import FeatureComparisonTable from './home/FeatureComparisonTable'
import SuperBannerTree from './home/SuperBannerTree'
// <<< Bỏ import FloatingChatbot thông thường ở đây >>>
// --- Dynamic Import ConsumerInsights (đã làm ở bước trước) ---
const DynamicConsumerInsights = dynamic(
  () => import('./home/ConsumerInsights'),
  {
    ssr: false
  }
)
// --- End Dynamic Import ---

// --- Dynamic Import FloatingChatbot ---
// Import FloatingChatbot một cách dynamic với ssr: false
const DynamicFloatingChatbot = dynamic(
  () => import('@/src/app/[locale]/floatingchatbot/FloatingChatbot'),
  {
    ssr: false
    // Tùy chọn: hiển thị gì đó khi component đang tải (chỉ ở client)
    // loading: () => <p>Loading chatbot...</p>,
  }
)
// --- End Dynamic Import ---

export default function HomePage({ locale }: { locale: string }) {
  return (
    <div className=''>
      <Header locale={locale} />
      <SuperBannerTree />
      <PopularConferences />
      <DynamicConsumerInsights /> {/* Sử dụng Dynamic */}
      <IntroduceVisualization />
      <FeatureComparisonTable />
      <Footer />
      <DynamicFloatingChatbot /> {/* Sử dụng Dynamic */}
    </div>
  )
}

// Lưu ý: Metadata và Viewport nên được khai báo trong layout.tsx cha
// hoặc trong một file page.tsx Server Component.
