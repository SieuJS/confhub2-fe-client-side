// src/components/SuperBanner.tsx

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/src/navigation' // Đảm bảo đường dẫn này chính xác

// --- Animation Variants (Chỉ còn lại container và item) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}
// --- Kết thúc Variants ---

const SuperBanner: React.FC = () => {
  const t = useTranslations('')
  const backgroundImageUrl = '/world.svg' // Đường dẫn tới file SVG trong public

  return (
    <motion.section
      // Giữ nguyên gradient nền tĩnh từ theme
      className='bg-span-gradient relative flex h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-button-text sm:px-2 lg:px-4'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Bọc div map bằng motion.div để animate opacity */}
      <motion.div
        className='absolute inset-0 z-0' // Container cho background map
        initial={{ opacity: 0.1 }} // Opacity ban đầu hơi thấp
        animate={{ opacity: [0.1, 0.2, 0.1] }} // Thay đổi opacity: thấp -> cao -> thấp
        transition={{
          duration: 12, // Thời gian cho một chu kỳ opacity (tăng nhẹ)
          repeat: Infinity, // Lặp lại vô hạn
          ease: 'easeInOut' // Kiểu chuyển động mượt mà
        }}
        aria-hidden='true'
      >
        {/* Div con để áp dụng background image và các thuộc tính */}
        <div
          className='h-full w-full bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        ></div>
      </motion.div>

      {/* Lớp phủ gradient nhẹ (Giữ nguyên) */}
      <div
        className='pointer-events-none absolute inset-0 z-[1]'
        style={{
          background:
            'linear-gradient(to top, rgba(51, 51, 102, 0.4), transparent, rgba(9, 127, 165, 0.1))'
        }}
        aria-hidden='true'
      ></div>

      {/* Optional: Background elements (Blobs) - Giữ nguyên */}
      <motion.div
        className='absolute left-0 top-0 z-[5] h-32 w-32 -translate-x-1/4 -translate-y-1/4 rounded-full bg-white/10 opacity-40 blur-xl filter'
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className='absolute bottom-0 right-0 z-[5] h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-white/10 opacity-40 blur-xl filter'
        animate={{ scale: [1, 1.1, 1], rotate: [0, -180, -360] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
          delay: 2
        }}
      />

      {/* Content chính */}
      <div className='relative z-10 mx-0 max-w-6xl text-center'>
        {/* H1 with Framer Motion hover */}
        <motion.h1
          className='mb-5 cursor-pointer text-4xl font-extrabold tracking-tight text-button sm:text-5xl md:text-6xl lg:text-7xl' // Thêm cursor-pointer
          variants={itemVariants}
          style={{ textShadow: '0 2px 4px var(--logo-shadow)' }} // Shadow cơ bản
          whileHover={{
            scale: 1.05, // Phóng to
            textShadow: '0 4px 8px var(--logo-shadow)', // Làm shadow đậm hơn/lan rộng hơn
            transition: { duration: 0.3, ease: 'easeOut' } // Chuyển động mượt hơn
          }}
        >
          {t('Slogan_Website')}
        </motion.h1>

        <motion.p
          className='mx-0 mb-10 max-w-6xl text-lg text-button opacity-90 sm:text-xl md:text-2xl'
          variants={itemVariants}
          style={{ textShadow: '0 1px 3px var(--logo-shadow)' }}
        >
          {t('Slogan_Website_describe')}
        </motion.p>

        <motion.div
          className='flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6'
          variants={itemVariants}
        >
          {/* Button Conferences - Tailwind hover/active */}
          <Link href='/conferences' passHref legacyBehavior={false}>
            <motion.button
              className='w-full transform rounded-lg bg-button px-8 py-3 font-semibold text-button-text shadow-md transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-button 
                         focus:ring-offset-2 focus:ring-offset-primary sm:w-auto' // Added transition for transform
              // Keep Framer Motion for smooth scaling
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('Search_Conferences')}
            </motion.button>
          </Link>

          {/* Button Journals - Tailwind hover/active */}
          <Link href='/journals' passHref legacyBehavior={false}>
            <motion.button
              className='w-full transform rounded-lg border-2 border-button-text bg-transparent px-8 py-3 font-semibold text-button-text shadow-sm transition-all duration-200 ease-in-out hover:bg-button-text hover:text-secondary 
                         focus:outline-none focus:ring-2 
                         focus:ring-button-text focus:ring-offset-primary sm:w-auto' // Added hover classes & transition-all
              // Keep Framer Motion for smooth scaling
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('Search_Journals')}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default SuperBanner
