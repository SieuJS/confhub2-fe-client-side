import React, { useState, useEffect, useRef } from 'react' // Thêm useState, useEffect, useRef
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// --- Odometer CSS Import ---
import 'odometer/themes/odometer-theme-default.css' // Hoặc theme khác
import Button from '../utils/Button'
import { Link } from '@/src/navigation'

// --- Odometer Component Import ---
const Odometer = dynamic(() => import('react-odometerjs'), {
  ssr: false,
  loading: () => <span className='odometer-value-placeholder'>0</span>
})

interface HubStatsProps {
  title?: string
  subtitle?: string
  description?: string
  stats?: { value: number; label: string }[]
  imageUrl?: string
  imageAlt?: string
  buttonText?: string
  buttonLink?: string
}

const ConsumerInsights: React.FC<HubStatsProps> = ({}) => {
  const t = useTranslations('ConsumerInsights')
  const title = t('title')
  const subtitle = t('subtitle')
  const description = t('description')
  const stats = [
    { value: 15000, label: t('stats.0') }, // Lấy phần tử đầu tiên
    { value: 8000, label: t('stats.1') }, // Lấy phần tử thứ hai
    { value: 120, label: t('stats.2') }, // Lấy phần tử thứ ba
    { value: 75, label: t('stats.3') } // Lấy phần tử thứ tư
  ]
  const imageUrl = '/bg-2.jpg'
  const imageAlt = 'Background showing network or abstract data visualization'
  const buttonText = t('buttonText')
  // --- State và Ref cho Intersection Observer ---
  const [isVisible, setIsVisible] = useState(false) // State để theo dõi component có hiển thị không
  const componentRef = useRef<HTMLDivElement>(null) // Ref để trỏ tới DOM element của component

  // --- useEffect để thiết lập Intersection Observer ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Callback sẽ được gọi khi visibility thay đổi
        if (entry.isIntersecting) {
          setIsVisible(true) // Component đã vào viewport, cập nhật state
          observer.unobserve(entry.target) // Ngừng theo dõi sau khi đã hiển thị để tối ưu
        }
      },
      {
        root: null, // Quan sát trong viewport mặc định
        rootMargin: '0px',
        threshold: 0.1 // Kích hoạt khi ít nhất 10% component hiển thị
      }
    )

    const currentRef = componentRef.current // Lấy giá trị ref hiện tại

    if (currentRef) {
      observer.observe(currentRef) // Bắt đầu theo dõi component
    }

    // --- Hàm cleanup ---
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef) // Ngừng theo dõi khi component unmount
      }
      observer.disconnect() // Ngắt kết nối observer hoàn toàn
    }
  }, []) // Chỉ chạy effect này một lần khi component mount

  return (
    // --- Gán ref vào div gốc của component ---
    <div
      ref={componentRef}
      className='container mx-auto my-16 overflow-hidden rounded-xl  px-4 py-12 shadow-md'
    >
      {' '}
      {/* Thêm overflow-hidden nếu cần */}
      <div className='gap-12 md:flex md:items-center md:justify-between'>
        {/* Left Column (Image) */}
        <div className='mb-8 md:mb-0 md:w-1/2'>
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={600}
            height={450}
            className='h-auto w-full rounded-lg object-cover shadow-lg'
            priority // Giữ lại nếu ảnh quan trọng
          />
        </div>

        {/* Right Column (Content) */}
        <div className='md:w-1/2'>
          <h2 className='mb-2 text-sm font-semibold uppercase tracking-wider text-button'>
            {title}
          </h2>
          <h3 className='mb-4 text-3xl font-bold leading-tight lg:text-4xl'>
            {subtitle}
          </h3>
          <p className='mb-8 text-lg '>{description}</p>

          {/* Stats with Odometer - Sử dụng state isVisible */}
          <div className='mb-10 grid grid-cols-2 gap-x-8 gap-y-6'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center '>
                <div className='odometer mb-1 text-4xl font-bold text-button'>
                  <Odometer
                    value={isVisible ? stat.value : 0}
                    format='(,ddd)'
                    duration={2000}
                  />
                </div>
                <p className='text-xs font-medium uppercase tracking-wider '>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Button - Wrapped in a div with text-center */}
          <div className='text-center'>
            {' '}
            <Link href='/conferences'>
              <Button className='inline-block transform rounded-lg bg-button px-8 py-3 font-bold text-button-text shadow transition duration-300 hover:-translate-y-1 hover:bg-button hover:shadow-md'>
                {buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsumerInsights
