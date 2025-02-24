"use client";

import React, { useState } from 'react';

import { useTranslations } from 'next-intl'
import SearchSection from '../components/SearchSection'
import Image from 'next/image';
import Dashboard from '../components/Dashboard';
import SettingTab from '../components/SettingTab';
import NotificationsTab from '../components/NotificationsTab';
import FollowedTab from '../components/FollowedTab';
import NoteTab from '../components/NoteTab';
import MyConferencesTab from '../components/MyConferencesTab';

interface Conference {
  id: number;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  rank: string;
  averageScore: number;
  topics: string[];
  type: 'online' | 'offline' | 'hybrid';

}

export default function Setting() {
  const t = useTranslations('')
  const [activePage, setActivePage] = useState('dashboard'); // Khởi tạo state

  const notifications = [
    {
      title: 'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description: '[UPDATED] Deadline for submission of minisymposium speaker abstracts is changed from 2024/02/15 to 2024/02/15.',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#', // Replace with the actual link
    },
    {
      title: 'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description: '[UPDATED] Deadline for submission of minisymposium proposals is changed from 2024/02/15 to 2024/02/15.',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#',
    },
    {
      title: 'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description: '[UPDATED] Conference start from "2024/7/8 to 2024/7/11", location: "Spokane, Washington, U.S", type: "offline".',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#',
    },
  ];

  const exampleConferences: Conference[] = [
    {
      id: 1,
      name: 'International Conference on Machine Learning',
      shortName: 'ICML',
      startDate: '2024-07-22',
      endDate: '2024-07-26',
      location: 'Vienna, Austria',
      imageUrl: '/conference_image.png', // Replace with real URL
      rank: 'A*',
      averageScore: 4.8,
      topics: ['Machine Learning', 'Deep Learning', 'AI'],
      type: 'offline',
    },
    {
      id: 2,
      name: 'Conference on Neural Information Processing Systems',
      shortName: 'NeurIPS',
      startDate: '2024-12-08',
      endDate: '2024-12-14',
      location: 'Vancouver, Canada',
      imageUrl: '/conference_image.png', // Replace with real URL
      rank: 'A*',
      averageScore: 4.9,
      topics: ['Neural Networks', 'Computer Vision', 'Natural Language Processing'],
      type: 'hybrid',
    },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'Setting':
        return <SettingTab />;
      case 'Notifications':
        return <NotificationsTab notifications={notifications} />;
      case 'Followed':
        return <FollowedTab conferences={exampleConferences} />;
      case 'Note':
        return <NoteTab />;
      case 'My Conferences':
        return <MyConferencesTab conferences={exampleConferences}/>;
      default:
        return <Dashboard />;
    }
  };
  

  return (
    <div className='px-10 py-10 text-center text-2xl'>
      

      
      <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        {/* ... (Sidebar code, similar to Dashboard) */}
        <nav className="mt-6">
          <ul>
            <li
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                activePage === 'dashboard' ? 'bg-green-400 text-white' : ''
              }`}
              onClick={() => setActivePage('dashboard')}
            >
              Dashboard
            </li>
            <li
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                activePage === 'Followed' ? 'bg-green-400 text-white' : ''
              }`}
              onClick={() => setActivePage('Followed')}
            >
              Followed
            </li>
            <li
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                activePage === 'My Conferences' ? 'bg-green-400 text-white' : ''
              }`}
              onClick={() => setActivePage('My Conferences')}
            >
              My Conferences
            </li>
            <li
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                activePage === 'Note' ? 'bg-green-400 text-white' : ''
              }`}
              onClick={() => setActivePage('Note')}
            >
              Note
            </li>
            <li
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                activePage === 'Notifications' ? 'bg-green-400 text-white' : ''
              }`}
              onClick={() => setActivePage('Notifications')}
            >
              Notifications
            </li>
            <li
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                activePage === 'Setting' ? 'bg-green-400 text-white' : ''
              }`}
              onClick={() => setActivePage('Setting')}
            >
              Setting
            </li>
            {/* ... other menu items */}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">{renderPage()}</div>
    </div>
    </div>
  )
}
