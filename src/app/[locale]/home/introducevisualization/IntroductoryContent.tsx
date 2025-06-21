// src/app/[locale]/home/introducevisualization/IntroductoryContent.tsx

import React from 'react';
import { Link } from '@/src/navigation';

// Bỏ import TranslationFunction
// import { TranslationFunction } from '@/src/hooks/home/types'

interface IntroductoryContentProps {
  // Đơn giản hóa kiểu ở đây
  t: (key: string) => string;
}

const IntroductoryContent: React.FC<IntroductoryContentProps> = ({ t }) => {
  return (
    <div className='text-center lg:w-1/2 lg:text-left'>
      <h2
        id='visualization-intro-heading'
        className='mb-4 text-3xl font-bold md:text-4xl'
      >
        {t('heading')} {/* Lỗi sẽ biến mất */}
      </h2>
      <p className='mb-6 text-lg leading-relaxed'>{t('description')}</p>
      <Link
        href={`/visualization`}
        className='group inline-flex items-center justify-center rounded-lg bg-button px-6 py-3 font-semibold text-button-text shadow-md transition duration-150 ease-in-out hover:bg-button focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        aria-label={t('buttonAriaLabel')}
      >
        <span>{t('buttonText')}</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M17 8l4 4m0 0l-4 4m4-4H3'
          />
        </svg>
      </Link>
    </div>
  );
};

export default IntroductoryContent;