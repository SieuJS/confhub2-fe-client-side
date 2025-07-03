'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
// Thêm các icon mới
import { X, Sparkles, LayoutGrid, Megaphone, Milestone, Rocket, BookOpen, MessageSquareQuote } from 'lucide-react';
import { useWhatsNewStore } from './store/useWhatsNewStore';
// Thêm link khảo sát
import { CURRENT_VERSION, surveyLinks } from './data/announcementData';
import { WelcomeTab } from './partials/WelcomeTab';
import { NewFeaturesTab } from './partials/NewFeaturesTab';
import { AllFeaturesTab } from './partials/AllFeaturesTab';
import { AnnouncementsTab } from './partials/AnnouncementsTab';
import { RoadmapTab } from './partials/RoadmapTab';
// Import tab mới
import { GuideTab } from './partials/GuideTab';

// Cập nhật mảng tabs
const tabs = [
  { id: 'welcome', label: 'Chào mừng', icon: Sparkles },
  { id: 'new-features', label: 'Tính năng mới', icon: Rocket },
  { id: 'all-features', label: 'Tất cả tính năng', icon: LayoutGrid },
  { id: 'guide', label: 'Hướng dẫn', icon: BookOpen }, // Thêm tab mới
  { id: 'roadmap', label: 'Lộ trình', icon: Milestone },
  { id: 'announcements', label: 'Thông báo', icon: Megaphone },
];

export function WhatsNewModal() {
  const { isOpen, closeModal } = useWhatsNewStore();
  const [activeTab, setActiveTab] = useState('new-features');

  const handleClose = () => {
    localStorage.setItem('gcjh-whats-new-version', CURRENT_VERSION);
    closeModal();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto p-4">
          <Dialog.Content
            className="relative z-50 flex max-h-[90vh] w-full max-w-3xl flex-col border bg-background shadow-lg sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-border p-6 pb-4">
              <Dialog.Title className="text-2xl font-bold leading-none tracking-tight text-text-primary">
                Có gì mới trên GCJH?
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-text-secondary">
                Khám phá các cập nhật, tính năng và thông báo mới nhất. Phiên bản <strong>{CURRENT_VERSION}</strong>
              </Dialog.Description>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 border-b border-border px-2 sm:px-4">
              <div className="flex overflow-x-auto pb-2 scrollbar scrollbar-track-transparent scrollbar-thumb-primary/50 scrollbar-h-1.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center space-x-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-text-secondary hover:bg-background-secondary'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {/* Vùng nội dung chính */}
            {/* Vùng nội dung chính */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar scrollbar-track-background-secondary scrollbar-thumb-primary/50">
              {activeTab === 'welcome' && <WelcomeTab />}
              {activeTab === 'new-features' && <NewFeaturesTab />}
              {activeTab === 'all-features' && <AllFeaturesTab />}
              {activeTab === 'guide' && <GuideTab />}
              {activeTab === 'announcements' && <AnnouncementsTab />}
              {activeTab === 'roadmap' && <RoadmapTab />}
            </div>

            {/* === BẮT ĐẦU: FOOTER KHẢO SÁT ĐÃ THIẾT KẾ LẠI === */}
            <div className="border-t border-border p-2 md:p-4 bg-background-secondary/50 sm:rounded-b-lg">
              <div className="text-center mb-2 md:mb-3">
                <h4 className="font-semibold text-text-primary">Giúp chúng tôi cải thiện GCJH!</h4>
                <p className="text-xs text-text-secondary hidden sm:block">Mỗi phản hồi của bạn đều rất quý giá.</p>
              </div>

              {/* 
              THAY ĐỔI LỚN:
              - Mobile: Dùng grid 2 cột (grid grid-cols-2) với khoảng cách nhỏ (gap-2).
              - Tablet trở lên: Chuyển về flex (md:flex) với khoảng cách lớn hơn (md:gap-3).
            */}
              <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
                {surveyLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Căn giữa trên mobile, căn trên từ tablet. Giảm padding trên mobile (p-2).
                    className="flex-1 flex items-center md:items-start p-2 md:p-3 rounded-lg border border-transparent bg-background/50 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{link.title}</p>
                      {/* Vẫn ẩn mô tả trên mobile */}
                      <p className="text-xs text-text-secondary hidden md:block">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            {/* === KẾT THÚC: FOOTER KHẢO SÁT === */}


            {/* Close Button */}
            <Dialog.Close asChild>
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}