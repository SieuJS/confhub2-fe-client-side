// src/app/[locale]/home/ConsumerInsights.tsx
'use client' // Giữ nguyên dòng này

import { useTranslations } from 'next-intl'
// Tạm thời bỏ Odometer để loại bỏ hiệu ứng và CSS liên quan
// import Odometer from 'react-odometerjs'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import {
  FaUsers,
  FaChartBar,
  FaMapMarkedAlt,
  FaHandshake
} from 'react-icons/fa'

interface ConsumerInsightsProps {}

const ConsumerInsights: React.FC<ConsumerInsightsProps> = ({}) => {
  const t = useTranslations('ConsumerInsights')
  const title = t('title')
  const subtitle = t('subtitle')
  const description = t('description')
  const buttonText = t('buttonText')

  const statsData = [
    { value: 956, label: t('stats.0'), Icon: FaUsers, color: '#3b82f6' },
    { value: 25000, label: t('stats.1'), Icon: FaChartBar, color: '#10b981' },
    { value: 120, label: t('stats.2'), Icon: FaMapMarkedAlt, color: '#f59e0b' },
    { value: 75, label: t('stats.3'), Icon: FaHandshake, color: '#ef4444' }
  ]

  return (
    <section
      id='consumer-insights'
      // Loại bỏ ref vì không còn IntersectionObserver
      // ref={componentRef}
      // className='mx-0 my-12 overflow-hidden rounded-lg bg-gray-10 py-8 shadow-lg  md:mx-12 md:py-16'
      className='mx-0 overflow-hidden bg-white-pure py-8 md:py-16'
    >
      <div className='container mx-auto px-4 md:px-6'>
        {/* Content Wrapper */}
        <div className='mx-auto mb-12 max-w-6xl text-center md:mb-16'>
          <h2 className='dark:text-button-dark mb-2 text-base font-semibold uppercase tracking-wider text-button'>
            {title}
          </h2>
          <h3 className='mb-4 text-3xl font-bold leading-tight md:text-4xl'>
            {subtitle}
          </h3>
          <p className='text-lg'>{description}</p>
        </div>

        {/* Stats Cards Grid */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {statsData.map((stat, index) => (
            <div
              key={index}
              className='flex flex-col items-center rounded-xl bg-white-pure p-6 text-center shadow-md transition-shadow duration-300 hover:shadow-lg '
            >
              {/* Icon */}
              <div className='mb-4 text-4xl' style={{ color: stat.color }}>
                <stat.Icon />
              </div>

              {/* --- Static Number Display (loại bỏ Odometer) --- */}
              <div
                className='mb-2 text-4xl font-bold md:text-5xl'
                style={{ color: stat.color }}
              >
                {/* Hiển thị giá trị tĩnh thay vì sử dụng Odometer */}
                {/* Định dạng số thủ công đơn giản hoặc sử dụng Intl.NumberFormat */}
                {stat.value.toLocaleString('en-US')}{' '}
                {/* Sử dụng toLocaleString để định dạng */}
              </div>
              {/* ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ */}

              {/* Label */}
              <p className='mt-1 text-sm font-medium uppercase tracking-wider '>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className='mt-12 text-center md:mt-16'>
          <Link href='/conferences' legacyBehavior={false}>
            {/* Giữ nguyên Button hoặc có thể đơn giản hóa nếu Button có hiệu ứng */}
            <Button className='hover:bg-button-dark inline-block transform rounded-lg bg-button px-8 py-3 text-lg font-bold text-button-text shadow transition duration-300 hover:-translate-y-1 hover:shadow-md'>
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ConsumerInsights
