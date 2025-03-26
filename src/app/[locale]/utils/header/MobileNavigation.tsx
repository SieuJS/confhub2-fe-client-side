import { FC } from 'react'
import { Link, pathnames } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import ThemeSwitch from '../ThemeSwitch'
import LangSwitcher from '../LangSwitcher'

interface Props {
  isMobileMenuOpen: boolean
  closeAllMenus: () => void
  locale: string
  isLogin: boolean
}

const MobileNavigation: FC<Props> = ({
  isMobileMenuOpen,
  closeAllMenus,
  locale,
  isLogin
}) => {
  const t = useTranslations('')

  return (
    <div
      className={`mobile-navigation border-border absolute  right-0 top-full z-40 w-40 border-b bg-background-secondary shadow-md sm:hidden ${
        isMobileMenuOpen ? '' : 'hidden'
      }`}
    >
      <div className='flex flex-col gap-4 px-4 py-2 text-sm'>
        <Link href={`/conferences`} locale={locale}>
          {t('Conferences')}
        </Link>
        <Link href={`/journals`} locale={locale}>
          {t('Journals')}
        </Link>
        <Link href={`/chatbot`} locale={locale}>
          {t('Chatbot')}
        </Link>
        <Link href={`/support`} locale={locale}>
          {t('Support')}
        </Link>

        <Link href={`/addconference`} locale={locale}>
          {t('Add_Conference')}
        </Link>

        {isLogin ? (
          <>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'profile' } }}
              locale={locale}
            >
              {t('Profile')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'myconferences' } }}
              locale={locale}
            >
              {t('My_Conferences')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'followed' } }}
              locale={locale}
            >
              {t('Followed')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'note' } }}
              locale={locale}
            >
              {t('Note')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'notifications' } }}
              locale={locale}
            >
              {t('Notifications')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'setting' } }}
              locale={locale}
            >
              {t('Setting')}
            </Link>
          </>
        ) : (
          <>
            <Link href={`/auth/login`} locale={locale}>
              {t('Login')}
            </Link>
            <Link href={`/auth/register`} locale={locale}>
              {t('Register')}
            </Link>
          </>
        )}
      </div>
      {isLogin ? null : (
        <>
          <ThemeSwitch />
          <LangSwitcher />
        </>
      )}
    </div>
  )
}

export default MobileNavigation
