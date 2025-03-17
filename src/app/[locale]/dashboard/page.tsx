'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/src/navigation'
import SettingTab from './SettingTab'
import NotificationsTab from './NotificationsTab'
import FollowedTab from './FollowedTab'
import ProfileTab from './ProfileTab'
import NoteTab from './NoteTab'
import MyConferencesTab from './MyConferencesTab'
import { ConferenceResponse } from '../../../models/response/conference.response'
import Footer from '../utils/Footer'
import { Header } from '../utils/Header'

type Conference = ConferenceResponse

export default function Setting({ locale }: { locale: string }) {
  const t = useTranslations('')
  const searchParams = useSearchParams()
  const [activePage, setActivePage] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const tab = searchParams.get('tab')
    let initialPage = 'Profile'
    if (tab === 'profile') {
      initialPage = 'Profile'
    } else if (tab === 'followed') {
      initialPage = 'Followed'
    } else if (tab === 'myconferences') {
      initialPage = 'My Conferences'
    } else if (tab === 'note') {
      initialPage = 'Note'
    } else if (tab === 'notifications') {
      initialPage = 'Notifications'
    } else if (tab === 'setting') {
      initialPage = 'Setting'
    }
    setActivePage(initialPage)
  }, [searchParams])

  const notifications: any[] = [
    {
      title:
        'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description:
        '[UPDATED] Deadline for submission of minisymposium speaker abstracts is changed from 2024/02/15 to 2024/02/15.',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#'
    },
    {
      title:
        'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description:
        '[UPDATED] Deadline for submission of minisymposium proposals is changed from 2024/02/15 to 2024/02/15.',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#'
    },
    {
      title:
        'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description:
        '[UPDATED] Conference start from "2024/7/8 to 2024/7/11", location: "Spokane, Washington, U.S", type: "offline".',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#'
    },
    {
      title:
        'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description:
        '[UPDATED] Conference start from "2024/7/8 to 2024/7/11", location: "Spokane, Washington, U.S", type: "offline".',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#'
    },
    {
      title:
        'The conference SIAM Conference on Discrete Mathematics that you are followed has new updated',
      description:
        '[UPDATED] Conference start from "2024/7/8 to 2024/7/11", location: "Spokane, Washington, U.S", type: "offline".',
      updatedAt: '2024/06/19 11:41',
      detailsLink: '#'
    }
  ]
  const exampleConferences: Conference[] = []

  const renderPage = () => {
    switch (activePage) {
      case 'Setting':
        return <SettingTab />
      case 'Notifications':
        return <NotificationsTab notifications={notifications} />
      case 'Followed':
        return <FollowedTab conferences={exampleConferences} />
      case 'Note':
        return <NoteTab />
      case 'My Conferences':
        return <MyConferencesTab conferences={exampleConferences} />
      case 'Profile':
        return <ProfileTab />
      default:
        return <ProfileTab />
    }
  }

  const menuItems = [
    {
      page: 'Profile',
      label: t('Profile'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-5 w-5'
        >
          <path d='M12 22s-8-4.5-8-11a8 8 0 1 1 16 0c0 6.5-8 11-8 11z' />
          <circle cx='12' cy='10' r='3' />
        </svg>
      )
    },
    {
      page: 'Followed',
      label: t('Followed'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-5 w-5'
        >
          <path d='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' />
          <path d='M16.2 7.8l-2 6.3-6.4 2.1 2-6.3 6.4-2.1zm-8.4 0L5.8 14l6.3 2.1 2-6.3L7.8 7.8z' />
        </svg>
      )
    },
    {
      page: 'My Conferences',
      label: t('My Conferences'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-5 w-5'
        >
          <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
          <line x1='16' y1='2' x2='16' y2='6' />
          <line x1='8' y1='2' x2='8' y2='6' />
          <line x1='3' y1='10' x2='21' y2='10' />
        </svg>
      )
    },
    {
      page: 'Note',
      label: t('Note'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-5 w-5'
        >
          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
          <path d='M14 2v6h6' />
          <path d='M16 13H8' />
          <path d='M16 17H8' />
          <path d='M10 9H8' />
        </svg>
      )
    },
    {
      page: 'Notifications',
      label: t('Notifications'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-5 w-5'
        >
          <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
          <path d='M13.73 21a2 2 0 0 1-3.46 0' />
        </svg>
      )
    },
    {
      page: 'Setting',
      label: t('Setting'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-5 w-5'
        >
          <circle cx='12' cy='12' r='3' />
          <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' />
        </svg>
      )
    }
  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      <Header locale={locale} />
      <div className='relative justify-center'>
        <div className='w-full bg-background py-8'></div>
        <div className='flex'>
          {/* Sidebar */}
          <aside
            className={`
              fixed
              flex
              h-full
              flex-col
              transition-all
              duration-1000
              ease-in-out
              ${isSidebarOpen ? 'w-48' : 'w-16'}
            `}
          >
            <nav
              className={`
                w-full
                flex-grow
                ${isSidebarOpen ? '' : 'overflow-hidden'}
                transition-all
                duration-1000
                ease-in-out
              `}
            >
              <ul className='w-full'>
                {menuItems.map((item) => {
                  const tabValue = item.page.toLowerCase().replace(/ /g, '')
                  return (
                    <React.Fragment key={item.page}>
                      <li className='w-full'>
                        <Link
                          href={{
                            pathname: '/dashboard',
                            query: { tab: tabValue }
                          }}
                          className={`
                            flex
                            items-center
                            p-4
                            hover:bg-button
                            hover:opacity-60
                            focus:outline-none
                            transition-colors
                            duration-600
                            ease-in-out
                            ${
                              activePage === item.page
                                ? 'bg-button text-button-text hover:bg-secondary'
                                : ''
                            }
                            ${
                              isSidebarOpen
                                ? 'h-12 w-48 justify-start'
                                : 'h-12 w-16 justify-center'
                            }
                          `}
                        >
                          {item.icon}
                          {isSidebarOpen && (
                            <span className='ml-2'>{item.label}</span>
                          )}
                        </Link>
                      </li>

                      {/* Toggle Button */}
                      {item.page === 'Setting' && (
                        <li className='w-full'>
                          <button
                            onClick={toggleSidebar}
                            className={`
                              flex
                              items-center
                              p-3
                              focus:outline-none
                              transition-colors
                              duration-600
                              ease-in-out
                              hover:bg-button
                              hover:opacity-60
                              active:bg-blue-700
                              ${
                                isSidebarOpen
                                  ? 'w-48 justify-start'
                                  : 'w-16 justify-center'
                              }
                            `}
                          >
                            {isSidebarOpen ? (
                              <>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='mr-2 h-6 w-6 text-gray-700'
                                >
                                  <path d='M11 19l-7-7 7-7' />
                                  <path d='M18 19l-7-7 7-7' />
                                </svg>
                                <span className=''>{t('Collapse')}</span>
                              </>
                            ) : (
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='h-6 w-6 text-gray-700'
                              >
                                <path d='M13 5l7 7-7 7' />
                                <path d='M6 5l7 7-7 7' />
                              </svg>
                            )}
                          </button>
                        </li>
                      )}
                    </React.Fragment>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div
            className={`
              min-h-screen
              flex-1
              transition-all
              duration-50
              ease-in-out
              ${isSidebarOpen ? 'ml-48' : 'ml-16'}
            `}
          >
            {renderPage()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}