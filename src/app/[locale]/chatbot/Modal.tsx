// src/app/[locale]/chatbot/Modal.tsx
import React, { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode // Optional footer for buttons
  size?: 'sm' | 'md' | 'lg' | '4xl' // Optional size
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    '4xl': 'max-w-4xl'
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out'
      onClick={onClose} // Close on overlay click
      aria-modal='true'
      role='dialog'
    >
      <div
        className={`transform rounded-lg bg-white-pure shadow-xl transition-all duration-300 ease-in-out ${sizeClasses[size]} m-4 w-full sm:m-6`}
        onClick={e => e.stopPropagation()} // Prevent close when clicking inside modal
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-20 px-6 py-4'>
          <h3 className='text-lg font-semibold '>{title}</h3>
          <button
            onClick={onClose}
            className=' focus:outline-none'
            aria-label='Close modal'
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-4 text-sm leading-relaxed '>{children}</div>

        {/* Footer */}
        {footer && (
          <div className='flex justify-end space-x-3 rounded-b-lg border-t border-gray-20 bg-gray-10 px-6 py-3'>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
