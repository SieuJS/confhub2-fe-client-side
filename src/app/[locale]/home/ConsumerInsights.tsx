import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Odometer from 'react-odometerjs' // Import Odometer
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import {
  FaUsers,
  FaChartBar,
  FaMapMarkedAlt,
  FaHandshake
} from 'react-icons/fa'

// --- IMPORT ODOMETER CSS ---
// Choose one theme. Import it globally (e.g., in _app.tsx) or here.
// Make sure the path is correct based on your node_modules structure.
import 'odometer/themes/odometer-theme-default.css' // Or choose another theme like digital, minimal etc.

// Interface remains simple
interface ConsumerInsightsProps {}

const ConsumerInsights: React.FC<ConsumerInsightsProps> = ({}) => {
  const t = useTranslations('ConsumerInsights')
  const title = t('title')
  const subtitle = t('subtitle')
  const description = t('description')
  const buttonText = t('buttonText')

  const statsData = [
    { value: 956, label: t('stats.0'), Icon: FaUsers, color: '#3b82f6' }, // Blue
    { value: 25000, label: t('stats.1'), Icon: FaChartBar, color: '#10b981' }, // Emerald
    { value: 120, label: t('stats.2'), Icon: FaMapMarkedAlt, color: '#f59e0b' }, // Amber
    { value: 75, label: t('stats.3'), Icon: FaHandshake, color: '#ef4444' } // Red
  ]

  // --- Visibility State and Observer ---
  // We need this again because react-odometerjs doesn't have built-in scroll spying
  const [isVisible, setIsVisible] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target) // Stop observing once visible
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
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // Note: Odometer formatting (like 'k' suffix) is less flexible than CountUp.
  // It primarily formats numbers with digits and separators.
  // We will display the full number here.

  return (
    <section
      id='consumer-insights'
      ref={componentRef} // Attach ref for IntersectionObserver
      className='m-12 overflow-hidden rounded-lg bg-gray-50 py-8 shadow-lg dark:bg-gray-900 md:py-16'
    >
      <div className='container mx-auto px-4 md:px-6'>
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

        {/* Stats Cards Grid */}
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

              {/* --- Animated Number Display using react-odometerjs --- */}
              <p
                className='mb-2 text-4xl font-bold md:text-5xl' // Apply styling to the parent
                style={{ color: stat.color }}
              >
                <Odometer
                  value={isVisible ? stat.value : 0} // Animate from 0 to value when visible
                  format='(,ddd)' // Example format: adds comma separators for thousands
                  duration={1000} // Animation duration in milliseconds
                  // animation="smooth" // Optional: control animation style via JS if needed, usually handled by CSS theme
                />
              </p>

              {/* Label */}
              <p className='mt-1 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className='mt-12 text-center md:mt-16'>
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
