"use client";
import React from 'react';
import Image from 'next/image';
import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';


const AIBanner: React.FC = () => {
  const t = useTranslations('');
  return (
    <div className="text-white h-screen flex flex-col justify-center items-center overflow-hidden relative">

      {/* Background Image */}
      <Image
        src="/banner.png"
        alt="Background Image"
        fill
        quality={100}
        className="z-0"
        style={{ objectFit: 'cover' }}  // Moved objectFit to the style prop
      />

      {/* Navigation Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
        <div className="flex items-center">
          <Link href="/">
            <button className="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {t('Home')}
            </button>
          </Link>
          {/* <button className="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4">
            Document
          </button> */}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">{t('Name_Chatbot')}</h1>
        <p className="text-lg mb-8">{t('Slogan_Chatbot')}</p>
        <div className="flex justify-center gap-4">
          <Link href="/chatbot/chat">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {t('Chat_now')}
            </button>
          </Link>
          <Link href="/chatbot/livechat">
            <button className="border border-white hover:border-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center">
              {t('Live_chat')} <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AIBanner;