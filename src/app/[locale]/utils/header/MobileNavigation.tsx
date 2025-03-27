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
  isLogin,
}) => {
  const t = useTranslations('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ---- Đảm bảo không có gì ở giữa đây ----

  return (
    <div
      className={`mobile-navigation border-border absolute right-0 top-full z-40 w-40 border-b bg-background-secondary shadow-md sm:hidden ${isMobileMenuOpen ? '' : 'hidden'
        }`}
    // suppressHydrationWarning // Nếu cần, đặt nó làm prop của div
    >
      {/* Render ThemeSwitch/LangSwitcher ở client */}
      {/* Bọc chúng trong một div để layout tốt hơn nếu cần */}
      {isClient && (
        <div> {/* Optional wrapper */}
          <ThemeSwitch />
          <LangSwitcher />
        </div>
      )}

      <div className='flex flex-col gap-4 px-4 py-2 text-sm'>
        {/* Các link này không phụ thuộc isLogin, nên giữ nguyên */}
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

        {/* Chỉ render phần này sau khi đã chắc chắn ở client */}
        {isClient && !isLogin && (
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


    </div>
  );
};

export default MobileNavigation;