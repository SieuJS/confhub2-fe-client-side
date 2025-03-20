// components/Header/components/UserDropdown.tsx
import { FC } from 'react'
import { Link } from '@/src/navigation'
import ThemeSwitch from '../../utils/ThemeSwitch' // Assuming these are in the parent components folder
import LangSwitcher from '../../utils/LangSwitcher'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Button from '../Button'

interface Props {
  isUserDropdownOpen: boolean
  closeAllMenus: () => void
  locale: string
  setLoginStatus: (status: string | null) => void
  setUser: (user: any) => void
  socketRef: React.MutableRefObject<any>
}

const UserDropdown: FC<Props> = ({
  isUserDropdownOpen,
  closeAllMenus,
  locale,
  setLoginStatus,
  setUser,
  socketRef
}) => {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <div
      className={`absolute right-0 top-full z-50 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800 ${
        isUserDropdownOpen ? '' : 'hidden'
      }`}
      aria-labelledby='user-menu-button'
    >
      <div className='flex flex-col gap-1 py-1'>
        <Link href='/dashboard' lang={locale} onClick={closeAllMenus}>
          <div className='block px-4 py-2 text-sm  hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700'>
            Dashboard
          </div>
        </Link>
        <div className=' '>
          <ThemeSwitch />
        </div>
        <div className=' '>
          <LangSwitcher />
        </div>
        <button
          className='block w-full px-4 py-2 text-left text-sm  hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
          onClick={() => {
            setLoginStatus(null)
            setUser(null)
            let pathWithLocale = '/auth/login'
            if (socketRef.current) {
              socketRef.current.disconnect()
            }
            if (pathname) {
              const pathParts = pathname.split('/')
              if (pathParts.length > 1) {
                const localePrefix = pathParts[1]
                pathWithLocale = `/${localePrefix}/auth/login`
              }
            }

            router.push(pathWithLocale)
            closeAllMenus()
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default UserDropdown
