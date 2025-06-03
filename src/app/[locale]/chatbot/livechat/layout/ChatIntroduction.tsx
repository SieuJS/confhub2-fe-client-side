// src/app/[locale]/chatbot/livechat/layout/ChatIntroduction.tsx
import React from 'react'
import { useTranslations } from 'next-intl'

interface ChatIntroductionProps {
  onStartVoice: () => void
}

const ChatIntroduction: React.FC<ChatIntroductionProps> = ({
  onStartVoice
}) => {
  const t = useTranslations()

  return (
    <div
      id='ChatIntroduction'
      className='flex h-full flex-col items-center justify-center'
    >
      <h2 className='mb-4 text-center text-2xl font-bold lg:text-4xl '>
        {' '}
        {/* Reduced heading size */}
        {t('Live_Chat_with_Our_Chatbot')}
      </h2>
      <p className='mb-12 text-center  text-lg lg:text-xl '>
        {' '}
        {/* Reduced text size and changed color */}
        {t('Engage_in_a_realtime_conversation_with_our_chatbot_using_voice')}
      </p>
    </div>
  )
}

export default ChatIntroduction
