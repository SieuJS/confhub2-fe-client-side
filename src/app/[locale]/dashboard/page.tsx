'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext' // BƯỚC 1: IMPORT useAuth
import { Loader2 } from 'lucide-react' // BƯỚC 1: IMPORT Loader2

// Import các component Tab của bạn
import SettingTab from './setting/SettingTab'
import NotificationsTab from './notification/NotificationsTab'
import FollowedTab from './follow/FollowedTab'
import BlacklistTab from './blacklist/BlacklistTab'
import ProfileTab from './profile/ProfileTab'
import NoteTab from './note/NoteTab'
import MyConferencesTab from './myConferences/MyConferencesTab'

// BƯỚC 2: TẠO COMPONENT LOADING DÙNG CHUNG
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-500">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    <p className="mt-4 text-lg">{message}</p>
  </div>
);

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const t = useTranslations('') // Khởi tạo t để dùng trong loading
  const [activePage, setActivePage] = useState<string>('Profile')

  // BƯỚC 3: LẤY TRẠNG THÁI isInitializing TỪ AUTH CONTEXT
  const { isInitializing } = useAuth();

  useEffect(() => {
    const tab = searchParams.get('tab');
    let initialPage = 'Profile'; // Default
    if (tab === 'followed') initialPage = 'Followed';
    else if (tab === 'myconferences') initialPage = 'My Conferences';
    else if (tab === 'note') initialPage = 'Note';
    else if (tab === 'notifications') initialPage = 'Notifications';
    else if (tab === 'blacklisted') initialPage = 'Blacklisted';
    else if (tab === 'setting') initialPage = 'Setting';
    else if (tab === 'profile') initialPage = 'Profile';

    setActivePage(initialPage);
  }, [searchParams]);

  // BƯỚC 4: THÊM LOGIC HIỂN THỊ LOADING KHI isInitializing LÀ TRUE
  if (isInitializing) {
    return (
      // Đặt spinner vào một container để nó căn giữa trong khu vực nội dung
      <div className='container mx-auto p-4'>
        <LoadingSpinner message={t('MyConferences.Loading_your_profile')} />
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Setting':
        return <SettingTab />;
      case 'Notifications':
        return <NotificationsTab />;
      case 'Followed':
        return <FollowedTab />; // FollowedTab giờ sẽ được render sau khi isInitializing là false
      case 'Blacklisted':
        return <BlacklistTab />;
      case 'Note':
        return <NoteTab />;
      case 'My Conferences':
        return <MyConferencesTab />;
      case 'Profile':
      default:
        return <ProfileTab />;
    }
  };

  // Khi isInitializing là false, render nội dung trang như bình thường
  return (
    <>
      {renderPage()}
    </>
  );
}