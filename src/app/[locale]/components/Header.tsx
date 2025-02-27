'use client'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC, useRef } from 'react'
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

  // Updated Notification Icon with better design
  const NotificationIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className=" text-button hover:text-logo-shadow"
    >
      <path d="M12 2C9.243 2 7 4.243 7 7v5c0 .265-.105.52-.293.707L5 15h14l-1.707-2.293A1 1 0 0117 12V7c0-2.757-2.243-5-5-5zm1 17a1 1 0 01-2 0h2z" />
      </svg>
  );

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
      <div className='flex flex-row items-center gap-3'>
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
        <button className=''>
          <div className='size-8 items-center justify-center'>
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
      </div>
    </div>
  )
}
