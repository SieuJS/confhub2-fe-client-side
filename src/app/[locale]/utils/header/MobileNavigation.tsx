// components/Header/components/MobileNavigation.tsx
import { FC } from 'react';
import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';

interface Props {
  isMobileMenuOpen: boolean;
  closeAllMenus: () => void;
  locale: string;
  isLogin: boolean;
}

const MobileNavigation: FC<Props> = ({ isMobileMenuOpen, closeAllMenus, locale, isLogin }) => {
  const t = useTranslations('');
  return (
    <div
      className={`border-border absolute left-0 right-0 top-full z-40 border-b bg-background-secondary shadow-md sm:hidden ${
        isMobileMenuOpen ? '' : 'hidden'
      }`}
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
            <Link lang={locale} href={`/auth/register`} onClick={closeAllMenus}>
              <div className='hover:bg-button/10 py-2'>{t('Register')}</div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNavigation;