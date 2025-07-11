'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/src/navigation';
import {
  containerVariants,
  itemVariants,
  countryCoordinates,
  exampleFlights,
} from '@/src/hooks/home/constants';
import WorldMap from './superbannerfor/WorldMap';

export default function SuperBannerFor() {
  const t = useTranslations('');
  const sloganText = t('Slogan_Website');

  // State để kiểm soát việc hiển thị hiệu ứng chuyến bay (màn hình >= 1024px)
  // const [showFlightEffect, setShowFlightEffect] = useState(true);
  // State để kiểm soát việc hiển thị nút tìm kiếm (màn hình < 1440px)
  const [showSearchButton, setShowSearchButton] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      // Logic cho hiệu ứng chuyến bay: hiển thị khi màn hình >= 1024px
      // setShowFlightEffect(window.innerWidth >= 1024);

      // Logic cho nút tìm kiếm: hiển thị khi màn hình < 1440px
      // (nghĩa là không hiển thị khi màn hình >= 1440px)
      setShowSearchButton(window.innerWidth < 1440);
    };

    // Gọi hàm kiểm tra lần đầu khi component mount
    checkScreenSize();

    // Thêm event listener cho sự kiện resize
    window.addEventListener('resize', checkScreenSize);

    // Dọn dẹp event listener khi component unmount
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []); // [] đảm bảo useEffect chỉ chạy một lần khi mount và dọn dẹp khi unmount

  return (
    <motion.section
      className='bg-span-gradient relative flex h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-button-text sm:px-2 lg:px-4'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <div className='absolute inset-0 z-0'>
        <WorldMap
          flights={exampleFlights}
          coordinates={countryCoordinates}
          className='h-full w-full object-cover opacity-70'
          aria-hidden='true'
          // showFlightEffect={showFlightEffect}
        />
      </div>

      {/* <DecorativeElements /> */}

      <div className='relative z-10 mx-0 flex max-w-6xl -translate-y-40 flex-col items-center text-center'>
        <motion.h1
          className='mb-4 text-center font-bold text-button drop-shadow-lg'
          style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)' }}
          variants={itemVariants}
        >
          {sloganText}
        </motion.h1>

        <motion.p
          className='mx-0 mb-8 max-w-7xl text-base font-semibold text-button opacity-90 sm:text-xl md:text-2xl'
          variants={itemVariants}
        >
          {t('Slogan_Website_describe')}
        </motion.p>

        {/* Điều kiện render nút tìm kiếm */}
        {showSearchButton && (
          <motion.div variants={itemVariants}>
            <Link href={`/conferences`}>
              <button className='hover:bg-primary-dark rounded-md bg-button px-6 py-3 font-bold text-button-text transition-colors'>
                {t('Search_Conferences')}
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}