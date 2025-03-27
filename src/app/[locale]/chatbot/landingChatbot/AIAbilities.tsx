// Đảm bảo component này là Client Component nếu dùng App Router
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

const AIAbilities = () => {
  const t = useTranslations('AIAbilities')

  // Không cần lấy mảng nữa

  return (
    <div className='flex flex-col items-center gap-8 bg-gray-900 p-4 text-white sm:p-8'>
      {/* Row 1 */}
      <div className='flex w-full max-w-6xl flex-wrap justify-center gap-8'>
        {/* EASE OF USE */}
        <div className='flex w-full flex-col rounded-lg bg-gray-800 p-6 shadow-md md:flex-1 lg:min-w-[400px]'>
          <h3 className='mb-2 text-lg font-semibold text-blue-400'>
            {t('easeOfUse.category')}
          </h3>
          <h2 className='mb-4 text-2xl font-semibold text-white'>
            {t('easeOfUse.headline')}
          </h2>
          <p className='mb-4 flex-grow text-sm text-gray-400'>
            {t('easeOfUse.description')}
          </p>
          {/* Ghi trực tiếp các thẻ div, sử dụng index trong key */}
          <div className='mt-auto flex flex-wrap gap-2'>
            <div className='rounded-md border border-gray-700 bg-gray-700/30 p-2 text-xs font-medium text-gray-300'>
              {t('easeOfUse.exampleTexts.0')}
            </div>
            <div className='rounded-md border border-gray-700 bg-gray-700/30 p-2 text-xs font-medium text-gray-300'>
              {t('easeOfUse.exampleTexts.1')}
            </div>
            <div className='rounded-md border border-gray-700 bg-gray-700/30 p-2 text-xs font-medium text-gray-300'>
              {t('easeOfUse.exampleTexts.2')}
            </div>
            <div className='rounded-md border border-gray-700 bg-gray-700/30 p-2 text-xs font-medium text-gray-300'>
              {t('easeOfUse.exampleTexts.3')}
            </div>
            {/* Thêm hoặc bớt các div này nếu số lượng ví dụ thay đổi */}
          </div>
        </div>

        {/* EFFICIENCY */}
        <div className='flex w-full flex-col rounded-lg bg-gray-800 p-6 shadow-md md:flex-1 lg:min-w-[350px]'>
          <h3 className='mb-2 text-lg font-semibold text-blue-400'>
            {t('efficiency.category')}
          </h3>
          <h2 className='mb-4 text-2xl font-semibold text-white'>
            {t('efficiency.headline')}
          </h2>
          <p className='mb-4 flex-grow text-sm text-gray-400'>
            {t('efficiency.description')}
          </p>
          <div className='mt-auto rounded-md border border-gray-700 bg-gray-700/30 p-3'>
            <h4 className='mb-1 text-sm font-medium text-gray-300'>
              {t('efficiency.exampleTitle')}
            </h4>
            <p className='whitespace-pre-line text-xs text-gray-400'>
              {t('efficiency.exampleDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className='flex w-full max-w-6xl flex-wrap justify-center gap-8'>
        {/* QUALITY */}
        <div className='flex w-full flex-col rounded-lg bg-gray-800 p-6 shadow-md md:flex-1 lg:min-w-[350px]'>
          <h3 className='mb-2 text-lg font-semibold text-blue-400'>
            {t('quality.category')}
          </h3>
          <h2 className='mb-4 text-2xl font-semibold text-white'>
            {t('quality.headline')}
          </h2>
          <p className='mb-4 flex-grow text-sm text-gray-400'>
            {t('quality.description')}
          </p>
          <div className='mt-auto rounded-md bg-gray-700 p-3 text-xs italic text-gray-300'>
            {t('quality.quote')}
          </div>
        </div>

        {/* INNOVATION */}
        <div className='flex w-full flex-col rounded-lg bg-gray-800 p-6 shadow-md md:flex-1 lg:min-w-[400px]'>
          <h3 className='mb-2 text-lg font-semibold text-blue-400'>
            {t('innovation.category')}
          </h3>
          <h2 className='mb-4 text-2xl font-semibold text-white'>
            {t('innovation.headline')}
          </h2>
          <p className='mb-4 flex-grow text-sm text-gray-400'>
            {t('innovation.description')}
          </p>
          {/* Ghi trực tiếp các thẻ button, sử dụng index trong key */}
          <div className='mt-auto flex flex-wrap gap-2'>
            <button className='rounded-md bg-gray-700 px-3 py-1.5 text-xs text-gray-300 transition duration-150 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'>
              {t('innovation.buttons.0')}
            </button>
            <button className='rounded-md bg-gray-700 px-3 py-1.5 text-xs text-gray-300 transition duration-150 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'>
              {t('innovation.buttons.1')}
            </button>
            <button className='rounded-md bg-gray-700 px-3 py-1.5 text-xs text-gray-300 transition duration-150 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'>
              {t('innovation.buttons.2')}
            </button>
            <button className='rounded-md bg-gray-700 px-3 py-1.5 text-xs text-gray-300 transition duration-150 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'>
              {t('innovation.buttons.3')}
            </button>
            {/* Thêm hoặc bớt các button này nếu số lượng nút thay đổi */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAbilities
