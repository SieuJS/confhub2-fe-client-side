'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import SettingTab from './setting/SettingTab'
import NotificationsTab from './notification/NotificationsTab'
import FollowedTab from './follow/FollowedTab'
import BlacklistTab from './blacklist/BlacklistTab'
import ProfileTab from './profile/ProfileTab'
import NoteTab from './note/NoteTab'
import MyConferencesTab from './myConferences/MyConferencesTab'

// Không cần import Header hay Sidebar ở đây nữa

export default function DashboardPage() { // Không cần nhận props locale nữa vì layout đã xử lý
  const searchParams = useSearchParams()
  const [activePage, setActivePage] = useState<string>('Profile')

  // Logic cập nhật activePage dựa trên searchParams (giữ nguyên)
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

  const renderPage = () => {
    switch (activePage) {
      case 'Setting':
        return <SettingTab />;
      case 'Notifications':
        return <NotificationsTab />;
      case 'Followed':
        return <FollowedTab />;
      case 'Blacklisted':
        return <BlacklistTab />;
      case 'Note':
        return <NoteTab />;
      case 'My Conferences':
        return <MyConferencesTab />;
      case 'Profile':
      default:
        return <ProfileTab />; // Fallback
    }
  };

  // Component này giờ chỉ trả về nội dung của trang
  return (
    <>
      {renderPage()}
    </>
  );
}