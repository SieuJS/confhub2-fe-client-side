import {
  Sparkles, Bot, Search, User, Bell, LayoutDashboard, Database, Users, Send, Lightbulb, Star // Icon cho các loại khảo sát

} from 'lucide-react';
import { ElementType } from 'react';

// === CẬP NHẬT PHIÊN BẢN Ở ĐÂY KHI CÓ THAY ĐỔI ===
export const CURRENT_VERSION = "1.1.0"; // Ví dụ: Phiên bản giới thiệu Chatbot AI
// Bỏ hằng số SURVEY_FORM_LINK cũ

// === BỔ SUNG CẤU TRÚC DỮ LIỆU CHO LINK KHẢO SÁT ===
export interface SurveyLinkItem {
  icon: ElementType;
  title: string;
  description: string;
  url: string;
}

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

// === BỔ SUNG DỮ LIỆU CHO TAB HƯỚNG DẪN ===

// Định nghĩa cấu trúc cho một mục hướng dẫn
export interface GuideItem {
  title: string;
  guideContent: string; // Nội dung hướng dẫn (hiện tại là placeholder)
}

// Định nghĩa cấu trúc cho một danh mục hướng dẫn
export interface GuideCategory {
  category: string;
  features: GuideItem[];
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


// Dữ liệu cho tab Hướng dẫn (tái sử dụng cấu trúc từ All Features)
export const guideData: GuideCategory[] = [
  {
    category: 'Tìm kiếm & Khám phá',
    features: [
      {
        title: 'Sử dụng Tìm kiếm nâng cao',
        guideContent: 'Đây là hướng dẫn chi tiết cách dùng bộ lọc, từ khóa và các toán tử Boolean (AND, OR, NOT) để tìm kiếm chính xác. Nội dung sẽ được cập nhật sớm.',
      },
      {
        title: 'Khám phá Cơ sở dữ liệu',
        guideContent: 'Đây là hướng dẫn cách duyệt qua cơ sở dữ liệu hội nghị và tạp chí, xem thông tin chi tiết và các chỉ số quan trọng. Nội dung sẽ được cập nhật sớm.',
      },
    ],
  },
  {
    category: 'Cá nhân hóa & Thông báo',
    features: [
      {
        title: 'Thiết lập Hồ sơ cá nhân',
        guideContent: 'Hướng dẫn cách tạo và tùy chỉnh hồ sơ, lưu các tìm kiếm và theo dõi hội nghị yêu thích. Nội dung sẽ được cập nhật sớm.',
      },
      {
        title: 'Tích hợp Lịch và Cảnh báo',
        guideContent: 'Hướng dẫn cách đồng bộ hóa hạn chót với lịch cá nhân (Google Calendar, Outlook) và cách thiết lập hệ thống cảnh báo qua email. Nội dung sẽ được cập nhật sớm.',
      },
    ],
  },
  {
    category: 'Công cụ thông minh',
    features: [
      {
        title: 'Trò chuyện với Trợ lý AI Chatbot',
        guideContent: 'Hướng dẫn các câu lệnh hữu ích, cách dùng giọng nói, tải tệp lên và khai thác tối đa khả năng của Chatbot. Nội dung sẽ được cập nhật sớm.',
      },
      {
        title: 'Sử dụng Dashboard Phân tích',
        guideContent: 'Hướng dẫn cách đọc các biểu đồ, phân tích xu hướng và theo dõi thống kê cá nhân trên dashboard. Nội dung sẽ được cập nhật sớm.',
      },
      {
        title: 'Đóng góp dữ liệu cho cộng đồng',
        guideContent: 'Hướng dẫn quy trình thêm một hội nghị mới vào hệ thống và cách theo dõi trạng thái đóng góp của bạn. Nội dung sẽ được cập nhật sớm.',
      }
    ],
  },
];




// Dữ liệu cho các link khảo sát
export const surveyLinks: SurveyLinkItem[] = [
  {
    icon: Lightbulb,
    title: 'Khảo sát Ý Kiến',
    description: 'Chia sẻ ý kiến, đóng góp, nhu cầu của bạn về hệ thống.',
    url: 'https://forms.gle/DaTqTaPTSCNRkyrz6',
  },
  {
    icon: Star,
    title: 'Khảo sát Trải nghiệm',
    description: 'Đánh giá trải nghiệm của bạn và báo cáo các vấn đề gặp phải.',
    url: 'https://forms.gle/tnktJSqPMdVzpboc6',
  },
];