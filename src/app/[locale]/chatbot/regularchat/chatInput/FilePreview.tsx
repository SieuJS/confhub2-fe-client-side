import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { X as LucideX } from 'lucide-react'
import { FileText, ImageIcon, Paperclip } from 'lucide-react'

// Utility function
export const getFileIcon = (mimeType: string): React.ReactNode => {
  if (mimeType.startsWith('image/')) return <ImageIcon size={24} className='' />
  if (mimeType === 'application/pdf')
    return <FileText size={24} className='text-blue-500 dark:text-blue-400' />
  return <Paperclip size={24} className='' />
}

interface FilePreviewProps {
  files: File[]
  onRemoveFile: (fileName: string) => void
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemoveFile }) => {
  const t = useTranslations()
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const newUrls: { [key: string]: string } = {}
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (!previewUrls[file.name]) {
            newUrls[file.name] = URL.createObjectURL(file)
        }
      }
    })

    if (Object.keys(newUrls).length > 0) {
        setPreviewUrls(prevUrls => ({ ...prevUrls, ...newUrls }))
    }

    // Cleanup function to revoke object URLs when component unmounts or files change
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
    }
  }, [files, previewUrls])

  if (files.length === 0) {
    return null
  }

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className='rounded-t-lg border bg-gray-10 p-3'>
      <div className='flex gap-3 overflow-x-auto pb-2'>
        {files.map(file => {
          const isImage = file.type.startsWith('image/')
          const previewUrl = previewUrls[file.name]

          return (
            <div
              key={file.name}
              className='relative flex flex-col overflow-hidden rounded-md flex-shrink-0 w-48 border bg-white p-2 shadow-sm dark:border-gray-500 dark:bg-gray-600'
            >
              <button
                onClick={() => onRemoveFile(file.name)}
                className='absolute right-1 top-1 z-10 rounded-full p-0.5 backdrop-blur-sm transition-colors hover:bg-gray-300 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700'
                aria-label={t('ChatInput_Remove_File', { fileName: file.name })}
              >
                <LucideX size={12} />
              </button>
              
              <div className='flex h-32 items-center justify-center mb-1.5'>
                {isImage && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className='h-full w-full rounded-md object-contain'
                  />
                ) : (
                  <div className='flex flex-col items-center text-center'>
                    <div className='flex-shrink-0 mb-2'>{getFileIcon(file.type)}</div>
                    {/* Applied truncate, w-full, and px-1 for better text handling */}
                    <span className='text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full px-1'>{file.name}</span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>{formatFileSize(file.size)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FilePreview;