import { FC, memo } from 'react';
import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/src/navigation';
import ThemeSwitch from '../ThemeSwitch';
import LangSwitcher from '../LangSwitcher';
import Button from '../../utils/Button'; // Sửa đường dẫn import nếu cần

interface Props {
  locale: string;
}

const DesktopNavigationComponent: FC<Props> = ({ locale }) => {
  const t = useTranslations('');
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Giả sử href có dạng /conferences, pathname có dạng /en/conferences
    const targetPath = href === '/' ? `/${locale}` : `/${locale}${href}`;
    return pathname === targetPath || (href !== '/' && pathname.startsWith(targetPath));
  };

  return (
    // THAY ĐỔI Ở ĐÂY: Thay lg:inline-flex thành xl:inline-flex
    <nav className='mr-2 hidden gap-0 xl:inline-flex xl:items-center xl:justify-center xl:gap-0 xl:text-sm xl:font-semibold'>
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

const DesktopNavigation = memo(DesktopNavigationComponent);
export default DesktopNavigation;