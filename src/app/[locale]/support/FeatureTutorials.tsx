// src/app/[locale]/support/FeatureTutorials.tsx
'use client' // Component này giờ có state nên cần 'use client'

import React, { useState } from 'react'
import VideoModal from './VideoModal' // Import component modal vừa tạo

// ... (giữ nguyên interface Tutorial và hàm getYouTubeVideoId)
interface Tutorial {
  id: string
  title: string
  description: string
  youtubeUrl: string
}

interface FeatureTutorialsProps {
  tutorials: Tutorial[]
  title?: string
}

const getYouTubeVideoId = (url: string): string | null => {
  // ... (giữ nguyên hàm này)
  try {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  } catch (error) {
    console.error('Error parsing YouTube URL:', error)
    return null
  }
}

// Component chính đã được cập nhật
const FeatureTutorials: React.FC<FeatureTutorialsProps> = ({
  tutorials,
  title = 'Hướng dẫn sử dụng tính năng'
}) => {
  // State để lưu ID của video đang được chọn và quản lý việc mở/đóng modal
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  const openModal = (videoId: string) => {
    setSelectedVideoId(videoId)
  }

  const closeModal = () => {
    setSelectedVideoId(null)
  }

  if (!tutorials || tutorials.length === 0) {
    // ... (giữ nguyên phần này)
    return (
      <div className='rounded-lg bg-gray-100 p-8 text-center '>
        <h2 className='mb-2 text-2xl font-bold text-gray-800 '>{title}</h2>
        <p className='text-gray-600 '>
          Do not have any tutorial videos available.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='bg-gray-10 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <h2 className='mb-12 text-center text-3xl font-extrabold text-gray-900 '>
            {title}
          </h2>

          <div className='grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {tutorials.map(tutorial => {
              const videoId = getYouTubeVideoId(tutorial.youtubeUrl)

              if (!videoId) return null // Bỏ qua nếu không lấy được videoId

              return (
                <div
                  key={tutorial.id}
                  className='transform overflow-hidden rounded-lg bg-white shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-2 '
                >
                  {/* Thay thế <a> bằng <button> hoặc <div> có onClick */}
                  <div
                    className='relative cursor-pointer'
                    onClick={() => openModal(videoId)}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt={tutorial.title}
                      className='h-48 w-full object-cover'
                    />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 transition-opacity duration-300 hover:opacity-100'>
                      <svg
                        className='h-16 w-16 text-white'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  </div>

                  <div className='p-6'>
                    <h3 className='mb-2 text-xl font-semibold text-gray-900 '>
                      {tutorial.title}
                    </h3>
                    <p className='mb-4 h-20 overflow-hidden text-gray-600 '>
                      {tutorial.description}
                    </p>
                    {/* Thay đổi nút "Watch Video" */}
                    <button
                      onClick={() => openModal(videoId)}
                      className='inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                    >
                      <svg
                        className='-ml-1 mr-2 h-5 w-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Watch Video
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Render Modal ở đây */}
      <VideoModal
        isOpen={!!selectedVideoId}
        onClose={closeModal}
        videoId={selectedVideoId}
      />
    </>
  )
}

export default FeatureTutorials
