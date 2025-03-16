'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/src/navigation';
import Dashboard from './Dashboard';
import SettingTab from './SettingTab';
import NotificationsTab from './NotificationsTab';
import FollowedTab from './FollowedTab';
import ProfileTab from './ProfileTab';
import NoteTab from './NoteTab';
import MyConferencesTab from './MyConferencesTab';
import { ConferenceResponse } from '../../../models/response/conference.response';
import Footer from '../utils/Footer';
import { Header } from '../utils/Header';

type Conference = ConferenceResponse;

export default function Setting({ locale }: { locale: string }) {
    const t = useTranslations('');
    const searchParams = useSearchParams();
    const [activePage, setActivePage] = useState<string>('');

    useEffect(() => {
        const tab = searchParams.get('tab');
        let initialPage = 'Profile';
        if (tab === 'profile') {
            initialPage = 'Profile';
        } else if (tab === 'followed') {
            initialPage = 'Followed';
        } else if (tab === 'myconferences') {
            initialPage = 'My Conferences';
        } else if (tab === 'note') {
            initialPage = 'Note';
        } else if (tab === 'notifications') {
            initialPage = 'Notifications';
        } else if (tab === 'setting') {
            initialPage = 'Setting';
        }
        setActivePage(initialPage);

    }, [searchParams]);

    const notifications: any[] = [
        {
            title: 'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
            description: '[UPDATED] Deadline for submission of minisymposium speaker abstracts is changed from 2024/02/15 to 2024/02/15.',
            updatedAt: '2024/06/19 11:41',
            detailsLink: '#',
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

    const exampleConferences: Conference[] = [];

    const renderPage = () => {
        switch (activePage) {
            case 'Setting':
                return <SettingTab />;
            case 'Notifications':
                return <NotificationsTab notifications={notifications} />;
            case 'Followed':
                return <FollowedTab conferences={exampleConferences} />;
            case 'Note':
                return <NoteTab />;
            case 'My Conferences':
                return <MyConferencesTab conferences={exampleConferences} />;
            case 'Profile':
                return <ProfileTab />;
            default:
                return <Dashboard />;
        }
    };

    

    const menuItems = [
        { page: 'Profile', label: t('Profile') },
        { page: 'Followed', label: t('Followed') },
        { page: 'My Conferences', label: t('My Conferences') },
        { page: 'Note', label: t('Note') },
        { page: 'Notifications', label: t('Notifications') },
        { page: 'Setting', label: t('Setting') },
    ];

   

    return (
        <>
            <Header locale={locale} />
            <div className=" justify-center relative">
                <div className="py-8 bg-background w-full"></div>
                <div className="flex">
                    <aside className="flex w-80 fixed h-full">
                        <nav className="w-full">
                            <ul className="w-full">
                                {menuItems.map((item) => {
                                    const tabValue = item.page.toLowerCase().replace(/ /g, '');
                                    return (
                                        <li key={item.page} className="w-full">
                                            <Link
                                                href={{ pathname: "/dashboard", query: { tab: tabValue } }}
                                                className={`flex items-center w-full p-3 hover:bg-button hover:opacity-60 focus:outline-none focus:secondary ${activePage === item.page ? 'bg-button text-button-text hover:bg-secondary' : ''}`}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>

                    <div className=" flex-1 ml-80 min-h-screen">
                        {renderPage()}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}