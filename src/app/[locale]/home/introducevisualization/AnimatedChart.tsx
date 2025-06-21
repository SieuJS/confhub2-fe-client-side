// src/components/IntroduceVisualization/AnimatedChart.tsx
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ReactECharts from 'echarts-for-react'
import { echarts } from '@/src/lib/echarts'
import { getEchartsOption } from '@/src/hooks/home/chartOptionBuilder'
import type { ContinentData, ChartType } from '@/src/hooks/home/types'

interface AnimatedChartProps {
  chartData: ContinentData[]
  chartType: ChartType
  currentDataSetIndex: number
}

// Hook nhỏ để kiểm tra component đã được mount ở client chưa
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  chartData,
  chartType,
  currentDataSetIndex
}) => {
  const t = useTranslations('IntroduceVisualization')
  const isClient = useIsClient()

  const translatedChartType = t(
    chartType === 'bar'
      ? 'chartTypeBar'
      : chartType === 'pie'
        ? 'chartTypePie'
        : 'chartTypeLine'
  )

  if (!isClient) {
    return (
      <div className='flex h-80 items-center justify-center lg:h-96'>
        <p>{t('Loading_Chart')}</p>
      </div>
    )
  }

  const option = getEchartsOption({ chartData, chartType, t })

  return (
    <div className='mt-8 w-full lg:mt-0 lg:w-1/2'>
      {/* CSS Keyframes cho hiệu ứng fade */}
      <style>{`
        @keyframes fadeSimple {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-simple {
             animation: fadeSimple 0.5s ease-in-out forwards;
        }
      `}</style>
      <div className='relative flex h-80 items-center justify-center overflow-hidden rounded-lg p-2 lg:h-96'>
        <div
          key={`${chartType}-${currentDataSetIndex}`}
          className='animate-fade-simple h-full w-full'
        >
          <ReactECharts
            echarts={echarts}
            option={option}
            notMerge={true}
            lazyUpdate={true}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>
      <p className='mt-3 text-center text-sm italic'>
        {t('chartExampleLabel', { chartType: translatedChartType })}
      </p>
    </div>
  )
}

export default AnimatedChart