'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/src/navigation' // Assuming this is your next-intl Link
import Analysis from './logAnalysis/Analysis'
import SettingTab from './setting/SettingTab'
import NotificationsTab from './notification/NotificationsTab'
import FollowedTab from './follow/FollowedTab'
import BlacklistTab from './blacklist/BlacklistTab'
import ProfileTab from './profile/ProfileTab'
import NoteTab from './note/NoteTab'
import MyConferencesTab from './myConferences/MyConferencesTab'
import { Header } from '../utils/Header'
// Không cần useMediaQuery nữa
// import { useMediaQuery } from 'react-responsive'

export default function Dashboard({ locale }: { locale: string }) {
  const t = useTranslations('')
  const searchParams = useSearchParams()
  const [activePage, setActivePage] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Giữ nguyên init là false

  // Logic cập nhật activePage dựa trên searchParams (giữ nguyên)
  useEffect(() => {
    const tab = searchParams.get('tab')
    // Mặc định là Analysis nếu không có tab hợp lệ
    let initialPage = 'Analysis'
    if (tab === 'followed') initialPage = 'Followed'
    else if (tab === 'profile') initialPage = 'Profile'
    else if (tab === 'myconferences') initialPage = 'My Conferences'
    else if (tab === 'note') initialPage = 'Note'
    else if (tab === 'notifications') initialPage = 'Notifications'
    else if (tab === 'blacklisted') initialPage = 'Blacklisted'
    else if (tab === 'setting') initialPage = 'Setting'
    // Nếu tab không khớp với bất kỳ trường hợp nào trên, nó vẫn giữ giá trị mặc định là 'Analysis'.
    // Bạn có thể thêm một trường hợp else cuối cùng nếu muốn một tab mặc định khác khi không có tab nào được cung cấp hoặc không hợp lệ.
    // Ví dụ: else { initialPage = 'Profile'; }
    setActivePage(initialPage)

    // Optional: Trên mobile, tự động đóng sidebar khi chuyển tab
    // Để check mobile ở client, bạn có thể dùng window.innerWidth trong useEffect sau mount.
    // Lưu ý: Dùng window.innerWidth trong useEffect là OK, nhưng tránh dùng nó
    // để quyết định *lần render đầu tiên* hoặc layout ban đầu vì nó không có ở server.
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false)
    }
  }, [searchParams]) // Phụ thuộc vào searchParams

  const renderPage = () => {
    // Logic render page không đổi
    switch (activePage) {
      case 'Setting':
        return <SettingTab />
      case 'Notifications':
        return <NotificationsTab />
      case 'Followed':
        return <FollowedTab />
      case 'Blacklisted':
        return <BlacklistTab />
      case 'Note':
        return <NoteTab />
      case 'My Conferences':
        return <MyConferencesTab />
      case 'Profile':
        return <ProfileTab />
      case 'Analysis':
        return <Analysis />
      default:
        // Render tab mặc định hoặc Analysis nếu activePage không hợp lệ
        return <Analysis /> // Hoặc <ProfileTab />
    }
  }

  // Menu items remains the same
  const menuItems = [
    {
      page: 'Analysis',
      label: t('Analysis'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-airplay-icon lucide-airplay'
        >
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      )
    },
    {
      page: 'Profile',
      label: t('Profile'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-circle-user-round '
        >
          <path d='M18 20a6 6 0 0 0-12 0' />
          <circle cx='12' cy='10' r='4' />
          <circle cx='12' cy='12' r='10' />
        </svg>
      )
    },
    {
      page: 'Followed',
      label: t('Followed'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-star'
        >
          <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
        </svg>
      )
    },
    {
      page: 'My Conferences',
      label: t('My_Conferences'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-notebook-tabs'
        >
          <path d='M2 6h4' />
          <path d='M2 10h4' />
          <path d='M2 14h4' />
          <path d='M2 18h4' />
          <rect width='16' height='20' x='4' y='2' rx='2' />
          <path d='M15 2v20' />
          <path d='M15 7h5' />
          <path d='M15 12h5' />
          <path d='M15 17h5' />
        </svg>
      )
    },
    {
      page: 'Note',
      label: t('Note'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-calendar-days'
        >
          <path d='M8 2v4' />
          <path d='M16 2v4' />
          <rect width='18' height='18' x='3' y='4' rx='2' />
          <path d='M3 10h18' />
          <path d='M8 14h.01' />
          <path d='M12 14h.01' />
          <path d='M16 14h.01' />
          <path d='M8 18h.01' />
          <path d='M12 18h.01' />
          <path d='M16 18h.01' />
        </svg>
      )
    },
    {
      page: 'Notifications',
      label: t('Notifications'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-bell-ring'
        >
          <path d='M10.268 21a2 2 0 0 0 3.464 0' />
          <path d='M22 8c0-2.3-.8-4.3-2-6' />
          <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
          <path d='M4 2C2.8 3.7 2 5.7 2 8' />
        </svg>
      )
    },
    {
      page: 'Blacklisted',
      label: t('Blacklisted'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='m2 2 20 20' />
          <path d='M8.35 2.69A10 10 0 0 1 21.3 15.65' />
          <path d='M19.08 19.08A10 10 0 1 1 4.92 4.92' />
        </svg>
      )
    },
    {
      page: 'Setting',
      label: t('Setting'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-settings'
        >
          <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
          <circle cx='12' cy='12' r='3' />
        </svg>
      )
    }
  ]

  // Header height constant (adjust as needed based on your Header component's actual height)
  // Assuming your Header is 72px tall (e.g., using px-18 utility)
  const HEADER_HEIGHT_PX = 72

  // Toggle icons (keep these)
  const openIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#525252'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-align-justify'
    >
      <path d='M3 12h18' />
      <path d='M3 18h18' />
      <path d='M3 6h18' />
    </svg>
  )
  const closeIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#525252'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-x'
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  )

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Render chính
  return (
    <>
      {/* Header component */}
      {/* Header nên là fixed hoặc sticky và có z-index cao để nó luôn ở trên cùng */}
      <Header locale={locale} />

      {/* Container cho Sidebar và Main Content */}
      {/* flex để sidebar và content nằm cạnh nhau trên desktop */}
      {/* pt-[...] để nội dung không bị ẩn dưới header cố định */}
      <div
        className='relative flex min-h-screen'
        style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }}
      >
        {' '}
        {/* Sử dụng style inline hoặc class Tailwind pt-[72px] */}
        {/* Sidebar */}
        <aside
          className={`
            fixed top-[${HEADER_HEIGHT_PX}px] left-0 h-[calc(100vh-${HEADER_HEIGHT_PX}px)] z-10 overflow-y-auto bg-background
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'md:w-52' : 'md:w-16'} /* Desktop width: 48 (open) or 16 (closed) */
            /* Mobile width: 0 (hidden) */ /*
            Mobile hide opacity */ w-0 opacity-0 md:opacity-100
            ${!isSidebarOpen && 'md:overflow-hidden'} /* Optional: Hide on desktop when collapsed */ scrollbar
          `}
          // Nếu muốn ẩn hẳn trên mobile thay vì w-0/opacity-0:
          // className={`
          //   fixed top-[${HEADER_HEIGHT_PX}px] left-0 h-[calc(100vh-${HEADER_HEIGHT_PX}px)] bg-background overflow-y-auto z-10
          //   transition-all duration-300 ease-in-out
          //   ${isSidebarOpen ? 'md:w-48' : 'md:w-16'}
          //   hidden md:block /* Hide completely on mobile, show as block on desktop */
          // `}
        >
          <nav className='w-full'>
            <ul className='w-full'>
              {/* Toggle Button */}
              {/* Ẩn button trên mobile */}
              <li className='hidden w-full md:block'>
                <button
                  onClick={toggleSidebar}
                  className={`
                      flex w-full items-center px-4 py-2
                      transition-colors duration-500 ease-in-out
                      hover:bg-button hover:opacity-60 focus:outline-none active:bg-blue-700
                      ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                    `}
                >
                  {/* Icon và spacing */}
                  <span className={isSidebarOpen ? 'mr-4' : ''}>
                    {isSidebarOpen ? closeIcon : openIcon}
                  </span>
                  {/* Chỉ hiển thị text khi sidebar mở */}
                  {isSidebarOpen && <span>{t('Close')}</span>}
                </button>
              </li>

              {/* Menu Items */}
              {menuItems.map(item => {
                const tabValue = item.page.toLowerCase().replace(/ /g, '')
                return (
                  <li className='w-full' key={item.page}>
                    <Link
                      href={{
                        pathname: '/dashboard',
                        query: { tab: tabValue }
                      }}
                      className={`
                          flex h-12 w-full items-center px-4 py-2
                          transition-colors duration-500 ease-in-out
                          hover:bg-button hover:opacity-60 focus:outline-none
                          ${
                            activePage === item.page
                              ? 'bg-button text-button-text hover:bg-secondary'
                              : ''
                          }
                           ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                        `}
                    >
                      {/* Icon và spacing */}
                      <span className={isSidebarOpen ? 'mr-4' : ''}>
                        {item.icon}
                      </span>
                      {/* Chỉ hiển thị text khi sidebar mở */}
                      {isSidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>
        {/* Main Content Area */}
        {/* flex-1 để chiếm hết không gian còn lại */}
        {/* margin-left được điều chỉnh bởi trạng thái sidebar và media query */}
        <div
          className={`
              /* Default
              mobile margin */
              ml-0 min-h-screen flex-1 transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'md:ml-48' : 'md:ml-16'} /* Desktop margin: 48 (open) or 16 (closed) */
            `}
        >
          {/* Render page dựa trên activePage */}
          {renderPage()}
        </div>
      </div>
      {/* <Footer /> */}
    </>
  )
}
