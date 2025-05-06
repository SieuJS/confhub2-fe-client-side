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
    // Apply Tailwind classes directly for layout and styling
    <div className='flex items-end space-x-2'>
      <TextareaAutosize
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? t('Processing')
            : t('Enter_message_Enter_to_send_Shift_Enter_to_go_to_new_line')
        }
        // Use className for Tailwind styling
        className={`
                    max-h-32 flex-grow resize-none overflow-y-auto rounded-lg border
                    border-gray-300 bg-white p-2 px-3
                    text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500
                    disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
                `}
        rows={1} // Start with one row, TextareaAutosize handles the rest
        disabled={disabled}
      />

      <Button
        variant='primary' // Or appropriate variant
        size='medium' // Or appropriate size
        rounded={true}
        onClick={handleSendMessage}
        disabled={disabled || !inputValue.trim()}
        aria-label='Gửi tin nhắn'
        className='my-1'
      >
        <GrSend />
      </Button>
    </div>
  )
}

export default ChatInput
