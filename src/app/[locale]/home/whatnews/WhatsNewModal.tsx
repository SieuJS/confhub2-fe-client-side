'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, LayoutGrid, Megaphone, Milestone, Rocket } from 'lucide-react';
import { useWhatsNewStore } from './store/useWhatsNewStore';
import { CURRENT_VERSION } from './data/announcementData';
import { WelcomeTab } from './partials/WelcomeTab';
import { NewFeaturesTab } from './partials/NewFeaturesTab';
import { AllFeaturesTab } from './partials/AllFeaturesTab';
import { AnnouncementsTab } from './partials/AnnouncementsTab';
import { RoadmapTab } from './partials/RoadmapTab';

const tabs = [
  { id: 'welcome', label: 'Chào mừng', icon: Sparkles },
  { id: 'new-features', label: 'Tính năng mới', icon: Rocket },
  { id: 'all-features', label: 'Tất cả tính năng', icon: LayoutGrid },
  { id: 'announcements', label: 'Thông báo', icon: Megaphone },
  { id: 'roadmap', label: 'Lộ trình', icon: Milestone },
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
                    className={`flex-shrink-0 flex items-center space-x-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
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
            {/* Đã điều chỉnh style thanh cuộn dọc để khớp với thanh cuộn ngang */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar scrollbar-track-transparent scrollbar-thumb-primary/50 scrollbar-w-1.5">
              {activeTab === 'welcome' && <WelcomeTab />}
              {activeTab === 'new-features' && <NewFeaturesTab />}
              {activeTab === 'all-features' && <AllFeaturesTab />}
              {activeTab === 'announcements' && <AnnouncementsTab />}
              {activeTab === 'roadmap' && <RoadmapTab />}
            </div>

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