'use client'

import React, { useState, useEffect, useRef } from 'react'
import Odometer from 'react-odometerjs'
import 'odometer/themes/odometer-theme-default.css'
import Image from 'next/image' // Import thẻ Image của Next.js
import { useTranslations } from 'next-intl'
import { useMediaQuery } from 'react-responsive'

interface Statistic {
  label: string
  value: number
  unit?: string
  description?: string
  // Thêm một trường để lưu giá trị hiển thị ban đầu (ước tính)
  initialDisplayValue?: number | string
}

const AIStatistics = () => {
  const t = useTranslations('')
  const isMobile = useMediaQuery({ maxWidth: 768 })

  const statistics: Statistic[] = [
    {
      label: t('Model_Accuracy'),
      value: 95.7,
      unit: '%',
      description: t('Model_Accuracy_describe'),
      // Giá trị ban đầu để hiển thị khi chưa có số chính xác
      // Có thể là một số nhỏ, hoặc một giá trị ngẫu nhiên trong một khoảng
      initialDisplayValue: 70 // Ví dụ: bắt đầu từ 70%
    },
    {
      label: t('Inference_Speed'),
      value: 5.5,
      unit: 'ms',
      description: t('Inference_Speed_describe'),
      initialDisplayValue: 100 // Ví dụ: bắt đầu từ 100ms
    }
  ]

  const odometerStyle = {
    fontSize: isMobile ? '8rem' : '10rem',
    fontWeight: 'bold',
    color: '#A7C4BC',
    lineHeight: 1.2
  }

  // Khởi tạo odometerValues với giá trị initialDisplayValue hoặc 0 nếu không có
  const [odometerValues, setOdometerValues] = useState(
    statistics.map(stat => stat.initialDisplayValue || 0)
  )
  const [isIntersecting, setIsIntersecting] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)
  // Biến trạng thái để kiểm soát việc chuyển đổi đến giá trị cuối cùng
  const [hasLoadedPreciseData, setHasLoadedPreciseData] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsIntersecting(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1
      }
    )

    if (componentRef.current) {
      observer.observe(componentRef.current)
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isIntersecting || hasLoadedPreciseData) return // Chỉ chạy một lần sau khi giao điểm và chưa tải dữ liệu chính xác

    // Giả lập việc tải dữ liệu chính xác sau một khoảng thời gian
    // Trong thực tế, bạn sẽ thay thế đoạn này bằng một API call hoặc logic tải dữ liệu thực sự
    const dataLoadingTimeout = setTimeout(() => {
      setOdometerValues(statistics.map(stat => stat.value)) // Gán giá trị chính xác
      setHasLoadedPreciseData(true) // Đánh dấu đã tải dữ liệu chính xác
    }, 2000) // Ví dụ: 2 giây sau khi component hiển thị trên màn hình

    return () => clearTimeout(dataLoadingTimeout)
  }, [statistics, isIntersecting, hasLoadedPreciseData]) // Thêm hasLoadedPreciseData vào dependency array

  return (
    <div
      className='relative min-h-screen overflow-hidden bg-gray-900 py-8 text-white'
      ref={componentRef}
    >
      <Image
        src='/banner3.png' // Thay đổi đường dẫn này
        alt='AI Background'
        fill
        style={{ objectFit: 'cover' }}
        className='absolute left-0 top-0 z-0 h-full w-full object-cover opacity-20' // Giảm độ mờ và đưa xuống layer dưới
      />
      <div className='container relative z-10 mx-auto'>
        {' '}
        {/* Thêm relative và z-10 để nội dung nằm trên ảnh */}
        <h1 className='mb-6 text-center text-3xl font-semibold text-gray-100'>
          {t('AI_Statistics')}
        </h1>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {statistics.map((stat, index) => (
            <div
              key={index}
              className=' transform p-6 text-center transition-transform duration-200'
            >
              <h2 className='mb-2 text-2xl font-bold text-blue-400 md:text-3xl'>
                {stat.label}
              </h2>
              <div className='text-xl font-semibold md:text-3xl'>
                <Odometer
                  // Nếu chưa tải dữ liệu chính xác và có initialDisplayValue, sử dụng nó
                  // Nếu không, sử dụng giá trị hiện tại (ban đầu là initialDisplayValue, sau đó là giá trị chính xác)
                  value={Number(odometerValues[index])}
                  format={stat.unit === '%' ? '(,ddd).d' : '(,ddd)'} // Định dạng cho phần trăm có 1 số thập phân, còn lại không có
                  theme='default'
                  style={odometerStyle}
                />
                {stat.unit && (
                  <span className='ml-4 text-3xl text-gray-400 md:text-6xl'>
                    {stat.unit}
                  </span>
                )}
              </div>
              {stat.description && (
                <p className='mt-2 text-base text-gray-400 md:text-3xl'>
                  {stat.description}
                </p>
              )}
              {!hasLoadedPreciseData && (
                <p className='mt-2 text-sm text-yellow-300 md:text-xl'>
                  {t('Estimated_Value')} {/* Ví dụ: "Giá trị ước tính" */}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AIStatistics