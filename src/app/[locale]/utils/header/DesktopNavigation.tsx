// components/Header/components/DesktopNavigation.tsx (SỬA FILE)

import { FC, memo } from 'react'; // Import memo
import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/src/navigation';
import ThemeSwitch from '../ThemeSwitch';
import LangSwitcher from '../LangSwitcher';
import Button from '../Button';

interface Props {
  locale: string;
}

// Component gốc
const DesktopNavigationComponent: FC<Props> = ({ locale }) => {
  const t = useTranslations('');
  const pathname = usePathname(); // Hook này không gây re-render khi state khác thay đổi

  // Sửa logic isActive để xử lý đúng locale
  const isActive = (href: string) => {
    // pathname từ next/navigation sẽ có dạng /en/conferences
    return pathname === `/${locale}${href}`;
  };


  return (
    <nav className='mr-2 hidden gap-0 lg:inline-flex lg:items-center lg:justify-center lg:gap-0  lg:text-sm lg:font-semibold'>
      <Link
        href={`/conferences`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/conferences`) ? 'text-button' : ''}`}
      >
        {t('Conferences')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/conferences')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/journals`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/journals`) ? 'text-button' : ''}`}
      >
        {t('Journals')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/journals')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/visualization`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/visualization`) ? 'text-button' : ''}`}
      >
        {t('Visualization.Visualization')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/visualization')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/chatbot/landing`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/chatbot`) ? 'text-button' : ''} inline-flex items-center`}
      >
        {t('Chatbot.Chatbot')}
        <span className='ml-1 shrink-0 rounded bg-button px-1.5 py-0.5 text-xs font-semibold text-button-text'>
          {t('NEW')}
        </span>
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/chatbot')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/support`}
        className={`group relative mx-2 font-semibold transition-colors duration-300 ease-in-out hover:text-button md:mx-4 ${isActive(`/support`) ? 'text-button' : ''}`}
      >
        {t('Support')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-button transition-transform duration-300 ease-in-out ${
            isActive('/support')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link lang={locale} href={`/addconference`}>
        <Button
          className={`group relative mx-2 font-semibold md:mx-4`}
          variant='primary'
          size='small'
        >
          {t('Publish')}
        </Button>
      </Link>

      <div className=' font-semibold'>
        <ThemeSwitch />
      </div>
      <div className='font-semibold'>
        <LangSwitcher />
      </div>
    </nav>
  )
}

// Export phiên bản đã được memo-hóa
const DesktopNavigation = memo(DesktopNavigationComponent);
export default DesktopNavigation;
