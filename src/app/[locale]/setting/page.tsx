'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Dashboard from '../components/user/Dashboard';
import SettingTab from '../components/user/SettingTab';
import NotificationsTab from '../components/user/NotificationsTab';
import FollowedTab from '../components/user/FollowedTab';
import ProfileTab from '../components/user/ProfileTab';
import NoteTab from '../components/user/NoteTab';
import MyConferencesTab from '../components/user/MyConferencesTab';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import ConferenceResponse

// Replace interface Conference with type Conference = ConferenceResponse
type Conference = ConferenceResponse;

export default function Setting() {
    const t = useTranslations('');
    const [activePage, setActivePage] = useState('dashboard');

    const notifications: any[] = [
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
        {
          title: 'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
          description: '[UPDATED] Conference start from "2024/7/8 to 2024/7/11", location: "Spokane, Washington, U.S", type: "offline".',
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
    // Updated exampleConferences to use ConferenceResponse type
    const exampleConferences: Conference[] = [
      
    ];

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'Setting': return <SettingTab />;
            case 'Notifications': return <NotificationsTab notifications={notifications} />;
            case 'Followed': return <FollowedTab conferences={exampleConferences} />;
            case 'Note': return <NoteTab />;
            case 'My Conferences': return <MyConferencesTab conferences={exampleConferences} />;
            case 'Profile': return <ProfileTab />;
            default: return <Dashboard />;
        }
    };

    const menuItems = [
        { page: 'dashboard', label: t('Dashboard') },
        { page: 'Followed', label: t('Followed') },
        { page: 'My Conferences', label: t('My Conferences') },
        { page: 'Note', label: t('Note') },
        { page: 'Notifications', label: t('Notifications') },
        { page: 'Setting', label: t('Setting') },
        { page: 'Profile', label: t('Profile') },
    ];


    return (
      <div className=" justify-center relative">
        <div className="py-12 bg-background w-full"></div>
          <div className="flex">
            {/* Sidebar Navigation */}
            <aside className="flex w-80 fixed h-full py-2 ">
              <nav className="w-full">
                <ul className="w-full">
                  {menuItems.map((item) => (
                    <li key={item.page} className="w-full">
                      <button
                  className={`flex items-center w-full p-3  hover:bg-button hover:opacity-60 focus:outline-none  focus:secondary ${activePage === item.page ? 'bg-button text-button-text  hover:bg-secondary' : ''}`}
                  onClick={() => setActivePage(item.page)}
                      >
                  {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main Content Area (Right Side - Columns 2 & 3 or 2/3 width on md+) */}
            <div className=" flex-1 ml-80">
              {renderPage()} {/* Render the active page content here */}
            </div>
          </div>
        </div>
    );
}