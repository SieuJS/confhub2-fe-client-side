// src/app/[locale]/chatbot/LeftPanelExternalToggleButton.tsx
'use client'

import React from 'react'
import { Menu } from 'lucide-react' // Icon cho nút mở
import { useUiStore } from './stores'
import { useShallow } from 'zustand/react/shallow'
import { useTranslations } from 'next-intl'

const LeftPanelExternalToggleButton: React.FC = () => {
  const t = useTranslations()
  const { isLeftPanelOpen, setLeftPanelOpen } = useUiStore(
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      setLeftPanelOpen: state.setLeftPanelOpen
    }))
  )

  // Nút này CHỈ hiển thị trên mobile VÀ khi LeftPanel đang đóng.
  // Trên desktop, PanelToggleButton bên trong LeftPanel đã đảm nhiệm vai trò này.
  if (isLeftPanelOpen) {
    return null // Không render nút nếu panel đang mở
  }

  return (
    <button
      onClick={() => setLeftPanelOpen(true)}
      // md:hidden: Nút này chỉ hiển thị trên màn hình nhỏ hơn breakpoint 'md' (mobile)
      // fixed top-4 left-4: Cố định vị trí ở góc trên bên trái
      // z-50: Đảm bảo nút nằm trên các phần tử khác
      className='fixed left-4 top-4 z-50 rounded-full bg-white-pure p-2 shadow-md transition-all duration-300 ease-in-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 md:hidden'
      title={t('Open_navigation')}
      aria-label={t('Open_navigation')}
    >
      <Menu size={20} strokeWidth={1.5} />
    </button>
  )
}

export default LeftPanelExternalToggleButton
