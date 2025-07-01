// src/app/[locale]/page.tsx Trang chủ

// BƯỚC 1: XÓA BỎ 'use client' HOÀN TOÀN

import dynamic from 'next/dynamic';

// Import các component tĩnh (Server Components hoặc Client Components đã được tách)
import SuperBannerFor from './home/Banner'; // Đổi tên component cho nhất quán
import ConsumerInsights from './home/ConsumerInsights';
import IntroduceVisualization from './home/IntroduceVisualization';
import FeatureComparisonTable from './home/FeatureComparisonTable';

// BƯỚC QUAN TRỌNG: THÊM DÒNG NÀY
// Yêu cầu Next.js cache trang này trong 300 giây (5 phút).
// Con số này có thể tùy chỉnh.
export const revalidate = 300;

// BƯỚC 2: Dynamic import cho FloatingChatbot
// Component này không cần thiết cho lần tải đầu tiên và có thể tải sau.
const DynamicFloatingChatbot = dynamic(
  () => import('@/src/app/[locale]/floatingchatbot/FloatingChatbot'),
  {
    ssr: false, // Chỉ render ở client
    loading: () => null, // Không hiển thị gì trong khi tải
  }
);

// BƯỚC 3: Đây giờ là một Server Component!
// Nó sẽ được render trên server lúc build time (SSG), tạo ra một file HTML tĩnh.
export default function HomePage() {
  return (
    // Không cần truyền `locale` xuống nữa vì các component con sẽ tự xử lý
    // hoặc không cần đến nó.
    <div>
      <SuperBannerFor />
      <ConsumerInsights />
      <IntroduceVisualization />
      <FeatureComparisonTable />
      <DynamicFloatingChatbot />
    </div>
  );
}