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
  }, [files, previewUrls]) // Add previewUrls to dependency array to avoid stale closures

  if (files.length === 0) {
    return null
  }

  return (
    // Giữ nguyên khung bao quanh tổng thể nếu bạn muốn một container cho tất cả các file
    // ĐÃ THAY ĐỔI: Loại bỏ max-h-64 và overflow-y-auto
    <div className='rounded-t-lg border bg-gray-10 p-3'>
      {/* ĐÃ THAY ĐỔI: Sử dụng flexbox cho cuộn ngang */}
      {/* `flex` để các item nằm trên một hàng */}
      {/* `overflow-x-auto` để tạo thanh cuộn ngang khi cần */}
      {/* `pb-2` để đảm bảo thanh cuộn không che mất phần dưới của ảnh */}
      <div className='flex gap-3 overflow-x-auto pb-2'>
        {files.map(file => {
          const isImage = file.type.startsWith('image/')
          const previewUrl = previewUrls[file.name]

          return (
            // ĐIỀU CHỈNH CHÍNH Ở ĐÂY:
            // Bỏ 'border', 'bg-white', 'p-2', 'shadow-sm', 'dark:border-gray-500', 'dark:bg-gray-600'
            // Giữ 'relative' để nút xóa có thể định vị tuyệt đối bên trong nó.
            // Thêm 'rounded-md' nếu bạn muốn các góc của ảnh/icon được bo tròn.
            // THÊM: `flex-shrink-0` để ngăn các item co lại
            // THÊM: `w-48` để mỗi item có chiều rộng cố định, tạo ra thanh cuộn
            <div
              key={file.name}
              className='relative flex flex-col overflow-hidden rounded-md flex-shrink-0 w-48' // Đã bỏ border, bg, p, shadow
            >
              {/* Nút xóa: Giữ nguyên vị trí tuyệt đối */}
              <button
                onClick={() => onRemoveFile(file.name)}
                className='absolute right-1 top-1 z-10 rounded-full p-0.5 backdrop-blur-sm transition-colors hover:bg-gray-300 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700'
                aria-label={t('ChatInput_Remove_File', { fileName: file.name })}
              >
                <LucideX size={12} />
              </button>
              
              {/* Khung chứa ảnh/icon: Đảm bảo chiều cao và căn giữa */}
              {/* Đã bỏ 'mb-1.5' vì không còn phần text bên dưới */}
              <div className='flex h-32 items-center justify-center'>
                {isImage && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    // Sử dụng 'object-contain' để đảm bảo toàn bộ ảnh được hiển thị bên trong
                    // khung chứa mà không bị cắt xén. Ảnh sẽ được thu nhỏ để vừa vặn,
                    // giữ nguyên tỷ lệ khung hình.
                    // Thêm 'rounded-md' để ảnh cũng được bo góc nếu container của nó được bo góc.
                    className='h-full w-full rounded-md object-contain'
                  />
                ) : (
                  // Nếu không phải ảnh, hiển thị icon
                  <div className='flex-shrink-0'>{getFileIcon(file.type)}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FilePreview