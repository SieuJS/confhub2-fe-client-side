// components/Header/components/MobileNavigation.tsx
import { FC } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'

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
      className={`border-border absolute left-0 right-0 top-full z-40 border-b bg-background-secondary shadow-md sm:hidden ${
        isMobileMenuOpen ? '' : 'hidden'
      }`}
    >
      <div className='flex flex-col p-4'>
        <Link
          lang={locale}
          href={`/conferences`}
          onClick={closeAllMenus}
          className='hover:bg-button/10 py-2'
        >
          {t('Conferences')}
        </Link>
        <Link
          lang={locale}
          href={`/journals`}
          onClick={closeAllMenus}
          className='hover:bg-button/10 py-2'
        >
          {t('Journals')}
        </Link>
        <Link
          lang={locale}
          href={`/chatbot`}
          onClick={closeAllMenus}
          className='hover:bg-button/10 py-2'
        >
          {t('Chatbot')}
        </Link>
        <Link
          lang={locale}
          href={`/support`}
          onClick={closeAllMenus}
          className='hover:bg-button/10 py-2'
        >
          {t('Support')}
        </Link>
        <Link
          lang={locale}
          href={`/addconference`}
          onClick={closeAllMenus}
          className='hover:bg-button/10 py-2'
        >
          {t('Add_Conference')}
        </Link>

        {isLogin ? null : (
          <>
            <Link
              lang={locale}
              href={`/auth/login`}
              onClick={closeAllMenus}
              className='hover:bg-button/10 py-2'
            >
              {t('Login')}
            </Link>
            <Link
              lang={locale}
              href={`/auth/register`}
              onClick={closeAllMenus}
              className='hover:bg-button/10 py-2'
            >
              {t('Register')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default MobileNavigation
