'use client'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC, useRef, useState, useEffect } from 'react'
import GithubIcon from '../../../icons/github'
import LogoIcon from '../../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import { usePathname } from 'next/navigation'; // Import usePathname

interface Props {
  locale: string
}

export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const headerRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // Get current pathname

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNotificationOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        closeNotification();
      }
      if (isMobileMenuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, isMobileMenuOpen, headerRef]);


  const NotificationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-9 text-button ">
      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
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
            <Link href={{ pathname: "/tabs/setting", query: { tab: "notifications" } }} lang={locale} onClick={closeNotification} className="text-button hover:underline block">
              {t('View all notifications')}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const MobileNavigation = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-background-secondary border-b border-border shadow-md z-40 sm:hidden"> {/* Chỉ hiển thị trên mobile */}
        <nav className="flex flex-col p-4">
          <Link lang={locale} href={`/tabs/conferences`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Conferences')}
          </Link>
          <Link lang={locale} href={`/tabs/journals`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Journals')}
          </Link>
          <Link lang={locale} href={`/tabs/setting`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Setting')}
          </Link>
          <Link lang={locale} href={`/tabs/chatbot`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Chatbot')}
          </Link>
          <Link lang={locale} href={`/tabs/support`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Support')}
          </Link>
          <Link lang={locale} href={`/tabs/support`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Add_Conference')}
          </Link>
          <Link lang={locale} href={`/tabs/about`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('About')}
          </Link>
          <Link lang={locale} href={`/tabs/login`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Login')}
          </Link>
          <Link lang={locale} href={`/tabs/register`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Register')}
          </Link>
          {/* <Link lang={locale} href={`/tabs/other`} className="block py-2 hover:bg-button/10" onClick={closeMobileMenu}>
            {t('Other')}
          </Link> */}
        </nav>
      </div>
    );
  };


  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-foreground">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-foreground">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const isActive = (href: string) => {
      return pathname === href;
  };


  return (
    <>
      
        <div
          ref={headerRef}
          className={`mx-auto flex max-w-screen-2xl flex-row items-center justify-between p-3 bg-gradient-to-r from-background to-background-secondary transition-all duration-300 ease-in-out
        fixed top-0 left-0 right-0 z-40 shadow-md
      `}
          style={{ height: '60px' }} // Reduced height
        >
          <Link lang={locale} href='/'>
            <div className='flex flex-row items-center'>
              <div className='mb-2 h-10 w-10'> {/* Reduced logo size */}
                <LogoIcon />
              </div>
              <strong className='mx-2 select-none'>ConFHub</strong>
            </div>
          </Link>
          <div className='flex flex-row items-center gap-3 relative'>
            {/* Navigation for larger screens - Hiển thị trên sm trở lên */}
            <nav className='mr-10  gap-5 sm:inline-flex hidden'> {/* Ẩn mặc định, hiển thị trên sm */}
              <Link
                lang={locale}
                href={`/tabs/conferences`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/conferences') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Conferences')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/conferences') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/journals`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/journals') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Journals')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/journals') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/setting`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/setting') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Setting')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/setting') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/chatbot`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/chatbot') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Chatbot')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/chatbot') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/support`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/support') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Support')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/support') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/addconference`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/addconference') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Add_Conference')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/addconference') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/about`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/about') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('About')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/about') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/login`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/login') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Login')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/login') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/register`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/register') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Register')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/register') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
              {/* <Link
                lang={locale}
                href={`/tabs/other`}
                style={{ fontWeight: 'bold' }}
                className={`relative group ${pathname.includes('/tabs/other') ? 'text-selected' : ''}`} // Conditional styling
              >
                {t('Other')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-selected transform transition-transform duration-300 ${pathname.includes('/tabs/other') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link> */}
            </nav>

            {/* Mobile Menu Button - Chỉ hiển thị trên màn hình nhỏ (dưới sm) */}
            <button
              className='sm:hidden block' // Hiển thị mặc định, ẩn trên sm
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <CloseIcon />
              ) : (
                <MenuIcon />
              )}
            </button>

            <ThemeSwitch />
            <LangSwitcher />
            <button className='' onClick={toggleNotification}>
              <div className='size-8 items-center justify-center relative'>
                <NotificationIcon />
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
            <MobileNavigation /> 
          </div>
        </div>
      
    </>
  )
}