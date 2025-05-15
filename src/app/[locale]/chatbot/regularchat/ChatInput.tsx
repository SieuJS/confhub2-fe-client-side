// src/app/[locale]/chatbot/chat/ChatInput.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Button from '../../utils/Button' // If using a custom component
import { GrSend } from 'react-icons/gr'
import { useTranslations } from 'next-intl'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  // Changed prop name to match parent
  onRegisterFillFunction: (fillFunc: (text: string) => void) => void
  disabled?: boolean
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onRegisterFillFunction, // Use the new prop name
  disabled = false
}) => {
  const t = useTranslations()

  const [inputValue, setInputValue] = useState<string>('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Register the fill function with the parent using the correct prop
  useEffect(() => {
    const fillFunc = (text: string) => {
      if (!disabled) {
        setInputValue(text)
        // Trigger resize after setting value programmatically
        setTimeout(
          () =>
            inputRef.current?.dispatchEvent(
              new Event('input', { bubbles: true })
            ),
          0
        )
        inputRef.current?.focus()
      }
    }
    onRegisterFillFunction(fillFunc) // Register the function
  }, [onRegisterFillFunction, disabled]) // Dependency array updated

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!disabled) {
        setInputValue(e.target.value)
        // TextareaAutosize handles resizing automatically on input event
      }
    },
    [disabled]
  )

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = inputValue.trim()
    if (!disabled && trimmedMessage) {
      onSendMessage(trimmedMessage)
      setInputValue('')
      // Reset height explicitly after sending might be needed with TextareaAutosize
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }, [inputValue, onSendMessage, disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
      // Shift+Enter for newline is default textarea behavior
    },
    [handleSendMessage, disabled]
  )

  return (
    // - `px-2 py-1` -> `px-1.5 py-0.5 sm:px-2 sm:py-1` cho container input
    <div className='flex w-full items-end rounded-2xl bg-white px-1 py-0.5 shadow-sm transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:bg-gray-700 dark:focus-within:border-blue-400'>
      <TextareaAutosize
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? t('Disconnect')
            : // Giảm độ dài placeholder trên mobile nếu cần
              t('Type_message_short') // Tạo một key translation mới cho placeholder ngắn hơn
          // hoặc sử dụng class để ẩn/hiện phần dài hơn:
          // t('Type_message') + <span class="hidden sm:inline"> Shift+Enter for new line</span>
        }
        // - `p-2` -> `p-1.5 sm:p-2`
        // - `text-sm` có thể giữ nguyên hoặc `text-xs sm:text-sm`
        className={`
           max-h-28 flex-grow resize-none overflow-y-auto rounded-2xl
          bg-transparent px-1.5 py-1 text-sm text-gray-800
          focus:border-transparent focus:outline-none disabled:cursor-not-allowed
          disabled:bg-gray-100 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-600
        `}
        rows={1}
        disabled={disabled}
      />

      {/* - Nút gửi có thể cần điều chỉnh size hoặc padding trên mobile */}
      <Button
        variant='primary'
        size='mini' // Có thể dùng 'icon' hoặc 'small'
        rounded={true}
        onClick={handleSendMessage}
        disabled={disabled || !inputValue.trim()}
        aria-label={t('Send_message')} // Sử dụng key translation
        className='mb-0.5 ml-1.5 flex-shrink-0 ' // Điều chỉnh padding cho nút
      >
        <GrSend size={12} className='h-4 w-4' /> {/* Kích thước icon */}
      </Button>
    </div>
  )
}

export default ChatInput
