import {
  Sparkles, Bot, Search, User, Bell, LayoutDashboard, Database, Users, Send
} from 'lucide-react';
import { ElementType } from 'react';

// === CẬP NHẬT PHIÊN BẢN Ở ĐÂY KHI CÓ THAY ĐỔI ===
export const CURRENT_VERSION = "1.1.0"; // Ví dụ: Phiên bản giới thiệu Chatbot AI

// Định nghĩa cấu trúc cho một mục tính năng
export interface FeatureItem {
  icon: ElementType;
  title: string;
  description: string;
  isNew?: boolean; // Đánh dấu tính năng mới nổi bật
}

// Định nghĩa cấu trúc cho một thông báo
export interface AnnouncementItem {
  date: string;
  title: string;
  content: string;
}

// Định nghĩa cấu trúc cho một mục trong lộ trình
export interface RoadmapItem {
  icon: ElementType;
  title: string;
  description: string;
  status: 'Sắp ra mắt' | 'Đang phát triển' | 'Đã hoàn thành';
}

// Dữ liệu cho tab Chào mừng
export const welcomeData = {
  title: `Chào mừng đến với Global Conference & Journal Hub (GCJH)!`,
  description: `GCJH là cổng thông tin học thuật toàn diện, giúp bạn kết nối với thế giới tri thức. Khám phá các hội nghị, tạp chí và những công cụ mạnh mẽ được thiết kế dành riêng cho các nhà nghiên cứu như bạn.`
};

// Dữ liệu cho tab Tính năng mới (của phiên bản hiện tại)
export const newFeaturesData: FeatureItem[] = [
  {
    icon: Bot,
    title: 'Trợ lý ảo AI Chatbot đa năng',
    description: 'Trợ thủ đắc lực của bạn! Chatbot có thể tìm kiếm, quản lý hội nghị, điều hướng, phân tích tệp, hỗ trợ đa ngôn ngữ và nhiều hơn nữa.',
    isNew: true,
  },
  {
    icon: LayoutDashboard,
    title: 'Trực quan hóa & Phân tích dữ liệu',
    description: 'Dashboard cá nhân giúp bạn có cái nhìn tổng quan về các hội nghị và phân tích lĩnh vực nghiên cứu một cách trực quan.',
    isNew: true,
  },
  {
    icon: Database,
    title: 'Đóng góp dữ liệu',
    description: 'Chung tay xây dựng cơ sở dữ liệu! Giờ đây bạn có thể thêm thông tin hội nghị mới và theo dõi trạng thái đóng góp của mình.',
  },
];

// Dữ liệu cho tab Tất cả tính năng (được phân loại)
export const allFeaturesData: { category: string; features: FeatureItem[] }[] = [
  {
    category: 'Tìm kiếm & Khám phá',
    features: [
      {
        icon: Search,
        title: 'Cơ sở dữ liệu & Tìm kiếm nâng cao',
        description: 'Truy cập hàng ngàn hội nghị và tạp chí. Sử dụng bộ lọc mạnh mẽ và toán tử Boolean (AND, OR, NOT) để có kết quả chính xác nhất.',
      },
    ],
  },
  {
    category: 'Cá nhân hóa & Thông báo',
    features: [
      {
        icon: User,
        title: 'Hồ sơ cá nhân hóa',
        description: 'Lưu tìm kiếm, theo dõi các hội nghị/tạp chí yêu thích và nhận thông báo cập nhật.',
      },
      // {
      //   icon: CalendarClock,
      //   title: 'Tích hợp lịch cá nhân',
      //   description: 'Thêm các hạn chót quan trọng (nộp bài, ngày diễn ra) trực tiếp vào Google Calendar, Outlook của bạn.',
      // },
      {
        icon: Bell,
        title: 'Hệ thống thông báo (Alerts)',
        description: 'Thiết lập cảnh báo để không bao giờ bỏ lỡ hội nghị hoặc tạp chí mới phù hợp với lĩnh vực của bạn.',
      },
    ],
  },
  {
    category: 'Công cụ thông minh',
    features: [
      ...newFeaturesData, // Tái sử dụng dữ liệu từ tính năng mới
    ],
  },
];

// Dữ liệu cho tab Thông báo
export const announcementsData: AnnouncementItem[] = [
    // {
    //     date: '20/07/2024',
    //     title: 'Bảo trì hệ thống định kỳ',
    //     content: 'Hệ thống sẽ tạm thời gián đoạn để bảo trì và nâng cấp vào lúc 02:00 AM - 03:00 AM ngày 25/07/2024 (giờ Việt Nam). Cảm ơn sự thông cảm của bạn.',
    // },
    
    // Thêm các thông báo khác ở đây
];


// Dữ liệu cho tab Lộ trình phát triển
export const roadmapData: RoadmapItem[] = [
  {
    icon: Users,
    title: 'Diễn đàn cộng đồng',
    description: 'Nơi kết nối, thảo luận và chia sẻ kiến thức với các học giả khác trên toàn cầu.',
    status: 'Đang phát triển',
  },
  // === BẮT ĐẦU THAY ĐỔI ===
  {
    icon: Send, // Thay GitFork bằng Send (hoặc FileUp)
    title: 'Hệ thống Hỗ trợ Nộp bài Hội nghị',
    description: 'Công cụ giúp bạn quản lý và theo dõi quá trình nộp bài báo khoa học tới các hội nghị, từ việc chuẩn bị bản thảo đến khi nhận được phản hồi.',
    status: 'Đang phát triển',
  },
  // === KẾT THÚC THAY ĐỔI ===
    // Thêm các mục khác trong lộ trình ở đây
];