import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import Button from '../utils/Button' // Assuming Button component path is correct
import { Link } from '@/src/navigation' // Assuming Link component path is correct
import {
  FaUsers,
  FaChartBar,
  FaMapMarkedAlt,
  FaHandshake
} from 'react-icons/fa' // Example icons

// --- ECharts Component Import (Dynamically to avoid SSR issues) ---
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

// --- Interface (Kept simple as image is removed) ---
interface ConsumerInsightsProps {
  // Props can be added back if needed, e.g., for external data source
}

const ConsumerInsights: React.FC<ConsumerInsightsProps> = ({}) => {
  const t = useTranslations('ConsumerInsights')
  const title = t('title')
  const subtitle = t('subtitle')
  const description = t('description')
  const buttonText = t('buttonText')

  // --- Stats Data with Icons ---
  const statsData = [
    { value: 956, label: t('stats.0'), Icon: FaUsers, color: '#3b82f6' }, // Blue
    { value: 25000, label: t('stats.1'), Icon: FaChartBar, color: '#10b981' }, // Emerald
    { value: 120, label: t('stats.2'), Icon: FaMapMarkedAlt, color: '#f59e0b' }, // Amber
    { value: 75, label: t('stats.3'), Icon: FaHandshake, color: '#ef4444' } // Red
  ]

  const [isVisible, setIsVisible] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)

  // --- Intersection Observer Logic (Kept the same) ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target) // Unobserve after becoming visible
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% is visible
      }
    )

    const currentRef = componentRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      // No need to disconnect if observing only one element and unobserving it
      // observer.disconnect();
    }
  }, [])

  // --- ECharts Gauge Option Function ---
  const getGaugeOption = (
    value: number,
    label: string,
    color: string,
    max?: number
  ) => {
    // Determine a sensible max value if not provided, for gauge visualization
    const effectiveMax = max || Math.ceil((value * 1.3) / 100) * 100 // Example: Round up to next hundred after adding 30%

    return {
      series: [
        {
          type: 'gauge',
          startAngle: 90, // Start from top
          endAngle: -270, // Full circle
          pointer: {
            show: false // Hide the needle pointer
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              borderWidth: 1,
              borderColor: color,
              color: color // Main progress color
            }
          },
          axisLine: {
            lineStyle: {
              width: 10, // Background track width
              color: [[1, '#e5e7eb']] // Background track color (light gray)
            }
          },
          splitLine: {
            show: false // Hide split lines
          },
          axisTick: {
            show: false // Hide ticks
          },
          axisLabel: {
            show: false // Hide axis labels
          },
          data: [
            {
              value: isVisible ? value : 0, // Animate from 0 when visible
              // name: label, // Name can be shown below if needed
              title: {
                // Hide title inside gauge
                show: false
              },
              detail: {
                // Display the value in the center
                valueAnimation: true, // Animate the value change
                formatter: '{value}',
                color: 'inherit', // Use parent color (set on card)
                fontSize: '1.5rem', // Adjust size as needed (e.g., text-2xl)
                fontWeight: 'bold',
                offsetCenter: ['0%', '0%'] // Center the number
              }
            }
          ],
          title: {
            // Display label below gauge (optional)
            show: false // Set to true if you want label below chart inside card
            // offsetCenter: [0, '70%'],
            // fontSize: 12,
          },
          detail: {
            show: true, // Ensure detail (the number) is shown
            valueAnimation: true,
            fontSize: 24, // Tailwind text-2xl approx
            fontWeight: 'bold',
            offsetCenter: [0, '5%'], // Adjust vertical position slightly if needed
            color: 'inherit' // Inherit text color from parent
          },
          max: effectiveMax, // Set the max value for the gauge
          animationDuration: 1500, // Control ECharts animation speed
          animationEasing: 'cubicOut'
        }
      ],
      // Optional: Add tooltip configuration if needed on hover
      tooltip: {
        formatter: `${label}: {c}`
      }
    }
  }

  return (
    <section
      id='consumer-insights'
      ref={componentRef}
      className='m-12 overflow-hidden rounded-lg bg-gray-50 py-4 shadow-lg dark:bg-gray-900 md:py-12' // Added background, increased padding
    >
      {/* Use container for max-width and centering */}
      <div className='container mx-auto px-0 md:px-6'>
        {/* Content Wrapper */}
        <div className='mx-auto mb-12 max-w-6xl text-center md:mb-16'>
          <h2 className='dark:text-button-dark mb-2 text-base font-semibold uppercase tracking-wider text-button'>
            {title}
          </h2>
          <h3 className='mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl'>
            {subtitle}
          </h3>
          <p className='text-lg text-gray-600 dark:text-gray-300'>
            {description}
          </p>
        </div>

        {/* --- Stats Cards Grid --- */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {statsData.map((stat, index) => (
            <div
              key={index}
              className='flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition-shadow duration-300 hover:shadow-lg dark:bg-gray-800'
            >
              {/* Icon */}
              <div className='mb-4 text-4xl' style={{ color: stat.color }}>
                <stat.Icon />
              </div>

              {/* ECharts Gauge */}
              <div className='mb-3 h-32 w-32'>
                {' '}
                {/* Fixed size container for chart */}
                <ReactECharts
                  option={getGaugeOption(stat.value, stat.label, stat.color)}
                  style={{ height: '100%', width: '100%' }}
                  notMerge={true} // Important for dynamic data updates
                  lazyUpdate={true}
                />
              </div>

              {/* Label */}
              <p className='mt-2 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* --- Button --- */}
        <div className='mt-12 text-center'>
          {' '}
          {/* Centered button */}
          <Link href='/conferences' legacyBehavior={false}>
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
