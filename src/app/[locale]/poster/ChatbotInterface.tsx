// ChatbotInterface.tsx
'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown' // BƯỚC 1: IMPORT REACT-MARKDOWN

const ChatbotInterface: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)

  // Dữ liệu chat giả lập, đã thêm 1 tin nhắn của AI
  const chatMessages = [
    {
      sender: 'user',
      text: 'List some AI conferences in Asia.'
    },
    {
      sender: 'ai',
      text: 'Of course! Here are some upcoming AI conferences in Asia:\n1. **ICONIP 2024** - International Conference on Neural Information Processing (Bali, Indonesia)\n2. **ACML 2024** - Asian Conference on Machine Learning (Hanoi, Vietnam)\n3. **PAKDD 2025** - Pacific-Asia Conference on Knowledge Discovery and Data Mining (Bangkok, Thailand)'
    },
    {
      sender: 'user',
      text: 'Tell me more about ACML 2024.'
    },
    {
      sender: 'ai', // TIN NHẮN MỚI CỦA AI
      text: "Certainly! The **Asian Conference on Machine Learning (ACML) 2024** is a premier event for machine learning researchers in the Asia-Pacific region.\n\n*   **Location:** Hanoi, Vietnam\n*   **Focus:** It covers a wide range of topics from core ML theory to applications in computer vision, NLP, and robotics.\n*   **Key Feature:** It's known for its high-quality tutorials and workshops, providing great learning opportunities."
    }
  ]

  return (
    <div className='flex h-full w-full overflow-hidden rounded-[31px] bg-[#f0f4f9] font-sans text-gray-800 shadow-2xl ring-1 ring-gray-200'>
      {/* Sidebar (Cột Trái) - Không đổi */}
      <aside className='flex w-[30%] flex-shrink-0 flex-col border-r border-gray-200 bg-white p-[47px]'>
        <nav className='flex flex-col space-y-[16px]'>
          <a
            href='#'
            className='flex items-center space-x-[24px] rounded-[16px] p-[24px] text-[48px] text-gray-600 hover:bg-gray-100'
          >
            <span className='text-[52px]'>🏠</span>
            <span>Home</span>
          </a>
          <a
            href='#'
            className='flex items-center space-x-[24px] rounded-[16px] bg-[#eef4ff] p-[24px] text-[48px] font-semibold text-[#3b82f6]'
          >
            <span className='text-[52px]'>💬</span>
            <span>Regular Chat</span>
          </a>
          <a
            href='#'
            className='flex items-center space-x-[24px] rounded-[16px] p-[24px] text-[48px] text-gray-600 hover:bg-gray-100'
          >
            <span className='text-[52px]'>📡</span>
            <span>Live Stream</span>
          </a>
          <a
            href='#'
            className='flex items-center space-x-[24px] rounded-[16px] p-[24px] text-[48px] text-gray-600 hover:bg-gray-100'
          >
            <span className='text-[52px]'>🕒</span>
            <span>Chat History</span>
          </a>
        </nav>
        <hr className='my-[47px]' />
        <div className='flex flex-col space-y-[31px]'>
          <div className='flex items-center justify-between'>
            <h3 className='text-[44px] font-semibold text-gray-500'>
              Chat History
            </h3>
            <button className='flex items-center space-x-2 text-[44px] text-blue-500 hover:underline'>
              <span>+</span>
              <span>New Chat</span>
            </button>
          </div>
          <div className='space-y-[31px]'>
            <div className='cursor-pointer text-[44px] text-gray-700 hover:text-blue-600'>
              <p>Cuộc trò chuyện mới</p>
              <p className='text-[40px] text-gray-400'>2 days ago</p>
            </div>
            <div className='cursor-pointer text-[44px] text-gray-700 hover:text-blue-600'>
              <p>Cuộc trò chuyện mới</p>
              <p className='text-[40px] text-gray-400'>2 days ago</p>
            </div>
          </div>
        </div>
        <div className='mt-auto'>
          <div className='mt-[47px] rounded-[16px] border-l-4 border-yellow-400 bg-yellow-50 p-[31px] text-[40px] text-yellow-800'>
            <p className='font-bold'>Disclaimer:</p>
            <p>Models may make mistakes, so double-check outputs.</p>
          </div>
          <div className='mt-[31px] flex items-center space-x-[24px] border-t border-gray-200 pt-[31px]'>
            <img
              src='/user_avatar.png'
              alt='User Avatar'
              className='h-[80px] w-[80px] rounded-full bg-gray-300'
            />
            <span className='text-[48px] font-semibold'>User</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Window (Cột Giữa) */}
      <main className='flex flex-1 flex-col bg-[#f0f4f9]'>
        <header className='flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white p-[31px]'>
          <div className='flex items-center space-x-[16px] text-[44px]'>
            <span className='relative flex h-[20px] w-[20px]'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75'></span>
              <span className='relative inline-flex h-[20px] w-[20px] rounded-full bg-green-500'></span>
            </span>
            <span className='text-gray-500'>Connected</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className='cursor-pointer text-[60px] hover:text-blue-500'
          >
            ⚙️
          </button>
        </header>

        {/* Message List */}
        <div className='flex-1 space-y-[47px] overflow-y-auto p-[62px]'>
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <img
                  src='/bot_avatar.png'
                  alt='AI Avatar'
                  className='h-[70px] w-[70px] flex-shrink-0 rounded-full bg-gray-400'
                />
              )}
              {/* BƯỚC 2: SỬ DỤNG REACTMARKDOWN ĐỂ RENDER TIN NHẮN */}
              <div
                className={`max-w-[75%] rounded-[24px] p-[31px] ${msg.sender === 'user' ? 'rounded-br-none bg-blue-500 text-white' : 'rounded-bl-none bg-white text-gray-800 shadow-sm'}`}
              >
                <div
                  className={`prose prose-2xl max-w-none ${msg.sender === 'user' ? 'prose-invert' : ''}`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
              {msg.sender === 'user' && (
                <img
                  src='/user_avatar.png'
                  alt='User Avatar'
                  className='h-[70px] w-[70px] flex-shrink-0 rounded-full bg-gray-300'
                />
              )}
            </div>
          ))}
        </div>

        <footer className='flex-shrink-0 border-t border-gray-200 bg-white p-[31px]'>
          <div className='flex items-center space-x-[31px] rounded-full border border-gray-300 p-[16px] focus-within:ring-2 focus-within:ring-blue-400'>
            <span className='cursor-pointer pl-[16px] text-[60px]'>📎</span>
            <input
              type='text'
              placeholder='Type message or @currentpage ...'
              className='flex-1 bg-transparent text-[48px] outline-none'
            />
            <button className='pr-[16px] text-[60px] text-gray-400 hover:text-blue-500'>
              ➤
            </button>
          </div>
        </footer>
      </main>

      {/* Settings Sidebar (Cột Phải) */}
      {isSettingsOpen && (
        // BƯỚC 3: THAY ĐỔI CHIỀU RỘNG TỪ w-[35%] THÀNH w-[28%]
        <aside className='flex w-[28%] flex-shrink-0 flex-col border-l border-gray-200 bg-white p-[47px]'>
          <div className='mb-[62px] flex items-center justify-between'>
            <h3 className='text-[60px] font-bold'>Settings</h3>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className='cursor-pointer text-[60px] hover:text-red-500'
            >
              ❌
            </button>
          </div>
          <div className='space-y-[62px]'>
            <div className='flex items-center justify-between'>
              <label className='text-[48px] text-gray-700'>
                Stream Response
              </label>
              <div className='relative h-[60px] w-[120px] cursor-pointer rounded-full bg-blue-500 p-[8px]'>
                <div
                  className='absolute h-[44px] w-[44px] rounded-full bg-white'
                  style={{ transform: 'translateX(60px)' }}
                ></div>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <label className='text-[48px] text-gray-700'>
                Personalize Responses
              </label>
              <div className='relative h-[60px] w-[120px] cursor-pointer rounded-full bg-blue-500 p-[8px]'>
                <div
                  className='absolute h-[44px] w-[44px] rounded-full bg-white'
                  style={{ transform: 'translateX(60px)' }}
                ></div>
              </div>
            </div>
            <div>
              <label className='mb-[16px] block text-[48px] text-gray-700'>
                Chat Model
              </label>
              <div className='flex w-full cursor-pointer items-center justify-between rounded-[16px] border border-gray-300 p-[24px] text-[48px]'>
                <div className='flex items-center space-x-[24px]'>
                  <span className='text-[52px]'>🧠</span>
                  <span>Mercury</span>
                </div>
                <span>▼</span>
              </div>
            </div>
            <div>
              <label className='mb-[16px] block text-[48px] text-gray-700'>
                Response language
              </label>
              <div className='flex w-full cursor-pointer items-center justify-between rounded-[16px] border border-gray-300 p-[24px] text-[48px]'>
                <div className='flex items-center space-x-[24px]'>
                  {/* === ĐÂY LÀ THAY ĐỔI DUY NHẤT === */}
                  <img
                    src='/country_flags/gb.svg' // Đường dẫn đến file icon trong thư mục public
                    alt='UK Flag'
                    className='h-[48px] w-auto rounded-[4px]' // Điều chỉnh kích thước nếu cần
                  />
                  <span>English</span>
                </div>
                <span>▼</span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

export default ChatbotInterface
