// src/app/[locale]/support/VideoModal.tsx
'use client'

import React from 'react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string | null
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoId
}) => {
  if (!isOpen || !videoId) {
    return null
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-4xl rounded-lg bg-black'
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute -top-10 right-0 z-10 text-white hover:text-gray-300'
          aria-label='Close video player'
        >
          <svg
            className='h-8 w-8'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        {/* THAY ĐỔI Ở ĐÂY: Thêm 'z-0' để nâng khối video lên trên nền đen */}
        <div className='aspect-w-16 aspect-h-9 z-0'>
          <iframe
            src={embedUrl}
            title='YouTube video player'
            frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            className='absolute left-0 top-0 h-full w-full'
          ></iframe>
        </div>
      </div>
    </div>
  )
}

export default VideoModal
