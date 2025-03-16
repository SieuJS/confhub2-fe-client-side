// Header.tsx
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC, useRef, useState, useEffect } from 'react'
import GithubIcon from '../../../icons/github'
import LogoIcon from '../../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'

interface Props {
  locale: string
}

export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const headerRef = useRef<HTMLDivElement>(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const router = useRouter()

  const [firstname, setFirstname] = useLocalStorage<string>('firstname', '')
  const [lastname, setLastname] = useLocalStorage<string>('lastname', '')
  const [userEmail, setUserEmail] = useLocalStorage<string>('email', '')
  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  )
  console.log('loginStatus:', loginStatus)

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen)
  }

  const closeNotification = () => {
    setIsNotificationOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen)
  }

  const closeUserDropdown = () => {
    setIsUserDropdownOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isNotificationOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeNotification()
      }
      if (
        isMobileMenuOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu()
      }
      if (
        isUserDropdownOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeUserDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationOpen, isMobileMenuOpen, isUserDropdownOpen, headerRef])

  const MobileNavigation = () => {
    if (!isMobileMenuOpen) return null

    return (
      <div className='border-border absolute left-0 right-0 top-full z-40 border-b bg-background-secondary shadow-md sm:hidden'>
        <div className='flex flex-col p-4'>
          <Link
            lang={locale}
            href={`/tabs/conferences`}
            onClick={closeMobileMenu}
          >
            <div className='hover:bg-button/10 py-2'>{t('Conferences')}</div>
          </Link>
          <Link lang={locale} href={`/tabs/journals`} onClick={closeMobileMenu}>
            <div className='hover:bg-button/10 py-2'>{t('Journals')}</div>
          </Link>
          <Link lang={locale} href={`/tabs/chatbot`} onClick={closeMobileMenu}>
            <div className='hover:bg-button/10 py-2'>{t('Chatbot')}</div>
          </Link>
          <Link lang={locale} href={`/tabs/support`} onClick={closeMobileMenu}>
            <div className='hover:bg-button/10 py-2'>{t('Support')}</div>
          </Link>
          <Link
            lang={locale}
            href={`/tabs/addconference`}
            onClick={closeMobileMenu}
          >
            <div className='hover:bg-button/10 py-2'>{t('Add_Conference')}</div>
          </Link>
          <Link lang={locale} href={`/tabs/about`} onClick={closeMobileMenu}>
            <div className='hover:bg-button/10 py-2'>{t('About')}</div>
          </Link>
          {loginStatus ? null : (
            <>
              <Link
                lang={locale}
                href={`/tabs/login`}
                onClick={closeMobileMenu}
              >
                <div className='hover:bg-button/10 py-2'>{t('Login')}</div>
              </Link>
              <Link
                lang={locale}
                href={`/tabs/register`}
                onClick={closeMobileMenu}
              >
                <div className='hover:bg-button/10 py-2'>{t('Register')}</div>
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  const MenuIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-menu'
    >
      <line x1='3' x2='21' y1='12' y2='12' />
      <line x1='3' x2='21' y1='6' y2='6' />
      <line x1='3' x2='21' y1='18' y2='18' />
    </svg>
  )

  const CloseIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className='text-foreground h-8 w-8'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6 18L18 6M6 6l12 12'
      />
    </svg>
  )

  const UserIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-user-check'
    >
      <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
      <circle cx='9' cy='7' r='4' />
      <polyline points='16 11 18 13 22 9' />
    </svg>
  )

  const UserDropdown = () => {
    const router = useRouter()

    if (!isUserDropdownOpen) return null

    return (
      <div
        className='absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800'
        aria-labelledby='user-menu-button'
      >
        <div className='flex flex-col gap-1 py-1'>
          <div className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>
            Chào mừng! {firstname} {lastname}
          </div>
          <Link
            href='/tabs/dashboard'
            lang={locale}
            onClick={closeUserDropdown}
          >
            <div className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700'>
              Bảng điều khiển
            </div>
          </Link>
          <div className='px-4 py-2'>
            <ThemeSwitch />
          </div>
          <div className='px-4 py-2'>
            <LangSwitcher />
          </div>
          <button
            className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
            onClick={() => {
              setLoginStatus(null)
              setFirstname('')
              setLastname('')
              setUserEmail('')
              let pathWithLocale = '/tabs/login'
              if (pathname) {
                const pathParts = pathname.split('/')
                if (pathParts.length > 1) {
                  const localePrefix = pathParts[1]
                  pathWithLocale = `/${localePrefix}/tabs/login`
                }
              }

              router.push(pathWithLocale)
              closeUserDropdown()
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    )
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <>
      <div
        ref={headerRef}
        className={`fixed left-0 right-0 top-0 z-40 mx-auto flex max-w-screen-2xl flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 shadow-md transition-all duration-300 ease-in-out`}
        style={{ height: '60px' }}
      >
        <Link lang={locale} href='/'>
          <div className='flex flex-row items-center'>
            <div className='mb-2 h-10 w-10'>
              <LogoIcon />
            </div>
            <strong className='mx-2 select-none'>ConFHub</strong>
          </div>
        </Link>

        <div className='relative flex flex-row items-center gap-3'>
          {/* Desktop Navigation */}
          <div className='mr-10 hidden gap-5 sm:inline-flex'>
            <Link
              lang={locale}
              href={`/tabs/conferences`}
              className={`group relative font-semibold ${
                pathname.includes('/tabs/conferences') ? 'text-selected' : ''
              }`}
            >
              <div>
                {t('Conferences')}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                    pathname.includes('/tabs/conferences')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </div>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/journals`}
              className={`group relative font-semibold ${
                pathname.includes('/tabs/journals') ? 'text-selected' : ''
              }`}
            >
              <div>
                {t('Journals')}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                    pathname.includes('/tabs/journals')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </div>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/chatbot`}
              className={`group relative font-semibold ${
                pathname.includes('/tabs/chatbot') ? 'text-selected' : ''
              }`}
            >
              <div>
                {t('Chatbot')}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                    pathname.includes('/tabs/chatbot')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </div>
            </Link>

            <Link
              lang={locale}
              href={`/tabs/support`}
              className={`group relative font-semibold ${
                pathname.includes('/tabs/support') ? 'text-selected' : ''
              }`}
            >
              <div>
                {t('Support')}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                    pathname.includes('/tabs/support')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </div>
            </Link>

            <Link
              lang={locale}
              href={`/tabs/addconference`}
              className={`group relative font-semibold ${
                pathname.includes('/tabs/addconference') ? 'text-selected' : ''
              }`}
            >
              <div>
                {t('Add_Conference')}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                    pathname.includes('/tabs/addconference')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </div>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/about`}
              className={`group relative font-semibold ${
                pathname.includes('/tabs/about') ? 'text-selected' : ''
              }`}
            >
              <div>
                {t('About')}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                    pathname.includes('/tabs/about')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                ></span>
              </div>
            </Link>

            {loginStatus ? null : (
              <Link
                lang={locale}
                href={`/tabs/login`}
                className={`group relative inline-flex items-center rounded-md bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  pathname.includes('/tabs/login') ? 'bg-blue-600' : ''
                }`}
              >
                <div className='flex items-center'>
                  {' '}
                  {/* Container for icon and text */}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#ffffff'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-log-in mr-2'
                  >
                    <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' />
                    <polyline points='10 17 15 12 10 7' />
                    <line x1='15' x2='3' y1='12' y2='12' />
                  </svg>
                  {t('Login')}
                </div>
              </Link>
            )}
          </div>

          <button className='block sm:hidden' onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {loginStatus ? (
            <div className='relative'>
              <button onClick={toggleUserDropdown}>
                <UserIcon />
              </button>
              <UserDropdown />
            </div>
          ) : null}
          <MobileNavigation />
        </div>
      </div>
    </>
  )
}
