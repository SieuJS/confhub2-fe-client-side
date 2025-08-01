// src/components/FeatureTutorials/FeatureTutorials.tsx

import React from 'react'

// Định nghĩa kiểu dữ liệu cho một video hướng dẫn
interface Tutorial {
  id: string // ID duy nhất cho key của React
  title: string
  description: string
  youtubeUrl: string
}

// Định nghĩa kiểu dữ liệu cho props của component
interface FeatureTutorialsProps {
  tutorials: Tutorial[]
  title?: string // Tiêu đề chính, có thể tùy chỉnh
}

/**
 * Hàm tiện ích để lấy Video ID từ một URL YouTube bất kỳ.
 * Hỗ trợ các định dạng: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
 * @param url - Đường dẫn URL của video YouTube
 * @returns Video ID hoặc null nếu không tìm thấy
 */
const getYouTubeVideoId = (url: string): string | null => {
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

// Component chính
const FeatureTutorials: React.FC<FeatureTutorialsProps> = ({
  tutorials,
  title = 'Hướng dẫn sử dụng tính năng'
}) => {
  if (!tutorials || tutorials.length === 0) {
    return (
      <div className='rounded-lg bg-gray-100 p-8 text-center '>
        <h2 className='mb-2 text-2xl font-bold text-gray-800 '>{title}</h2>
        <p className='text-gray-600 '>Hiện chưa có video hướng dẫn nào.</p>
      </div>
    )
  }

  return (
    <div className='bg-gray-10 px-4 py-12  sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <h2 className='mb-12 text-center text-3xl font-extrabold text-gray-900 '>
          {title}
        </h2>

        <div className='grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {tutorials.map(tutorial => {
            const videoId = getYouTubeVideoId(tutorial.youtubeUrl)

            return (
              <div
                key={tutorial.id}
                className='transform overflow-hidden rounded-lg bg-white shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-2 '
              >
                {videoId && (
                  <div className='relative'>
                    <a
                      href={tutorial.youtubeUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <img
                        // Sử dụng thumbnail chất lượng cao của YouTube
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
                    </a>
                  </div>
                )}

                <div className='p-6'>
                  <h3 className='mb-2 text-xl font-semibold text-gray-900 '>
                    {tutorial.title}
                  </h3>
                  <p className='mb-4 h-20 overflow-hidden text-gray-600 '>
                    {tutorial.description}
                  </p>
                  <a
                    href={tutorial.youtubeUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  >
                    <svg
                      className='mr-2 h-5 w-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                      <path
                        fillRule='evenodd'
                        d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Xem Video
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FeatureTutorials
