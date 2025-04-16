// components/Header/components/DesktopNavigation.tsx
import { FC } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import ThemeSwitch from '../ThemeSwitch'
import LangSwitcher from '../LangSwitcher'
import Button from '../Button'

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
    <nav className='mr-2 hidden gap-0 lg:inline-flex lg:items-center lg:justify-center lg:gap-0  lg:text-sm lg:font-semibold'>
      <Link
        lang={locale}
        href={`/conferences`}
        className={`group relative mx-2  font-semibold md:mx-4 ${isActive('/conferences') ? 'text-selected' : ''}`}
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
        className={`group relative mx-2  font-semibold md:mx-4 ${isActive('/journals') ? 'text-selected' : ''}`}
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
        href={`/visualization`}
        className={`group relative mx-2  font-semibold md:mx-4 ${isActive('/visualization') ? 'text-selected' : ''}`}
      >
        {/* Loại bỏ div */}
        {t('Visualization')}
        <span
          className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-selected transition-transform duration-300 ${
            isActive('/visualization')
              ? 'scale-x-100'
              : 'scale-x-0 group-hover:scale-x-100'
          }`}
        ></span>
      </Link>

      <Link
        lang={locale}
        href={`/chatbot`}
        className={`group relative mx-2  font-semibold md:mx-4 ${isActive('/chatbot') ? 'text-selected' : ''}`}
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
        className={`group relative mx-2  font-semibold md:mx-4 ${isActive('/support') ? 'text-selected' : ''}`}
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

export default DesktopNavigation
