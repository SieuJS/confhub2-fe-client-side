"use client";

import React from 'react';
import Image from 'next/image';
import Button from '../utils/Button';
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import { useTheme } from 'next-themes'; // Import useTheme from next-themes

const Banner: React.FC = () => {
  const t = useTranslations('');
  const { theme } = useTheme(); // Use the useTheme hook to get the current theme

  // Determine the image source based on the theme
  const imageSrc = theme === 'dark' ? '/2.png' : '/light.jpg'; // Assuming you have '3-dark.png' for dark mode

  return (
    <section className="py-0 h-screen relative w-full">
      <Image
        src={imageSrc} // Sử dụng nguồn ảnh động
        alt="Banner Background"
        fill={true} // Đặt fill={true} thay vì layout="fill"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        className="transition-opacity duration-500 ease-in-out h-full w-full" // Thêm w-full để đảm bảo lấp đầy container
      />
      <div className="container relative z-20 flex items-center  flex-col  justify-center py-24">
        <h1 className='text-center text-7xl font-extrabold leading-tight mt-4'>
          Find{' '}
          <span className='bg-span-bg bg-clip-text text-transparent'>
            Conferences{' '}
          </span>
          for{' '}
          <span className='bg-span-bg bg-clip-text text-transparent'>
            All Kinds
          </span>

        </h1>
        <div className='my-2 px-20 text-center text-2xl text-text-secondary'>
          
            Search Worldwide for Conferences and Journals - Find Your Perfect Event or Publication Here.
          
        </div>

        {/* <div className='py-12'></div> */}
        <div className='mt-2 flex flex-row gap-4'>
          <Link href={`/conferences`}>
            <Button rounded size='large' advanced advancedDivColor="p-8">
              {t('Search_Conferences')}
            </Button>
          </Link>
          <div className="py-8">
            <Link href={`/journals`}>
              <Button rounded size='large' variant='secondary'>
              {t('Search_Journals')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;