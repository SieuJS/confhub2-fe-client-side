// src/components/layout/sidepanel/SidePanelHeader.tsx
import React from 'react'
import { Link } from '@/src/navigation'
import { House, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SidePanelHeaderProps {
  onClose: () => void
}

const SidePanelHeader: React.FC<SidePanelHeaderProps> = ({ onClose }) => {
  const t = useTranslations()

  return (
    <nav className='flex-shrink-0 border-b border-gray-200 pb-4'>
      <div className='flex flex-shrink-0 items-center justify-between'>
        <Link
          href='/'
          className='group flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700'
        >
          <House
            stroke='currentColor'
            className='h-5 w-5 text-gray-400 group-hover:text-blue-600'
            size={20}
            strokeWidth={1.75}
          />
          <span>{t('Home')}</span>
        </Link>
        <button
          onClick={onClose}
          className='flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
          title='Close settings'
          aria-label='Close settings'
        >
          <X
            size={20}
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-5 w-5'
            aria-hidden='true'
          />
          <span className='sr-only'>{t('Close_settings')}</span>
        </button>
      </div>
    </nav>
  )
}

export default SidePanelHeader
