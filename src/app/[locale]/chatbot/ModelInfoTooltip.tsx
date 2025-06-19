// src/app/[locale]/chatbot/ModelInfoTooltip.tsx
import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { ModelOption } from './lib/models' // Đảm bảo đường dẫn này đúng

interface ModelInfoTooltipProps {
  model: ModelOption
  isVisible: boolean
  targetRef: React.RefObject<HTMLElement>
}

const ModelInfoTooltip: React.FC<ModelInfoTooltipProps> = ({
  model,
  isVisible,
  targetRef
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    opacity: 0
  })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const portalRootRef = useRef<HTMLElement | null>(null) // Ref để lưu portal root

  // Lấy portal root một lần khi component mount
  useEffect(() => {
    portalRootRef.current = document.getElementById('tooltip-portal-root')
    if (!portalRootRef.current) {
      console.warn(
        "Tooltip portal root ('tooltip-portal-root') not found in the DOM!"
      )
    }
  }, [])

  useEffect(() => {
    if (
      isVisible &&
      targetRef.current &&
      tooltipRef.current &&
      portalRootRef.current
    ) {
      const targetRect = targetRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect() // Lấy kích thước thực của tooltip

      // Tính toán vị trí để tooltip hiển thị bên trái target element
      let top = targetRect.top + window.scrollY
      let left = targetRect.left + window.scrollX - tooltipRect.width - 10 // 10px là khoảng cách

      // Điều chỉnh nếu tooltip bị tràn ra ngoài bên trái màn hình
      if (left < 5) {
        // 5px buffer
        left = targetRect.right + window.scrollX + 10 // Chuyển sang bên phải nếu không đủ chỗ
      }

      // Điều chỉnh nếu tooltip bị tràn ra ngoài bên phải màn hình (sau khi đã thử chuyển sang phải)
      if (left + tooltipRect.width > window.innerWidth - 5) {
        left = window.innerWidth - tooltipRect.width - 5
      }

      // Điều chỉnh nếu tooltip bị tràn xuống dưới màn hình
      if (top + tooltipRect.height > window.innerHeight + window.scrollY - 5) {
        top = targetRect.top + window.scrollY - tooltipRect.height // Đặt phía trên target
      }
      // Điều chỉnh nếu tooltip bị tràn lên trên màn hình
      if (top < window.scrollY + 5) {
        top = window.scrollY + 5
      }

      setTooltipPosition({ top, left, opacity: 1 })
    } else {
      setTooltipPosition(prev => ({ ...prev, opacity: 0 })) // Ẩn tooltip khi không isVisible
    }
  }, [isVisible, targetRef, model]) // Thêm model để tính lại nếu nội dung thay đổi kích thước tooltip

  if (!isVisible || !portalRootRef.current) {
    return null
  }

  const TooltipIcon = model.icon // Gán vào biến viết hoa

  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      className='fixed z-[9999] w-64 rounded-md border border-gray-200 bg-white-pure p-3 shadow-lg transition-opacity duration-150 dark:border-gray-700 '
      role='tooltip'
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        opacity: tooltipPosition.opacity,
        pointerEvents: tooltipPosition.opacity === 0 ? 'none' : 'auto' // Ngăn tương tác khi ẩn
      }}
    >
      <h4 className='mb-1.5 flex items-center text-sm font-semibold '>
        {TooltipIcon && <TooltipIcon className='mr-2 h-4 w-4 text-blue-500' />}
        {model.name}
      </h4>
      <p className='text-xs '>{model.detailedDescription}</p>
    </div>,
    portalRootRef.current
  )
}

export default ModelInfoTooltip
