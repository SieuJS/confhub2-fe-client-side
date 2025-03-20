// components/Header/components/DesktopNavigation.tsx
import { FC } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

interface Props {
  locale: string
}

const DesktopNavigation: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <nav className='mr-10 hidden gap-5 sm:inline-flex'>
      <Link
        lang={locale}
        href={`/conferences`}
        className={`group relative pt-2 font-semibold ${isActive('/conferences') ? 'text-selected' : ''}`}
      >
        {/* Loại bỏ div */}
        {t('Conferences')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
            isActive('/conferences')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/journals`}
        className={`group relative pt-2 font-semibold ${isActive('/journals') ? 'text-selected' : ''}`}
      >
        {/* Loại bỏ div */}
        {t('Journals')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
            isActive('/journals')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/chatbot`}
        className={`group relative  pt-2 font-semibold ${isActive('/chatbot') ? 'text-selected' : ''}`}
      >
        {/* Loại bỏ div */}
        {t('Chatbot')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
            isActive('/chatbot')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/support`}
        className={`group relative pt-2 font-semibold ${isActive('/support') ? 'text-selected' : ''}`}
      >
        {/* Loại bỏ div */}
        {t('Support')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
            isActive('/support')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>
      <Link
        lang={locale}
        href={`/addconference`}
        className={`group relative pt-2 font-semibold ${isActive('/addconference') ? 'text-selected' : ''}`}
      >
        {/* Loại bỏ div */}
        {t('Add_Conference')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
            isActive('/addconference')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>
    </nav>
  )
}

export default DesktopNavigation
