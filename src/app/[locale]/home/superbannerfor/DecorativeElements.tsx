// src/components/SuperBannerFor/DecorativeElements.tsx
import React from 'react'
import { motion } from 'framer-motion'

const DecorativeElements: React.FC = () => {
  return (
    <>
      <motion.div
        className='absolute left-0 top-0 z-[5] h-32 w-32 -translate-x-1/4 -translate-y-1/4 rounded-full bg-white/10 opacity-40 blur-xl filter'
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
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
        aria-hidden="true"
      />
    </>
  )
}

export default DecorativeElements