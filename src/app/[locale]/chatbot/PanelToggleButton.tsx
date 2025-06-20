// src/app/[locale]/chatbot/PanelToggleButton.tsx
import React from 'react'
import { X, AlignJustify } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PanelToggleButtonProps {
  isPanelOpen: boolean
  onTogglePanel: () => void
  disabled?: boolean // <<<< THÊM PROP DISABLED >>>>
}

const PanelToggleButton: React.FC<PanelToggleButtonProps> = ({
  isPanelOpen,
  onTogglePanel,
  disabled = false // <<<< GIÁ TRỊ MẶC ĐỊNH >>>>
}) => {
  const t = useTranslations()
  const commonButtonInteractiveClasses =
    'rounded-md text-gray-60 hover:bg-gray-100 hover:text-gray-90 0 dark:hover:bg-gray-800  focus:outline-none focus:ring-2 focus:ring-blue-500'
  const iconOnlyButtonBaseClasses = 'h-12 w-12 justify-center p-2'
  const expandedButtonBaseClasses = 'px-3 py-2.5 text-sm font-medium'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <div
      className={`${isPanelOpen ? 'mb-3 flex items-center justify-between' : 'flex justify-center'}`}
    >
      <button
        onClick={onTogglePanel}
        disabled={disabled} // <<<< SỬ DỤNG PROP DISABLED >>>>
        className={`flex items-center
          ${isPanelOpen ? `${expandedButtonBaseClasses} ${commonButtonInteractiveClasses}` : `${iconOnlyButtonBaseClasses} ${commonButtonInteractiveClasses}`}
          ${isPanelOpen ? 'w-auto' : 'w-full'}
          ${disabledClasses} // <<<< ÁP DỤNG CLASS KHI DISABLED >>>>
        `}
        title={isPanelOpen ? t('Close_panel') : t('Open_panel')}
        aria-label={isPanelOpen ? t('Close_panel') : t('Open_panel')}
        aria-expanded={isPanelOpen}
      >
        {isPanelOpen ? (
          <>
            <span className='flex-grow text-lg font-semibold'>
              {/* Optional: Menu Title if needed */}
            </span>
            <X size={20} className='ml-auto h-5 w-5' aria-hidden='true' />
          </>
        ) : (
          <AlignJustify size={24} className='h-6 w-6' aria-hidden='true' />
        )}
      </button>
    </div>
  )
}

export default PanelToggleButton
