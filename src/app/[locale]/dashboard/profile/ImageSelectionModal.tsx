import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react' // Import Lucide X icon

interface ImageSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  title: string
  options: string[]
  gridCols?: string
  aspectRatio?: string
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  options,
  gridCols = 'grid-cols-3 sm:grid-cols-4',
  aspectRatio = 'aspect-square'
}) => {
  const t = useTranslations('')

  if (!isOpen) return null

  const isAvatar = aspectRatio === 'aspect-square'

  return (
    <div className='animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-2xl rounded-xl bg-background p-6 shadow-2xl dark:bg-gray-800'>
        <div className='flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700'>
          <h2 className='text-xl font-semibold '>{t(title)}</h2>
          <button
            onClick={onClose}
            className=' transition-colors hover:text-gray-60 '
          >
            <X className='h-6 w-6' /> {/* Using Lucide X icon */}
          </button>
        </div>
        <div className={`mt-6 grid gap-4 ${gridCols}`}>
          {options.map((imageUrl: string) => (
            <button
              key={imageUrl}
              onClick={() => {
                onSelect(imageUrl)
                onClose()
              }}
              className={`relative ${aspectRatio} overflow-hidden shadow-sm transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isAvatar ? 'rounded-full' : 'rounded-lg'}`}
            >
              <Image
                src={imageUrl}
                alt='Image Option'
                fill
                style={{ objectFit: 'cover' }}
                sizes='(max-width: 640px) 33vw, 25vw'
                className={isAvatar ? 'rounded-full' : ''}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageSelectionModal
