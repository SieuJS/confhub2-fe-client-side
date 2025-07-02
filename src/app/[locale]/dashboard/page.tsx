// src/app/[locale]/dashboard/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

// Import các component Tab
import SettingTab from './setting/SettingTab'
import NotificationsTab from './notification/NotificationsTab'
import FollowedTab from './follow/FollowedTab'
import BlacklistTab from './blacklist/BlacklistTab'
import ProfileTab from './profile/ProfileTab'
import NoteTab from './note/NoteTab'
import MyConferencesTab from './myConferences/MyConferencesTab'

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-500">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    <p className="mt-4 text-lg">{message}</p>
  </div>
);

const TABS = [
  { name: 'Profile', component: <ProfileTab /> },
  { name: 'Followed', component: <FollowedTab /> },
  { name: 'My Conferences', component: <MyConferencesTab /> },
  { name: 'Note', component: <NoteTab /> },
  { name: 'Notifications', component: <NotificationsTab /> },
  { name: 'Blacklisted', component: <BlacklistTab /> },
  { name: 'Setting', component: <SettingTab /> },
];

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const t = useTranslations('')
  const [activePage, setActivePage] = useState<string>('Profile')
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

  if (isInitializing) {
    return (
      <div className='container mx-auto p-4'>
        <LoadingSpinner message={t('MyConferences.Loading_your_profile')} />
      </div>
    );
  }

    return (
    // Container này chiếm toàn bộ chiều cao được cấp bởi layout cha.
    <div className="h-full">
      {TABS.map(tab => (
        // Tab đang hoạt động cũng chiếm toàn bộ chiều cao, truyền nó xuống component con.
        <div key={tab.name} className={activePage === tab.name ? 'block h-full' : 'hidden'}>
          {tab.component}
        </div>
      ))}
    </div>
  );
}