'use client'

import React, { useState, useLayoutEffect, useRef } from 'react'

// --- CÁC COMPONENT CON TÁI SỬ DỤNG (Không đổi) ---

const FlowchartBox: React.FC<{
  title: React.ReactNode
  variant?: 'process' | 'start-end'
  id?: string
}> = ({ title, variant = 'process', id }) => {
  const baseClasses =
    'flex flex-col w-[300px] min-h-[90px] items-center justify-center border-2 border-black p-4 text-center shadow-md z-10 bg-white'
  const variantClasses = {
    process: 'rounded-lg',
    'start-end': 'bg-gray-100 rounded-2xl border-dashed'
  }
  return (
    <div id={id} className={`${baseClasses} ${variantClasses[variant]}`}>
      <p className='text-2xl font-bold'>{title}</p>
    </div>
  )
}

const DownArrow: React.FC<{ label?: string }> = ({ label }) => (
  <div className='flex flex-col items-center py-2'>
    {label && (
      <span className='z-10 rounded-full bg-blue-100 px-4 py-1.5 text-base font-semibold text-blue-700'>
        {label}
      </span>
    )}
    <div className='text-4xl font-light text-gray-700'>↓</div>
  </div>
)

// --- COMPONENT MŨI TÊN HÌNH CHỮ Z (ĐÃ SỬA HƯỚNG MŨI TÊN) ---

interface Position {
  x: number
  y: number
  width: number
  height: number
}

const ConnectingPathArrow: React.FC<{
  startElementId: string
  endElementId: string
  containerRef: React.RefObject<HTMLDivElement>
  label: string
}> = ({ startElementId, endElementId, containerRef, label }) => {
  const [path, setPath] = useState('')
  const [labelPos, setLabelPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    // Logic tính toán đường đi không đổi, vẫn chính xác
    const containerNode = containerRef.current
    if (!containerNode) return
    const startNode = document.getElementById(startElementId)
    const endNode = document.getElementById(endElementId)

    if (startNode && endNode) {
      const containerRect = containerNode.getBoundingClientRect()
      const startRect = startNode.getBoundingClientRect()
      const endRect = endNode.getBoundingClientRect()

      const startPos = {
        x: startRect.left - containerRect.left,
        y: startRect.top - containerRect.top,
        width: startRect.width,
        height: startRect.height
      }
      const endPos = {
        x: endRect.left - containerRect.left - 20,
        y: endRect.top - containerRect.top,
        width: endRect.width,
        height: endRect.height
      }

      const sx = startPos.x + startPos.width
      const sy = startPos.y + startPos.height / 2
      const ex = endPos.x
      const ey = endPos.y + endPos.height / 2
      const midX = sx + (ex - sx) / 2

      const pathData = `M ${sx} ${sy} H ${midX} V ${ey} H ${ex}`
      setPath(pathData)

      setLabelPos({ top: sy + (ey - sy) / 2, left: midX })
    }
  }, [startElementId, endElementId, containerRef])

  if (!path) return null

  return (
    <>
      <svg
        className='absolute left-0 top-0 h-full w-full'
        style={{ zIndex: 5 }}
      >
        <defs>
          {/* === SỬA LỖI Ở ĐÂY === */}
          <marker
            id='arrowhead-correct'
            markerWidth='10'
            markerHeight='7'
            refX='0' // Đặt gốc của mũi tên tại điểm cuối của đường
            refY='3.5'
            orient='auto'
          >
            {/* Polygon vẽ mũi tên trỏ sang phải (hướng x dương) */}
            <polygon points='0 0, 10 3.5, 0 7' fill='#4b5563' />
          </marker>
        </defs>
        <path
          d={path}
          stroke='#4b5563'
          strokeWidth='2'
          fill='none'
          // Sử dụng marker đã được sửa
          markerEnd='url(#arrowhead-correct)'
        />
      </svg>
      <span
        className='absolute whitespace-nowrap rounded-full bg-green-100 px-4 py-1.5 text-base font-semibold text-green-700'
        style={{
          top: `${labelPos.top}px`,
          left: `${labelPos.left}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 6
        }}
      >
        {label}
      </span>
    </>
  )
}

// --- COMPONENT CHÍNH CHO SƠ ĐỒ (Không đổi) ---

const DataProcessingFlowchartFinal: React.FC = () => {
  const flowchartContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div className='mx-auto flex min-h-[29.7cm] w-[21cm] flex-col items-center bg-white p-8 font-sans shadow-lg print:my-0 print:shadow-none'>
      <h1 className='mb-12 text-center text-4xl font-bold'>
        Giai đoạn 1: Tiền Xử Lý Dữ Liệu Thô
      </h1>

      <div ref={flowchartContainerRef} className='relative w-full'>
        <ConnectingPathArrow
          containerRef={flowchartContainerRef}
          startElementId='box-filter'
          endElementId='box-crawl'
          label='Danh sách N URLs đã lọc'
        />

        <div className='grid grid-cols-2 justify-between gap-x-32'>
          {/* CỘT 1 */}
          <div className='flex flex-col items-center gap-y-2'>
            <FlowchartBox title='Bắt đầu tác vụ' variant='start-end' />
            <DownArrow />
            <FlowchartBox title='Tạo truy vấn động từ tên, tên viết tắt, năm' />
            <DownArrow label='Truy vấn' />
            <FlowchartBox title='Gọi API Google Search' />
            <DownArrow label='Danh sách kết quả thô' />
            <FlowchartBox title='Lọc và lấy kết quả' id='box-filter' />
          </div>

          {/* CỘT 2 */}
          <div className='flex flex-col items-center gap-y-2'>
            <FlowchartBox title='Thực hiện cào song song' id='box-crawl' />
            <DownArrow label='Dữ liệu HTML thô' />
            <FlowchartBox title='Trích xuất và định dạng văn bản' />
            <DownArrow />
            <FlowchartBox title='Kết thúc Giai đoạn 1' variant='start-end' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataProcessingFlowchartFinal
