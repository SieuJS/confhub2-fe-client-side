// src/app/[locale]/chatbot/regularchat/chat-input/hooks/useFileHandling.ts
import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  MAX_TOTAL_FILES,
  MAX_FILE_SIZE_MB
} from '@/src/app/[locale]/chatbot/regularchat/ChatInput'

interface UseFileHandlingProps {
  showAlertDialog: (title: string, message: string) => void
}

export const useFileHandling = ({ showAlertDialog }: UseFileHandlingProps) => {
  const t = useTranslations()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // <<< NEW: Hàm dùng chung để thêm và xác thực tệp >>>
  const addFiles = useCallback(
    (filesToAdd: File[]) => {
      const currentFileCount = selectedFiles.length
      let validFiles: File[] = []
      let alertShownForSize = false
      let alertShownForMaxFiles = false

      filesToAdd.forEach(file => {
        if (currentFileCount + validFiles.length >= MAX_TOTAL_FILES) {
          if (!alertShownForMaxFiles) {
            showAlertDialog(
              t('ChatInput_Error_Title_MaxFiles'),
              t('ChatInput_Error_MaxFiles', { max: MAX_TOTAL_FILES })
            )
            alertShownForMaxFiles = true
          }
          return
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          if (!alertShownForSize) {
            showAlertDialog(
              t('ChatInput_Error_Title_FileSize'),
              t('ChatInput_Error_FileSize', {
                name: file.name,
                maxSize: MAX_FILE_SIZE_MB
              })
            )
            alertShownForSize = true
          }
          return
        }
        // Ngăn việc thêm các tệp trùng lặp
        if (
          !selectedFiles.some(
            existingFile =>
              existingFile.name === file.name && existingFile.size === file.size
          )
        ) {
          validFiles.push(file)
        }
      })

      if (validFiles.length > 0) {
        setSelectedFiles(prevFiles =>
          [...prevFiles, ...validFiles].slice(0, MAX_TOTAL_FILES)
        )
      }
    },
    [selectedFiles, showAlertDialog, t]
  )

  // <<< MODIFIED: Sử dụng hàm addFiles mới >>>
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return

      const newFiles = Array.from(event.target.files)
      addFiles(newFiles)

      // Reset giá trị input để cho phép chọn lại cùng một tệp
      if (event.target) {
        event.target.value = ''
      }
    },
    [addFiles]
  )

  const handleRemoveFile = useCallback((fileName: string) => {
    setSelectedFiles(prevFiles =>
      prevFiles.filter(file => file.name !== fileName)
    )
  }, [])

  return {
    selectedFiles,
    setSelectedFiles,
    handleFileChange,
    handleRemoveFile,
    addFiles // <<< NEW: Xuất hàm mới
  }
}