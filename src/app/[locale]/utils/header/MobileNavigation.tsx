'use client';

import { FC, useState, useEffect } from 'react';
import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';
import ThemeSwitch from '../ThemeSwitch';
import LangSwitcher from '../LangSwitcher';

interface Props {
  isMobileMenuOpen: boolean;
  closeAllMenus: () => void;
  locale: string;
  isLogin: boolean;
}

const MobileNavigation: FC<Props> = ({
  isMobileMenuOpen,
  closeAllMenus,
  locale,
  isLogin
}) => {
  const t = useTranslations('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      // THAY ĐỔI Ở ĐÂY: Thay lg:hidden thành xl:hidden
      className={`mobile-navigation border-border absolute right-0 top-full z-40 w-40 border-b bg-background-secondary shadow-md xl:hidden ${
        isMobileMenuOpen ? '' : 'hidden'
      }`}
    >
      {isClient && (
        <>
          <div className='px-2 hover:bg-gray-10 '>
            <ThemeSwitch />
          </div>
          <div className='px-2 hover:bg-gray-10 '>
            <LangSwitcher />
          </div>
        </>
      )}

      <div className='flex flex-col text-sm '>
        <Link
          href={`/conferences`}
          locale={locale}
          className='px-4 py-2 hover:bg-gray-10 '
        >
          {t('Conferences')}
        </Link>
        <Link
          href={`/journals`}
          locale={locale}
          className='px-4 py-2 hover:bg-gray-10 '
        >
          {t('Journals')}
        </Link>
        <Link
          href={`/visualization`}
          locale={locale}
          className='px-4 py-2 hover:bg-gray-10 '
        >
          {t('Visualization.Visualization')}
        </Link>
        <Link
          href={`/chatbot/landing`}
          locale={locale}
          className='px-4 py-2 hover:bg-gray-10 '
        >
          {t('Chatbot.Chatbot')}
          <span className='mb-1 ml-1 inline-block rounded bg-button px-1.5 py-0.5 align-middle text-xs font-semibold text-button-text'>
            {t('NEW')}
          </span>
        </Link>
        <Link
          href={`/support`}
          locale={locale}
          className='px-4 py-2 hover:bg-gray-10 '
        >
          {t('Support')}
        </Link>
        <Link
          href={`/addconference`}
          locale={locale}
          className='px-4 py-2 hover:bg-gray-10 '
        >
          {t('Publish')}
        </Link>

        {isClient && !isLogin && (
          <>
            <Link
              href={`/auth/login`}
              locale={locale}
              className='px-4 py-2 hover:bg-gray-10 '
            >
              {t('Login')}
            </Link>
            <Link
              href={`/auth/register`}
              locale={locale}
              className='px-4 py-2 hover:bg-gray-10 '
            >
              {t('Register')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNavigation;