import { FC, useState, useEffect } from 'react'; // <--- Import thêm useState, useEffect
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
  isLogin, // Giá trị này có thể không nhất quán ban đầu
}) => {
  const t = useTranslations('');
  const [isClient, setIsClient] = useState(false); // <--- Thêm state để biết đã ở client chưa

  useEffect(() => {
    // Effect này chỉ chạy ở client sau khi component mount lần đầu
    setIsClient(true);
  }, []); // Mảng dependency rỗng đảm bảo chỉ chạy 1 lần sau mount

  return (
    <div
      className={`mobile-navigation border-border absolute right-0 top-full z-40 w-40 border-b bg-background-secondary shadow-md sm:hidden ${
        isMobileMenuOpen ? '' : 'hidden'
      }`}
      // Có thể thêm suppressHydrationWarning ở đây nếu muốn, nhưng giải pháp useEffect tốt hơn
      // suppressHydrationWarning={true}
    >
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
        {/* Nếu bạn có link cho người đã login, cũng bọc trong isClient */}
        {/* {isClient && isLogin && ( <Link href="/profile">Profile</Link> )} */}

      </div>

      {/* Tương tự, chỉ render ThemeSwitch/LangSwitcher ở client nếu chúng chỉ dành cho người chưa login */}
      {isClient && (
        <div className='flex items-center justify-around border-t border-border px-4 py-2'> {/* Bọc lại cho đẹp */}
          <ThemeSwitch />
          <LangSwitcher />
        </div>
      )}
       {/* Nếu ThemeSwitch/LangSwitcher luôn hiển thị bất kể login, bỏ isClient && !isLogin đi */}
       {/* Ví dụ:
       {isClient && (
         <div className='flex items-center justify-around border-t border-border px-4 py-2'>
           <ThemeSwitch />
           <LangSwitcher />
         </div>
       )}
       */}
    </div>
  );
};

export default MobileNavigation;