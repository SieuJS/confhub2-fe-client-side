'use client'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC, useRef, useState, useEffect } from 'react'
import GithubIcon from '../../icons/github'
import LogoIcon from '../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'

interface Props {
  locale: string
}

export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const headerRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
  };

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        closeNotification();
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, headerRef]);


  // Updated Notification Icon with better design
  const NotificationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-9 text-button ">
  <path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clip-rule="evenodd" />
</svg>
  );

  const NotificationDropdown = () => {
    if (!isNotificationOpen) return null;

    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-background-secondary border border-border rounded-md shadow-lg z-50">
        <div className="py-2">
          <div className="px-4 py-2 text-sm text-foreground hover:bg-button/10">
            Notification 1: New message from user A
          </div>
          <div className="px-4 py-2 text-sm text-foreground hover:bg-button/10">
            Notification 2: System update available
          </div>
          <div className="px-4 py-2 text-sm text-foreground hover:bg-button/10">
            Notification 3: Reminder for conference call
          </div>
          <div className="px-4 py-2 text-sm text-foreground hover:bg-button/10 text-center border-t border-border">
            <Link href="/setting" lang={locale} onClick={closeNotification} className="text-button hover:underline block">
              {t('View all notifications')}
            </Link>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div
      ref={headerRef}
      className={`mx-auto flex max-w-screen-2xl flex-row items-center justify-between p-5 bg-gradient-to-r from-background to-background-secondary transition-all duration-300 ease-in-out
        fixed top-0 left-0 right-0 z-50 shadow-md
      `}
    >
      <Link lang={locale} href='/'>
        <div className='flex flex-row items-center'>
          <div className='mb-2 h-14 w-14'>
            <LogoIcon />
          </div>
          <strong className='mx-2 select-none'>Template</strong>
        </div>
      </Link>
      <div className='flex flex-row items-center gap-3 relative'>
        <nav className='mr-10 inline-flex gap-5'>
          <Link lang={locale} href={`/about`}>
            {t('About')}
          </Link>
          <Link lang={locale} href={`/conferences`}>
            {t('Conferences')}
          </Link>
          <Link lang={locale} href={`/journals`}>
            {t('Journals')}
          </Link>
          <Link lang={locale} href={`/journaldetails`}>
            {t('Journal Details')}
          </Link>
          <Link lang={locale} href={`/setting`}>
            {t('Setting')}
          </Link>
          <Link lang={locale} href={`/chatbot`}>
            {t('Chatbot')}
          </Link>
          <Link lang={locale} href={`/support`}>
            {t('Support')}
          </Link>
          <Link lang={locale} href={`/other`}>
            {t('Other')}
          </Link>
        </nav>
        <ThemeSwitch />
        <LangSwitcher />
        <button className='' onClick={toggleNotification}>
          <div className='size-8 items-center justify-center relative'>
            <NotificationIcon />
            {/* Optional: Add a red dot for unread notifications */}
            {/* <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div> */}
          </div>
        </button>
        <a
          href='https://github.com/yahyaparvar/nextjs-template'
          target='_blank'
        >
          <div className='size-8'>
            <GithubIcon />
          </div>
        </a>
        <NotificationDropdown />
      </div>
    </div>
  )
}