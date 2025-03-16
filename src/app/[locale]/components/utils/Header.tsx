import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';
import { FC, useRef, useState, useEffect } from 'react';
import GithubIcon from '../../../icons/github';
import LogoIcon from '../../../icons/logo';
import LangSwitcher from './LangSwitcher';
import ThemeSwitch from './ThemeSwitch';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from 'usehooks-ts';

interface Props {
  locale: string;
}

export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('');
  const headerRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const router = useRouter();

  // Sử dụng useLocalStorage cho firstname, lastname, và loginStatus
  const [firstname, setFirstname] = useLocalStorage<string>('firstname', '');
  const [lastname, setLastname] = useLocalStorage<string>('lastname', '');
  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>('loginStatus', null); // Sử dụng string | null để cho phép giá trị null


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

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeUserDropdown = () => {
    setIsUserDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isNotificationOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeNotification();
      }
      if (
        isMobileMenuOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
      if (
        isUserDropdownOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeUserDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, isMobileMenuOpen, isUserDropdownOpen, headerRef]);

  const MobileNavigation = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-background-secondary border-b border-border shadow-md z-40 sm:hidden">
        <nav className="flex flex-col p-4">
          {/* ... Các link ... */}
          <Link
            lang={locale}
            href={`/tabs/conferences`}
            className="block py-2 hover:bg-button/10"
            onClick={closeMobileMenu}
          >
            {t('Conferences')}
          </Link>
          <Link
            lang={locale}
            href={`/tabs/journals`}
            className="block py-2 hover:bg-button/10"
            onClick={closeMobileMenu}
          >
            {t('Journals')}
          </Link>
          <Link
            lang={locale}
            href={`/tabs/dashboard`}
            className="block py-2 hover:bg-button/10"
            onClick={closeMobileMenu}
          >
            {t('Setting')}
          </Link>
          <Link
            lang={locale}
            href={`/tabs/chatbot`}
            className="block py-2 hover:bg-button/10"
            onClick={closeMobileMenu}
          >
            {t('Chatbot')}
          </Link>
          <Link
            lang={locale}
            href={`/tabs/support`}
            className="block py-2 hover:bg-button/10"
            onClick={closeMobileMenu}
          >
            {t('Support')}
          </Link>
          <Link
            lang={locale}
            href={`/tabs/addconference`}
            className="block py-2 hover:bg-button/10"
            onClick={closeMobileMenu}
          >
            {t('Add_Conference')}
          </Link>
          <Link
            lang={locale}
            href={`/tabs/about`}
            className="block py-2 hover:bg-button/10"
            onClick={closeMobileMenu}
          >
            {t('About')}
          </Link>
          {loginStatus ? null : (
            <>
              <Link
                lang={locale}
                href={`/tabs/login`}
                className="block py-2 hover:bg-button/10"
                onClick={closeMobileMenu}
              >
                {t('Login')}
              </Link>
              <Link
                lang={locale}
                href={`/tabs/register`}
                className="block py-2 hover:bg-button/10"
                onClick={closeMobileMenu}
              >
                {t('Register')}
              </Link>
            </>
          )}
        </nav>
      </div>
    );
  };

  const MenuIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-menu" // Use lucide-menu for a standard menu icon
    >
      <line x1="3" x2="21" y1="12" y2="12" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <line x1="3" x2="21" y1="18" y2="18" />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-8 w-8 text-foreground"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  const UserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-user-check"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );

  const UserDropdown = () => {
    const router = useRouter();

    if (!isUserDropdownOpen) return null;

    return (
      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 focus:outline-none" aria-labelledby="user-menu-button">
        <div className="py-1">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Chào mừng! {firstname} {lastname}
          </div>

          <Link
            href="/tabs/dashboard"
            lang={locale}
            onClick={closeUserDropdown}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
          >
            Bảng điều khiển
          </Link>

          <ThemeSwitch />
          <LangSwitcher />

          <button
            onClick={() => {
              // Sử dụng các hàm setter của hook để xóa dữ liệu
              setLoginStatus(null);
              setFirstname('');
              setLastname('');

              let pathWithLocale = '/tabs/login';
              if (pathname) {
                const pathParts = pathname.split('/');
                if (pathParts.length > 1) {
                  const localePrefix = pathParts[1];
                  pathWithLocale = `/${localePrefix}/tabs/login`;
                }
              }

              router.push(pathWithLocale);
              closeUserDropdown();
            }}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 w-full text-left"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  };


  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      <div
        ref={headerRef}
        className={`
          mx-auto
          flex
          max-w-screen-2xl
          flex-row
          items-center /* Canh giữa dọc các phần tử */
          justify-between
          p-3
          bg-gradient-to-r
          from-background
          to-background-secondary
          transition-all
          duration-300
          ease-in-out
          fixed
          top-0
          left-0
          right-0
          z-40
          shadow-md
        `}
        style={{ height: '60px' }}
      >
        <Link lang={locale} href="/">
          <div className="flex flex-row items-center">
            <div className="mb-2 h-10 w-10">
              <LogoIcon />
            </div>
            <strong className="mx-2 select-none">ConFHub</strong>
          </div>
        </Link>

        <div className="flex flex-row items-center gap-3 relative">
          {/* Navigation for larger screens */}
          <nav className="mr-10 gap-5 sm:inline-flex hidden">
            {/* Ẩn mặc định, hiển thị trên sm */}
             {/* ... Các link ... */}
            <Link
              lang={locale}
              href={`/tabs/conferences`}
              className={`
                relative
                group
                font-semibold
                ${pathname.includes('/tabs/conferences')
                  ? 'text-selected'
                  : ''
                }
              `}
            >
              {t('Conferences')}
              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  w-full
                  h-0.5
                  bg-selected
                  transform
                  transition-transform
                  duration-300
                  ${pathname.includes('/tabs/conferences')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                  }
                `}
              ></span>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/journals`}
              className={`
                relative
                group
                font-semibold
                ${pathname.includes('/tabs/journals') ? 'text-selected' : ''}
              `}
            >
              {t('Journals')}
              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  w-full
                  h-0.5
                  bg-selected
                  transform
                  transition-transform
                  duration-300
                  ${pathname.includes('/tabs/journals')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                  }
                `}
              ></span>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/chatbot`}
              className={`
                relative
                group
                font-semibold
                ${pathname.includes('/tabs/chatbot') ? 'text-selected' : ''}
              `}
            >
              {t('Chatbot')}
              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  w-full
                  h-0.5
                  bg-selected
                  transform
                  transition-transform
                  duration-300
                  ${pathname.includes('/tabs/chatbot')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                  }
                `}
              ></span>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/support`}
              className={`
                relative
                group
                font-semibold
                ${pathname.includes('/tabs/support') ? 'text-selected' : ''}
              `}
            >
              {t('Support')}
              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  w-full
                  h-0.5
                  bg-selected
                  transform
                  transition-transform
                  duration-300
                  ${pathname.includes('/tabs/support')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                  }
                `}
              ></span>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/addconference`}
              className={`
                relative
                group
                font-semibold
                ${pathname.includes('/tabs/addconference')
                  ? 'text-selected'
                  : ''
                }
              `}
            >
              {t('Add_Conference')}
              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  w-full
                  h-0.5
                  bg-selected
                  transform
                  transition-transform
                  duration-300
                  ${pathname.includes('/tabs/addconference')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                  }
                `}
              ></span>
            </Link>
            <Link
              lang={locale}
              href={`/tabs/about`}
              className={`
                relative
                group
                font-semibold
                ${pathname.includes('/tabs/about') ? 'text-selected' : ''}
              `}
            >
              {t('About')}
              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  w-full
                  h-0.5
                  bg-selected
                  transform
                  transition-transform
                  duration-300
                  ${pathname.includes('/tabs/about')
                    ? 'scale-x-100'
                    : 'scale-x-0 group-hover:scale-x-100'
                  }
                `}
              ></span>
            </Link>
            {loginStatus ? null : (
              <>
                <Link
                  lang={locale}
                  href={`/tabs/login`}
                  className={`
                    group
                    inline-flex
                    items-center
                    font-semibold
                    text-white
                    bg-blue-500
                    hover:bg-blue-700
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-400
                    transition-colors
                    duration-200
                    px-4
                    py-2
                    rounded-md
                    shadow-md
                    hover:shadow-lg
                    ${pathname.includes('/tabs/login') ? 'bg-blue-600' : ''}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>                  {t('Login')}
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden block" // Hiển thị mặc định, ẩn trên sm
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* User dropdown */}
          {loginStatus ? (
            <div className="relative">
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
  );
};