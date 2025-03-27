// components/Header/components/UserDropdown.tsx
import { FC, useState, useEffect } from 'react' // Import useState và useEffect
import { Link } from '@/src/navigation'
import ThemeSwitch from '../../utils/ThemeSwitch'
import LangSwitcher from '../../utils/LangSwitcher'
import { useMediaQuery } from 'react-responsive'
import { useTranslations } from 'next-intl'

interface Props {
  isUserDropdownOpen: boolean
  closeAllMenus: () => void
  locale: string
  logout: () => Promise<void>
  socketRef: React.MutableRefObject<any>
}

const UserDropdown: FC<Props> = ({
  isUserDropdownOpen,
  closeAllMenus,
  locale,
  logout,
  socketRef
}) => {
  const [isClient, setIsClient] = useState(false) // State để biết đã chạy ở client chưa
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const t = useTranslations('')

  // useEffect chỉ chạy ở client SAU lần render đầu tiên
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      {isClient && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800 ${
            isUserDropdownOpen ? '' : 'hidden'
          }`}
          aria-labelledby='user-menu-button'
        >
          <div className='flex flex-col gap-1 py-1'>
            {isMobile ? null : (
              <Link href='/dashboard' lang={locale} onClick={closeAllMenus}>
                <div className='block px-4 py-2 text-sm  hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700'>
                  {t('Dashboard')}
                </div>
              </Link>
            )}

            {/* Chỉ render phần mobile khi đã ở client VÀ isMobile là true */}
            {isClient && isMobile && (
              <>
                {/* --- Các Link cho mobile --- */}
                <Link
                  href={{ pathname: `/dashboard`, query: { tab: 'profile' } }}
                  locale={locale}
                  // Thêm style hoặc class nếu cần
                  className='block px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  {t('Profile')}
                </Link>
                <Link
                  href={{
                    pathname: `/dashboard`,
                    query: { tab: 'myconferences' }
                  }}
                  locale={locale}
                  className='block px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  {t('My_Conferences')}
                </Link>
                <Link
                  href={{ pathname: `/dashboard`, query: { tab: 'followed' } }}
                  locale={locale}
                  className='block px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  {t('Followed')}
                </Link>
                <Link
                  href={{ pathname: `/dashboard`, query: { tab: 'note' } }}
                  locale={locale}
                  className='block px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  {t('Note')}
                </Link>
                <Link
                  href={{
                    pathname: `/dashboard`,
                    query: { tab: 'notifications' }
                  }}
                  locale={locale}
                  className='block px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  {t('Notifications')}
                </Link>
                <Link
                  href={{ pathname: `/dashboard`, query: { tab: 'setting' } }}
                  locale={locale}
                  className='block px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  {t('Setting')}
                </Link>
                {/* --- Hết các Link cho mobile --- */}
              </>
            )}

            <div className=' '>
              {' '}
              {/* Bọc trong div để có padding như các Link */}
              <ThemeSwitch />
            </div>
            <div className=''>
              {' '}
              {/* Bọc trong div để có padding như các Link */}
              <LangSwitcher />
            </div>

            <Link
              onClick={async () => {
                await logout()
                if (socketRef.current) {
                  socketRef.current.disconnect()
                }
                closeAllMenus()
              }}
              href='/'
              lang={locale}
            >
              <div className='block w-full px-4 py-2 text-left text-sm  hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700'>
                {t('Logout')}
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default UserDropdown
