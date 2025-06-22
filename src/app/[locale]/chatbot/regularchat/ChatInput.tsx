// src/app/[locale]/chatbot/regularchat/ChatInput.tsx
import React, { useRef, useEffect, useCallback, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Button from '../../utils/Button'
import { GrSend } from 'react-icons/gr'
import {
  Paperclip,
  X as LucideX,
  FileText,
  ImageIcon,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePageContextStore } from '@/src/app/[locale]/chatbot/stores/pageContextStore'
import {
  CURRENT_PAGE_CONTEXT_COMMAND,
  CURRENT_PAGE_CONTEXT_SUGGESTION_KEY,
  CURRENT_PAGE_CONTEXT_INFO_TEXT_KEY,
  CURRENT_PAGE_CONTEXT_DISABLED_TEXT_KEY
} from '@/src/app/[locale]/chatbot/lib/constants'

// Import Modal component
import Modal from '@/src/app/[locale]/chatbot/Modal' // Đảm bảo đường dẫn đúng

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,application/pdf,text/csv'
const MAX_FILE_SIZE_MB = 50
const MAX_TOTAL_FILES = 5

interface ChatInputProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSendFilesAndMessage: (
    message: string,
    files: File[],
    shouldUsePageContext: boolean
  ) => void
  onRegisterFillFunction: (fillFunc: (text: string) => void) => void
  disabled?: boolean
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon size={24} className='' />
  if (mimeType === 'application/pdf')
    return <FileText size={24} className='text-blue-500 dark:text-blue-400' />
  return <Paperclip size={24} className='' />
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSendFilesAndMessage,
  onRegisterFillFunction,
  disabled = false
}) => {
  const t = useTranslations()
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State cho gợi ý context
  const [showContextSuggestions, setShowContextSuggestions] = useState(false)
  const [contextSuggestionMessage, setContextSuggestionMessage] = useState<
    string | null
  >(null)

  // State cho Modal thông báo lỗi
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const {
    isCurrentPageFeatureEnabled,
    isContextAttachedNextSend,
    toggleContextAttachedNextSend,
    resetContextAttachedNextSend
  } = usePageContextStore()

  useEffect(() => {
    const fillFunc = (text: string) => {
      if (!disabled) {
        onInputChange(text)
        if (
          text.includes(CURRENT_PAGE_CONTEXT_COMMAND) &&
          isCurrentPageFeatureEnabled
        ) {
          toggleContextAttachedNextSend(true)
        } else if (!text.includes(CURRENT_PAGE_CONTEXT_COMMAND)) {
          resetContextAttachedNextSend()
        }
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
    if (onRegisterFillFunction) {
      onRegisterFillFunction(fillFunc)
    }
  }, [
    onRegisterFillFunction,
    disabled,
    onInputChange,
    isCurrentPageFeatureEnabled,
    toggleContextAttachedNextSend,
    resetContextAttachedNextSend
  ])

  const handleInputChangeInternal = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (disabled) return
      const value = e.target.value
      onInputChange(value)

      if (value.endsWith('@') && isCurrentPageFeatureEnabled) {
        setShowContextSuggestions(true)
      } else {
        setShowContextSuggestions(false)
      }

      if (
        value.includes(CURRENT_PAGE_CONTEXT_COMMAND) &&
        isCurrentPageFeatureEnabled
      ) {
        toggleContextAttachedNextSend(true)
      } else if (
        !value.includes(CURRENT_PAGE_CONTEXT_COMMAND) &&
        isContextAttachedNextSend
      ) {
        resetContextAttachedNextSend()
      }
    },
    [
      disabled,
      onInputChange,
      isCurrentPageFeatureEnabled,
      toggleContextAttachedNextSend,
      resetContextAttachedNextSend,
      isContextAttachedNextSend
    ]
  )

  const handleSelectSuggestion = (suggestion: string) => {
    if (suggestion === CURRENT_PAGE_CONTEXT_COMMAND) {
      if (isCurrentPageFeatureEnabled) {
        const currentVal = inputValue.endsWith('@')
          ? inputValue.slice(0, -1)
          : inputValue
        const newVal =
          (currentVal.endsWith(' ') || currentVal === ''
            ? currentVal
            : currentVal + ' ') +
          CURRENT_PAGE_CONTEXT_COMMAND +
          ' '
        onInputChange(newVal)
        toggleContextAttachedNextSend(true)
        setContextSuggestionMessage(null)
      } else {
        setContextSuggestionMessage(t(CURRENT_PAGE_CONTEXT_DISABLED_TEXT_KEY))
        setTimeout(() => setContextSuggestionMessage(null), 3000)
      }
    }
    setShowContextSuggestions(false)
    inputRef.current?.focus()
  }

  // Hàm hiển thị Modal
  const showAlertDialog = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setIsModalOpen(true)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      let validFiles: File[] = []
      let alertShownForSize = false
      let alertShownForMaxFiles = false

      newFiles.forEach(file => {
        if (selectedFiles.length + validFiles.length >= MAX_TOTAL_FILES) {
          if (!alertShownForMaxFiles) {
            showAlertDialog(
              t('ChatInput_Error_Title_MaxFiles'), // Tiêu đề mới cho Modal
              t('ChatInput_Error_MaxFiles', { max: MAX_TOTAL_FILES })
            )
            alertShownForMaxFiles = true
          }
          return
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          if (!alertShownForSize) {
            showAlertDialog(
              t('ChatInput_Error_Title_FileSize'), // Tiêu đề mới cho Modal
              t('ChatInput_Error_FileSize', {
                name: file.name,
                maxSize: MAX_FILE_SIZE_MB
              })
            )
            alertShownForSize = true
          }
          return
        }
        validFiles.push(file)
      })

      setSelectedFiles(prevFiles =>
        [...prevFiles, ...validFiles].slice(0, MAX_TOTAL_FILES)
      )
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(prevFiles =>
      prevFiles.filter(file => file.name !== fileName)
    )
  }

  const handleSendMessageInternal = useCallback(() => {
    let messageToSend = inputValue.trim()
    let shouldUseContext = false
    let originalInputHadContextCommand = false

    if (isContextAttachedNextSend && isCurrentPageFeatureEnabled) {
      if (inputValue.includes(CURRENT_PAGE_CONTEXT_COMMAND)) {
        shouldUseContext = true
        originalInputHadContextCommand = true
        const commandPattern = new RegExp(
          CURRENT_PAGE_CONTEXT_COMMAND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            '\\s*',
          'g'
        )
        messageToSend = inputValue.replace(commandPattern, '').trim()
      } else {
        resetContextAttachedNextSend()
      }
    }

    if (
      !disabled &&
      (messageToSend || selectedFiles.length > 0 || shouldUseContext)
    ) {
      onSendFilesAndMessage(messageToSend, selectedFiles, shouldUseContext)
      setSelectedFiles([])

      if (shouldUseContext && originalInputHadContextCommand) {
        onInputChange(CURRENT_PAGE_CONTEXT_COMMAND + ' ')
      } else {
        onInputChange('')
        resetContextAttachedNextSend()
      }

      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }, [
    inputValue,
    selectedFiles,
    onSendFilesAndMessage,
    disabled,
    isCurrentPageFeatureEnabled,
    isContextAttachedNextSend,
    resetContextAttachedNextSend,
    onInputChange
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return
      if (
        showContextSuggestions &&
        (e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'Enter' ||
          e.key === 'Tab')
      ) {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          handleSelectSuggestion(CURRENT_PAGE_CONTEXT_COMMAND)
        }
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessageInternal()
      } else if (e.key === 'Escape') {
        if (showContextSuggestions) {
          setShowContextSuggestions(false)
          e.preventDefault()
        }
      }
    },
    [
      handleSendMessageInternal,
      disabled,
      showContextSuggestions,
      handleSelectSuggestion
    ]
  )

  const placeholderText = t('Type_message_or_attach_files')
  const buttonAriaLabel = t('Send_message')

  return (
    <div className='relative flex flex-col'>
      {/* Suggestion Box */}
      {showContextSuggestions && (
        <div className='absolute bottom-full left-0 right-0 z-10 mb-1 max-h-40  overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600'>
          <ul>
            <li
              className='cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600'
              onClick={() =>
                handleSelectSuggestion(CURRENT_PAGE_CONTEXT_COMMAND)
              }
              onMouseDown={e => e.preventDefault()}
            >
              <strong>{CURRENT_PAGE_CONTEXT_COMMAND}</strong> -{' '}
              {t(CURRENT_PAGE_CONTEXT_SUGGESTION_KEY)}
            </li>
          </ul>
        </div>
      )}
      {/* Thông báo lỗi/info cho context */}
      {contextSuggestionMessage && (
        <div className='mb-1 flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:border-red-700 dark:bg-red-900 dark:text-red-400'>
          <AlertTriangle size={14} className='mr-2 flex-shrink-0' />
          {contextSuggestionMessage}
        </div>
      )}
      {/* Thông báo đang sử dụng context */}
      {isContextAttachedNextSend && isCurrentPageFeatureEnabled && (
        <div className='mb-1 flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-600 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300'>
          <Info size={14} className='mr-2 flex-shrink-0' />
          {t(CURRENT_PAGE_CONTEXT_INFO_TEXT_KEY)}
        </div>
      )}
      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className='mb-2 max-h-48 overflow-y-auto rounded-t-lg  border bg-gray-10 p-3'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
            {selectedFiles.map(file => (
              <div
                key={file.name}
                className='relative flex flex-col items-center justify-center rounded-md border bg-white p-2 shadow-sm dark:border-gray-500 dark:bg-gray-600'
              >
                <button
                  onClick={() => handleRemoveFile(file.name)}
                  className='hover: absolute right-1 top-1 z-10  rounded-full  bg-gray-200  p-0.5 dark:hover:text-gray-200'
                  aria-label={t('ChatInput_Remove_File', {
                    fileName: file.name
                  })}
                >
                  <LucideX size={12} />
                </button>
                <div className='mb-1.5 flex-shrink-0'>
                  {getFileIcon(file.type)}
                </div>
                <span className='w-full break-all   px-1 text-center text-xs'>
                  {file.name.length > 30
                    ? `${file.name.substring(0, 27)}...`
                    : file.name}
                </span>
                <span className='text-xxs  mt-0.5'>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className={`flex w-full items-end bg-white-pure px-1 py-0.5 shadow-sm transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500  dark:focus-within:border-blue-400 ${selectedFiles.length > 0 || (isContextAttachedNextSend && isCurrentPageFeatureEnabled) || contextSuggestionMessage ? 'rounded-b-2xl rounded-t-none border-t-0' : 'rounded-2xl'}`}
      >
        <Button
          variant='secondary'
          size='small'
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES}
          aria-label={t('ChatInput_Attach_File_Button_Label')}
          className='ml-0.25 hover: mb-0.5 mr-1.5 flex-shrink-0  rounded-xl  dark:hover:text-gray-200'
        >
          <Paperclip size={16} />
        </Button>
        <input
          type='file'
          multiple
          accept={ACCEPTED_FILE_TYPES}
          ref={fileInputRef}
          onChange={handleFileChange}
          className='hidden'
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES}
        />
        <TextareaAutosize
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChangeInternal}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={`
             max-h-28 flex-grow resize-none overflow-y-auto 
            bg-transparent px-1.5 py-1 text-sm placeholder:text-primary
            focus:border-transparent focus:outline-none disabled:cursor-not-allowed
            disabled:bg-gray-100  dark:placeholder-gray-400 dark:disabled:bg-gray-600
            ${selectedFiles.length > 0 ? 'rounded-l-none' : 'rounded-l-2xl'} 
          `}
          rows={1}
          disabled={disabled}
          onBlur={() => setTimeout(() => setShowContextSuggestions(false), 150)}
          onFocus={() => {
            if (inputValue.endsWith('@') && isCurrentPageFeatureEnabled) {
              setShowContextSuggestions(true)
            }
          }}
        />
        <Button
          variant={'secondary'}
          size='mini'
          rounded={true}
          onClick={handleSendMessageInternal}
          disabled={
            disabled ||
            (!inputValue.trim() &&
              selectedFiles.length === 0 &&
              (!isContextAttachedNextSend || !isCurrentPageFeatureEnabled))
          }
          aria-label={buttonAriaLabel}
          className='mr-0.25 mb-0.5 ml-1.5 flex-shrink-0 '
        >
          <GrSend size={16} className='h-4 w-4' />
        </Button>
      </div>

      {/* Modal component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        footer={
          <Button variant='primary' onClick={() => setIsModalOpen(false)}>
            {t('Common_OK')} {/* Sử dụng bản dịch cho nút OK */}
          </Button>
        }
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  )
}

export default ChatInput