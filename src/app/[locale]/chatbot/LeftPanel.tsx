// src/app/[locale]/chatbot/LeftPanel.tsx
import React, { useState, useEffect, useRef } from 'react' // Import hooks cần thiết
import ConversationList from './regularchat/ConversationList'
import { useUiStore, useConversationStore, useSettingsStore } from './stores'
import { useShallow } from 'zustand/react/shallow'
import {
  useLeftPanelNavigation,
  NavItem
} from '@/src/hooks/chatbot/useLeftPanelNavigation'
import NavigationMenu from './NavigationMenu'
import PanelToggleButton from './PanelToggleButton'
// --- Nhập hook useAuthApi để kiểm tra trạng thái đăng nhập và lấy thông tin user, logout ---
import useAuthApi from '../../../hooks/auth/useAuthApi'
// --- Nhập component UserIcon để hiển thị avatar ---
import { UserIcon } from '../utils/header/Icon' // Đảm bảo đường dẫn đúng
// --- Nhập useTranslations, useRouter và usePathname ---
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation' // Đã thêm usePathname
// --- Nhập Link từ next-intl/link để tạo nút Login ---
import { Link } from '@/src/navigation' // assuming this is next-intl Link

// Interface cho cấu trúc dữ liệu người dùng lưu trong localStorage (tham khảo từ UserDropdown.tsx)
interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string // Có thể có hoặc không có avatar
}

interface LeftPanelProps {
  onSelectConversation: (conversationId: string) => void
  onStartNewConversation: () => void
  onDeleteConversation: (conversationId: string) => void
  currentView: 'chat' | 'history'
  isLiveServiceConnected?: boolean
  deletingConversationId: string | null
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  onSelectConversation,
  onStartNewConversation,
  onDeleteConversation,
  currentView,
  isLiveServiceConnected,
  deletingConversationId
}) => {
  // --- Sử dụng các hooks ---
  const { isLoggedIn, logout } = useAuthApi() // Lấy isLoggedIn và hàm logout
  const t = useTranslations('') // Để dịch text
  const router = useRouter() // Để chuyển hướng (cho logout)
  const pathname = usePathname() // Lấy đường dẫn hiện tại

  // --- States ---
  const { isLeftPanelOpen, toggleLeftPanel } = useUiStore(
    // State của panel
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      toggleLeftPanel: state.toggleLeftPanel
    }))
  )
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false) // State của dropdown avatar
  const [firstName, setFirstName] = useState<string | null>(null) // State lưu firstName
  const [lastName, setLastName] = useState<string | null>(null) // State lưu lastName
  const [isClient, setIsClient] = useState(false) // State kiểm tra đã mount ở client chưa

  // --- Refs để xử lý click outside ---
  const dropdownRef = useRef<HTMLDivElement>(null) // Ref cho dropdown
  const avatarButtonRef = useRef<HTMLButtonElement>(null) // Ref cho button avatar
  // Ref cho nút Login (không cần thiết cho click outside trong trường hợp này, nhưng có thể hữu ích)
  const loginButtonRef = useRef<HTMLAnchorElement>(null)

  // --- Hooks từ Store (không đổi) ---
  const {
    conversationList,
    activeConversationId,
    isLoadingHistory,
    clearConversation,
    renameConversation,
    pinConversation
  } = useConversationStore(
    useShallow(state => ({
      conversationList: state.conversationList,
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      clearConversation: state.clearConversation,
      renameConversation: state.renameConversation,
      pinConversation: state.pinConversation
    }))
  )

  const { chatMode } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode
    }))
  )

  const { navItems } = useLeftPanelNavigation({
    currentView,
    isLiveServiceConnected
  })

  // Determine if the ConversationList should be shown (không đổi)
  const showConversationList =
    isLeftPanelOpen && currentView === 'chat' && chatMode !== 'live'

  // --- Effects ---

  // Effect để đọc tên người dùng từ localStorage chỉ chạy trên client
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      try {
        const storedUserJSON = localStorage.getItem('user')
        if (storedUserJSON) {
          const userData: UserData = JSON.parse(storedUserJSON)
          if (userData && userData.firstName) {
            setFirstName(userData.firstName)
          }
          if (userData && userData.lastName) {
            setLastName(userData.lastName)
          }
        }
      } catch (error) {
        console.error(
          'Lỗi khi parse dữ liệu người dùng từ localStorage trong LeftPanel:',
          error
        )
      }
    }
  }, []) // Chạy 1 lần sau mount ở client

  // Effect để xử lý click bên ngoài dropdown và button avatar
  useEffect(() => {
    if (!isClient) return // Chỉ chạy trên client

    const handleClickOutside = (event: MouseEvent) => {
      // Logic chỉ áp dụng khi user đã đăng nhập và dropdown mở
      if (isLoggedIn && isUserDropdownOpen) {
        // Kiểm tra nếu click KHÔNG nằm trong dropdown VÀ KHÔNG nằm trong button avatar
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          avatarButtonRef.current &&
          !avatarButtonRef.current.contains(event.target as Node)
        ) {
          setIsUserDropdownOpen(false) // Đóng dropdown
        }
      }
    }

    // Thêm event listener khi dropdown mở (chỉ xảy ra khi isLoggedIn)
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Cleanup function để xóa event listener khi component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserDropdownOpen, isClient, isLoggedIn]) // Thêm isLoggedIn vào dependency array

  // Effect để đóng dropdown khi panel bị toggle
  useEffect(() => {
    if (isUserDropdownOpen) {
      setIsUserDropdownOpen(false)
    }
  }, [isLeftPanelOpen]) // Chạy khi trạng thái isLeftPanelOpen thay đổi

  // Hàm xử lý toggle dropdown (gọi khi click vào button avatar)
  const handleAvatarClick = () => {
    setIsUserDropdownOpen(prev => !prev)
  }

  // Hàm xử lý logout
  const handleLogout = async () => {
    await logout() // Gọi hàm logout từ hook
    // Xóa dữ liệu user và tên khỏi state và localStorage
    localStorage.removeItem('user')
    setFirstName(null)
    setLastName(null)
    setIsUserDropdownOpen(false) // Đóng dropdown
    router.push('/') // Chuyển hướng về trang chủ (hoặc /login nếu muốn user phải login lại)
  }

  return (
    <div
      className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out  ${
        isLeftPanelOpen ? 'w-72' : 'w-16'
      }`}
      aria-hidden={!isLeftPanelOpen || undefined}
    >
      <div className='flex h-full w-full flex-col overflow-hidden'>
        {/* Phần đầu panel (nút toggle, menu) */}
        <div
          className={`flex flex-shrink-0 flex-col ${isLeftPanelOpen ? 'p-3' : 'space-y-1 p-2'}`}
        >
          <PanelToggleButton
            isPanelOpen={isLeftPanelOpen}
            onTogglePanel={toggleLeftPanel}
          />
          <NavigationMenu
            navItems={navItems}
            isLeftPanelOpen={isLeftPanelOpen}
          />
        </div>

        {/* Dòng kẻ phân cách chỉ hiện khi panel mở */}
        {isLeftPanelOpen && (
          <div className='mx-3 my-2 border-t border-gray-20 '></div>
        )}

        {/* Danh sách hội thoại (sử dụng flex-grow để chiếm không gian còn lại nếu cần) */}
        {showConversationList && (
          <ConversationList
            conversationList={conversationList}
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onStartNewConversation={onStartNewConversation}
            isLoading={isLoadingHistory}
            onDeleteConversation={onDeleteConversation}
            onClearConversation={clearConversation}
            onRenameConversation={renameConversation}
            onPinConversation={pinConversation}
            currentView={currentView}
            deletingConversationId={deletingConversationId}
          />
        )}

        {/* --- Khu vực dưới cùng: Avatar/Logout HOẶC Login --- */}
        {isClient && ( // Check isClient một lần cho toàn bộ khu vực
          // Container chung ở dưới cùng
          <div
            className={`relative mt-auto flex items-center p-3 ${isLeftPanelOpen ? 'justify-start' : 'justify-center'}`}
          >
            {/* --- Render khi Đã Đăng nhập --- */}
            {isLoggedIn ? (
              <>
                {' '}
                {/* Sử dụng Fragment vì có nhiều hơn 1 root element */}
                {/* Button bao quanh UserIcon để nhận click */}
                <button
                  ref={avatarButtonRef} // Gán ref cho button
                  onClick={handleAvatarClick} // Handle click chỉ trên button này
                  className={`rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isLeftPanelOpen ? '' : '-m-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700'}`} // Thêm padding/margin và hover cho button khi panel đóng
                  aria-label={t('Toggle user menu')} // Thêm label cho accessibility
                >
                  <UserIcon /> {/* Component hình ảnh avatar */}
                </button>
                {/* Hiển thị tên chỉ khi panel mở */}
                {isLeftPanelOpen && (firstName || lastName) && (
                  <span className='ml-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white'>
                    {firstName} {lastName}
                  </span>
                )}
                {/* Dropdown Đăng xuất (positioned relative to the parent flex div) */}
                {isUserDropdownOpen && (
                  <div
                    ref={dropdownRef} // Gán ref cho dropdown
                    className={`absolute bottom-full z-50 mb-2 w-max rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800
                                  ${isLeftPanelOpen ? 'left-0' : 'left-0'}`}
                  >
                    {' '}
                    {/* Vị trí dropdown */}
                    <div className='flex flex-col py-1'>
                      {/* Button Đăng xuất */}
                      <button
                        onClick={handleLogout} // Sử dụng hàm xử lý logout
                        className='block w-full px-2 py-2 text-left text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
                      >
                        {t('Logout')} {/* Sử dụng translation */}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Sử dụng Link component đã import
              <Link
                ref={loginButtonRef} // Gán ref cho nút Login
                // Cấu hình href để bao gồm pathname hiện tại làm query param
                href={{
                  pathname: `/auth/login`,
                  query: { callbackUrl: pathname } // Thêm callbackUrl
                }}
                className={`group relative inline-flex items-center rounded-md bg-button px-2 py-2 text-sm font-semibold text-button-text shadow-md transition-colors duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-button`}
                // Link không cần onClick handler để điều hướng, nó xử lý tự động
              >
                {/* Icon Login (tham khảo từ AuthButtons.tsx) */}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#ffffff' // Màu icon trắng
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className={`lucide lucide-log-in ${isLeftPanelOpen ? 'mr-2' : ''}`} // Thêm margin-right khi panel mở
                >
                  <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' />
                  <polyline points='10 17 15 12 10 7' />
                  <line x1='15' x2='3' y1='12' y2='12' />
                </svg>
                {/* Text "Login" chỉ hiển thị khi panel mở */}
                {isLeftPanelOpen && t('Login')}
              </Link>
            )}
          </div>
        )}
        {/* --- Kết thúc Khu vực dưới cùng --- */}
      </div>
    </div>
  )
}

export default LeftPanel
