// components/PosterExporter.tsx

'use client'

import React, { useRef, useState } from 'react'
import domtoimage from 'dom-to-image-more'
import Poster from './Poster' // Giả sử Poster.tsx nằm cùng thư mục hoặc bạn chỉnh lại đường dẫn

const PosterExporter: React.FC = () => {
  // useRef để lấy tham chiếu đến DOM element của poster
  const posterRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!posterRef.current) {
      alert('Lỗi: Không tìm thấy poster để xuất file.')
      return
    }

    setIsExporting(true)

    const posterNode = posterRef.current

    // RẤT QUAN TRỌNG: Tạm thời bỏ transform: scale() để thư viện render ở kích thước đầy đủ
    const originalTransform = posterNode.style.transform
    posterNode.style.transform = 'none'
    // Đảm bảo trình duyệt có thời gian render lại trước khi chụp
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      // Các tùy chọn để đảm bảo chất lượng cao nhất
      const options = {
        quality: 1.0, // Chất lượng ảnh PNG (1.0 là cao nhất)
        width: posterNode.offsetWidth, // Lấy chiều rộng thực tế của element
        height: posterNode.offsetHeight, // Lấy chiều cao thực tế của element
        style: {
          transform: 'scale(1)', // Đảm bảo scale là 1 trong quá trình render
          transformOrigin: 'top left',
          margin: '0'
          // Bạn có thể thêm các style ghi đè khác ở đây nếu cần
        }
      }

      // console.log(
      //   `Bắt đầu xuất file ảnh với kích thước: ${options.width}x${options.height}...`
      // )

      const dataUrl = await domtoimage.toPng(posterNode, options)

      // console.log('Xuất file thành công! Bắt đầu tải xuống...')

      // Tạo một thẻ <a> ảo để tải file về
      const link = document.createElement('a')
      link.download = 'do-an-poster.png'
      link.href = dataUrl
      link.click()
    } catch (error) {
      // console.error('Oops, có lỗi xảy ra!', error)
      alert(
        'Đã có lỗi xảy ra trong quá trình xuất file. Vui lòng thử lại hoặc kiểm tra console.'
      )
    } finally {
      // QUAN TRỌNG: Đặt lại transform để giao diện hiển thị đúng như cũ
      posterNode.style.transform = originalTransform
      setIsExporting(false)
      // console.log('Hoàn tất.')
    }
  }

  return (
    <div className='flex min-h-screen w-full flex-col items-center bg-gray-200 p-8'>
      <div className='mb-8'>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className='rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:bg-gray-400'
        >
          {isExporting
            ? 'Đang xử lý, vui lòng chờ...'
            : 'Xuất Poster ra file PNG'}
        </button>
        {isExporting && (
          <p className='mt-2 text-center font-semibold text-red-600'>
            Quá trình này có thể mất vài phút do kích thước ảnh rất lớn. Vui
            lòng không đóng tab!
          </p>
        )}
      </div>

      {/* Bao bọc Poster trong một div có ref */}
      <div ref={posterRef}>
        <Poster />
      </div>
    </div>
  )
}

export default PosterExporter
