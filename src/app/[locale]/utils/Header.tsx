// Header.tsx
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC, useRef, useState, useEffect } from 'react'
import LogoIcon from '../../icons/logo'
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

  // Use the user object from local storage
  const [user, setUser] = useLocalStorage<{
    firstname: string
    lastname: string
    email: string
  } | null>('user', null)

  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  )

  const [isLogin, setIsLogin] = useState(false)

  useEffect(() => {
    if (loginStatus) setIsLogin(true)
  })
  // --- Helper Functions (for cleaner code) ---

  const closeAllMenus = () => {
    setIsNotificationOpen(false)
    setIsMobileMenuOpen(false)
    setIsUserDropdownOpen(false)
  }

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen)
    // Close other menus when opening a new one:
    if (!isNotificationOpen) {
      setIsMobileMenuOpen(false)
      setIsUserDropdownOpen(false)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (!isMobileMenuOpen) {
      setIsNotificationOpen(false)
      setIsUserDropdownOpen(false)
    }
  }

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen)
    if (!isUserDropdownOpen) {
      setIsNotificationOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  // --- Click Outside Handler (using useRef) ---

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeAllMenus() // Close all menus if click is outside the header
      }
    }

    document.addEventListener('mousedown', handleClickOutside) // Use mousedown for broader compatibility

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [headerRef]) // Only depend on headerRef, as the state variables are handled within the effect

  // --- SVG Icons (made into functional components for reusability) ---

  const NotificationIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      className='size-9 text-button'
    >
      <path
        fillRule='evenodd'
        d='M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z'
        clipRule='evenodd'
      />
    </svg>
  )

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

  // --- Dropdown Components (using conditional rendering) ---
  const NotificationDropdown = () => {
    return (
      <div
        className={`border-border absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-background-secondary shadow-lg ${
          isNotificationOpen ? '' : 'hidden'
        }`}
      >
        <div className='py-2'>
          <div className='text-foreground hover:bg-button/10 px-4 py-2 text-sm'>
            Notification 1: New message from user A
          </div>
          <div className='text-foreground hover:bg-button/10 px-4 py-2 text-sm'>
            Notification 2: System update available
          </div>
          <div className='text-foreground hover:bg-button/10 px-4 py-2 text-sm'>
            Notification 3: Reminder for conference call
          </div>
          <div className='text-foreground hover:bg-button/10 border-border border-t px-4 py-2 text-center text-sm'>
            <Link
              href='/dashboard'
              lang={locale}
              onClick={closeAllMenus}
              className='block text-button hover:underline'
            >
              {t('View_all_notifications')}
            </Link>
          </div>
        </div>
      </div>
    )
  }
  const MobileNavigation = () => {
    return (
      <div
        className={`border-border absolute left-0 right-0 top-full z-40 border-b bg-background-secondary shadow-md sm:hidden ${isMobileMenuOpen ? '' : 'hidden'}`}
      >
        <div className='flex flex-col p-4'>
          <Link lang={locale} href={`/conferences`} onClick={closeAllMenus}>
            <div className='hover:bg-button/10 py-2'>{t('Conferences')}</div>
          </Link>
          <Link lang={locale} href={`/journals`} onClick={closeAllMenus}>
            <div className='hover:bg-button/10 py-2'>{t('Journals')}</div>
          </Link>
          <Link lang={locale} href={`/chatbot`} onClick={closeAllMenus}>
            <div className='hover:bg-button/10 py-2'>{t('Chatbot')}</div>
          </Link>
          <Link lang={locale} href={`/support`} onClick={closeAllMenus}>
            <div className='hover:bg-button/10 py-2'>{t('Support')}</div>
          </Link>
          <Link lang={locale} href={`/addconference`} onClick={closeAllMenus}>
            <div className='hover:bg-button/10 py-2'>{t('Add_Conference')}</div>
          </Link>

          {isLogin ? null : (
            <>
              <Link lang={locale} href={`/auth/login`} onClick={closeAllMenus}>
                <div className='hover:bg-button/10 py-2'>{t('Login')}</div>
              </Link>
              <Link
                lang={locale}
                href={`/auth/register`}
                onClick={closeAllMenus}
              >
                <div className='hover:bg-button/10 py-2'>{t('Register')}</div>
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }
  const UserDropdown = () => {
    return (
      <div
        className={`absolute right-0 top-full z-50 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800 ${isUserDropdownOpen ? '' : 'hidden'}`}
        aria-labelledby='user-menu-button'
      >
        <div className='flex flex-col gap-1 py-1'>
          <Link href='/dashboard' lang={locale} onClick={closeAllMenus}>
            <div className='block px-4 py-2 text-sm  hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700'>
              {t('Dashboard')}
            </div>
          </Link>
          <div className=' '>
            <ThemeSwitch />
          </div>
          <div className=' '>
            <LangSwitcher />
          </div>
          <button
            className='block w-full px-4 py-2 text-left text-sm  hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
            onClick={() => {
              setLoginStatus(null)
              setUser(null) // Clear the user object
              let pathWithLocale = '/auth/login'
              if (pathname) {
                const pathParts = pathname.split('/')
                if (pathParts.length > 1) {
                  const localePrefix = pathParts[1]
                  pathWithLocale = `/${localePrefix}/auth/login`
                }
              }

              router.push(pathWithLocale)
              closeAllMenus()
            }}
          >
            {t('Logout')}
          </button>
        </div>
      </div>
    )
  }
  const isActive = (href: string) => {
    return pathname === href
  }

  // --- Main Header Structure ---

  return (
    <div
      ref={headerRef}
      className={`fixed left-0 right-0 top-0 z-40 mx-auto flex h-[60px] max-w-screen-2xl flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 shadow-md transition-all duration-300 ease-in-out`}
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
        <nav className='mr-10 hidden gap-5 sm:inline-flex'>
          <Link
            lang={locale}
            href={`/conferences`}
            className={`group relative font-semibold ${
              pathname.includes('/conferences') ? 'text-selected' : ''
            }`}
          >
            <div>
              {t('Conferences')}
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                  pathname.includes('/conferences')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              ></span>
            </div>
          </Link>
          <Link
            lang={locale}
            href={`/journals`}
            className={`group relative font-semibold ${
              pathname.includes('/journals') ? 'text-selected' : ''
            }`}
          >
            <div>
              {t('Journals')}
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                  pathname.includes('/journals')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              ></span>
            </div>
          </Link>
          <Link
            lang={locale}
            href={`/chatbot`}
            className={`group relative font-semibold ${
              pathname.includes('/chatbot') ? 'text-selected' : ''
            }`}
          >
            <div>
              {t('Chatbot')}
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                  pathname.includes('/chatbot')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              ></span>
            </div>
          </Link>

          <Link
            lang={locale}
            href={`/support`}
            className={`group relative font-semibold ${
              pathname.includes('/support') ? 'text-selected' : ''
            }`}
          >
            <div>
              {t('Support')}
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                  pathname.includes('/support')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              ></span>
            </div>
          </Link>

          <Link
            lang={locale}
            href={`/addconference`}
            className={`group relative font-semibold ${
              pathname.includes('/addconference') ? 'text-selected' : ''
            }`}
          >
            <div>
              {t('Add_Conference')}
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
                  pathname.includes('/addconference')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              ></span>
            </div>
          </Link>

          {!isLogin && (
            <div className='group relative flex font-semibold'>
              <ThemeSwitch />
              <LangSwitcher />
            </div>
          )}

          {isLogin ? null : (
            <Link
              lang={locale}
              href={`/auth/login`}
              className={`group relative inline-flex items-center rounded-md bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                pathname.includes('/auth/login') ? 'bg-blue-600' : ''
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
        </nav>

        {/* Mobile Menu Button */}
        <button className='block sm:hidden' onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Notification Button and Dropdown */}
        {isLogin && (
          <button className='' onClick={toggleNotification}>
            <NotificationIcon />
          </button>
        )}

        <NotificationDropdown />

        {/* User Button and Dropdown */}
        {isLogin ? (
          <>
            <button onClick={toggleUserDropdown}>
              <UserIcon />
            </button>
            <UserDropdown />
          </>
        ) : null}

        {/* Mobile Navigation (placed here for correct layering) */}
        <MobileNavigation />
      </div>
    </div>
  )
}

export default Header
