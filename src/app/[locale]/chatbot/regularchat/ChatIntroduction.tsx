// src/app/[locale]/chatbot/chat/ChatIntroduction.tsx
import React, { useEffect, useState, useRef } from 'react'
// Import Language instead of Language
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types'

interface IntroductionContent {
  greeting: string
  description: string
  suggestions: string[]
}

// --- Interface cho cấu trúc dữ liệu người dùng ---
interface UserData {
  id: string // Thêm một trường bắt buộc để kiểm tra tính hợp lệ cơ bản
  firstName: string
  lastName: string
  email: string
  // Thêm các thuộc tính khác nếu bạn cần truy cập chúng
}

// Use Language as the key type for introductions
const introductions: Record<Language, IntroductionContent> = {
  en: {
    greeting: 'Hello',
    description:
      "I'm a chatbot assistant for finding conference information. Ask a question or choose a suggestion below to get started:",
    suggestions: [
      'List some AI conferences in Asia.',
      'Find Big Data conferences this year.',
      'I want to know about blockchain conferences in Europe.'
    ]
  },
  vi: {
    greeting: 'Xin chào',
    description:
      'Tôi là chatbot hỗ trợ tìm kiếm thông tin về các hội nghị. Hãy đặt câu hỏi hoặc chọn một trong số các câu hỏi gợi ý sau để bắt đầu:',
    suggestions: [
      'Liệt kê cho tôi một vài hội nghị về lĩnh vực AI tổ chức tại châu Á.',
      'Tìm các hội nghị về Big Data trong năm nay.',
      'Tôi muốn biết về các hội nghị blockchain tại châu Âu.'
    ]
  },
  zh: {
    greeting: '你好',
    description:
      '我是会议信息查询聊天机器人助手。您可以提问或选择下面的建议开始：',
    suggestions: [
      '列出亚洲的一些人工智能会议。',
      '查找今年的大数据会议。',
      '我想了解欧洲的区块链会议。'
    ]
  }
}

interface ChatIntroductionProps {
  onSuggestionClick: (suggestion: string) => void
  language: Language // The prop type is Language
}

const ChatIntroductionDisplay: React.FC<ChatIntroductionProps> = ({
  onSuggestionClick,
  language
}) => {
  const [isClient, setIsClient] = useState(false)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const redirectTimerIdRef = useRef<NodeJS.Timeout | null>(null)
  // Select content based on the Language, fallback to 'en'
  const content = introductions[language] || introductions['en']

  useEffect(() => {
    setIsClient(true)
    // --- Đọc chuỗi JSON từ localStorage khi component mount ---
    // Không cần kiểm tra và hiển thị lỗi ở đây, việc kiểm tra sẽ diễn ra khi click link
    try {
      const storedUserJSON = localStorage.getItem('user')
      if (storedUserJSON) {
        const userData: UserData = JSON.parse(storedUserJSON)
        if (userData && userData.firstName) {
          setFirstName(userData.firstName)
        }
        if (userData && userData.lastName) {
          setLastName(userData.lastName)
        }
      }
    } catch (error) {
      console.error(
        'Lỗi khi parse dữ liệu người dùng từ localStorage lúc mount:',
        error
      )
      // Không cần xóa dữ liệu lỗi ở đây vội, sẽ xóa khi click link nếu cần
    }

    // Cleanup function để clear timeout khi component unmount
    return () => {
      if (redirectTimerIdRef.current) {
        clearTimeout(redirectTimerIdRef.current)
        redirectTimerIdRef.current = null
      }
    }
  }, []) // Dependency rỗng đảm bảo chạy 1 lần sau mount ở client

  return (
    // - `p-6` -> `p-4 sm:p-6`
    // - `mb-4` -> `mb-3 sm:mb-4`
    <div className='mb-3 rounded-lg border border-blue-100  p-4 text-center dark:border-blue-800 dark:bg-gray-700 sm:mb-4 sm:p-6'>
      {/* - `text-xl` -> `text-lg sm:text-xl` */}
      {/* - `mb-2` -> `mb-1.5 sm:mb-2` */}
      <h2 className='mb-1.5 text-lg font-semibold  sm:mb-2 sm:text-xl'>
        {content.greeting}{' '}
        {(firstName || lastName) && (
          <strong className='bg-span-bg bg-clip-text text-transparent'>
            {firstName} {lastName}
          </strong>
        )}
      </h2>
      {/* - `text-sm` có thể giữ nguyên. */}
      {/* - `mb-4` -> `mb-3 sm:mb-4` */}
      <p className='mb-3 text-sm  sm:mb-4'>{content.description}</p>
      {/* - `gap-2` có thể giữ nguyên hoặc `gap-1.5 sm:gap-2` */}
      {/* - Cho phép các nút xuống dòng tự nhiên */}
      <div className='flex flex-wrap justify-center gap-1.5 sm:gap-2'>
        {content.suggestions.map((text, index) => (
          // - `px-3 py-1 text-sm` -> `px-2.5 py-1 text-xs sm:px-3 sm:text-sm`
          <button
            key={index}
            onClick={() => onSuggestionClick(text)}
            className='dark:hover:0 rounded-2xl border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium  transition-colors duration-150 hover:border-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200 sm:px-3 sm:text-sm'
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatIntroductionDisplay
