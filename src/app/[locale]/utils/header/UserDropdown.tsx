// components/Header/components/UserDropdown.tsx
import { FC, useState, useEffect } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'

// --- Thêm interface cho cấu trúc dữ liệu người dùng (tùy chọn nhưng nên có) ---
interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  // Thêm các thuộc tính khác nếu bạn cần truy cập chúng
  // ...
}
// --- Kết thúc thêm interface ---

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
  const [isClient, setIsClient] = useState(false)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const t = useTranslations('')

  useEffect(() => {
    setIsClient(true)
    try {
      // --- Đọc chuỗi JSON từ localStorage ---
      // !!! QUAN TRỌNG: Thay 'user' bằng key chính xác bạn đã sử dụng để lưu trữ !!!
      const storedUserJSON = localStorage.getItem('user')

      if (storedUserJSON) {
        // Parse chuỗi JSON thành đối tượng JavaScript
        const userData: UserData = JSON.parse(storedUserJSON) // Sử dụng interface UserData

        // Kiểm tra và lấy firstName, lastName từ đối tượng đã parse
        if (userData && userData.firstName) {
          setFirstName(userData.firstName)
        }
        if (userData && userData.lastName) {
          setLastName(userData.lastName)
        }
      } else {
        // Xử lý trường hợp không tìm thấy dữ liệu user trong localStorage
        console.warn(
          "Không tìm thấy dữ liệu người dùng trong localStorage với key 'user'."
        )
      }
    } catch (error) {
      // Xử lý lỗi nếu dữ liệu trong localStorage không phải là JSON hợp lệ
      console.error('Lỗi khi parse dữ liệu người dùng từ localStorage:', error)
      // Có thể đặt lại state thành null nếu parse lỗi
      setFirstName(null)
      setLastName(null)
    }
  }, []) // Dependency rỗng đảm bảo chạy 1 lần sau mount ở client

  return (
    <>
      {isClient && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800 ${
            isUserDropdownOpen ? '' : 'hidden'
          }`}
          aria-labelledby='user-menu-button'
        >
          {/* Hiển thị lời chào */}
          {(firstName || lastName) && (
            <div className='border-b border-gray-200 px-2 py-2 text-sm  '>
              {' '}
              {/* Tăng padding và thêm border */}
              {t('Hello')}{' '}
              <strong className='text-button'>
                {firstName} {lastName}
              </strong>{' '}
              {/* In đậm tên */}
            </div>
          )}

          <div className='flex flex-col py-1'>
            {' '}
            {/* Bỏ gap-1 nếu muốn sát nhau hơn */}
            {/* Các Link menu */}
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'profile' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={closeAllMenus}
            >
              {t('Profile')}
            </Link>
            {/* ... (các Link khác tương tự) ... */}
            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'myconferences' }
              }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={closeAllMenus}
            >
              {t('My_Conferences')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'followed' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={closeAllMenus}
            >
              {t('Followed')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'note' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={closeAllMenus}
            >
              {t('Note')}
            </Link>
            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'notifications' }
              }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={closeAllMenus}
            >
              {t('Notifications')}
            </Link>
            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'blacklisted' }
              }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={closeAllMenus}
            >
              {t('Blacklisted')}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'setting' } }}
              locale={locale}
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={closeAllMenus}
            >
              {t('Setting')}
            </Link>
            {/* Đường kẻ phân cách trước Logout */}
            <hr className='my-1 border-gray-200 dark:border-gray-700' />
            {/* Logout Button */}
            <button
              onClick={async () => {
                await logout()
                if (socketRef.current) {
                  socketRef.current.disconnect()
                }
                // Xóa dữ liệu user khỏi localStorage khi logout
                localStorage.removeItem('user') // !!! Dùng đúng key bạn đã lưu !!!
                setFirstName(null) // Reset state
                setLastName(null) // Reset state
                closeAllMenus()
              }}
              className='block w-full px-2 py-2 text-left text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700' // Thêm màu đỏ cho logout
            >
              {t('Logout')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default UserDropdown
