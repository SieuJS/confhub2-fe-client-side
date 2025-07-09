// components/PosterExporter.tsx

'use client'

import React, { useRef, useState } from 'react'
import domtoimage from 'dom-to-image-more'
import Poster from './Poster'
import DataProcessingFlowchartFinal from './DataProcessingFlowchart1'
import DataProcessingFlowchartPhase2 from './DataProcessingFlowchart2'
import DataProcessingFlowchartPhase3 from './FlowchartPhase3'

const PosterExporter: React.FC = () => {
  const posterRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!posterRef.current) {
      alert('Lỗi: Không tìm thấy poster để xuất file.')
      return
    }

    setIsExporting(true)

    const posterNode = posterRef.current
    const originalTransform = posterNode.style.transform
    posterNode.style.transform = 'none'
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      const options = {
        quality: 1.0,
        width: posterNode.offsetWidth,
        height: posterNode.offsetHeight,

        // --- SỬA LẠI PHẦN NÀY ---
        filter: (node: Node) => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement
            element.style.outline = 'none'
            element.style.border = 'none'
            element.style.boxShadow = 'none'
          }
          return true
        },
        // --- KẾT THÚC PHẦN SỬA ---

        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0'
        }
      }

      const dataUrl = await domtoimage.toPng(posterNode, options)
      const link = document.createElement('a')
      link.download = 'do-an-poster.png'
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Oops, có lỗi xảy ra!', error)
      alert(
        'Đã có lỗi xảy ra trong quá trình xuất file. Vui lòng thử lại hoặc kiểm tra console.'
      )
    } finally {
      posterNode.style.transform = originalTransform
      setIsExporting(false)
    }
  }

  return (
    // ...Phần JSX của bạn không thay đổi
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
      <div ref={posterRef}>
        {/* <Poster /> */}
        {/* <DataProcessingFlowchartFinal /> */}
        {/* <DataProcessingFlowchartPhase2 /> */}
        {/* <DataProcessingFlowchartPhase3 /> */}
      </div>
    </div>
  )
}

export default PosterExporter
