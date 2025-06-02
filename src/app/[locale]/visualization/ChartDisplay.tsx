// src/app/[locale]/visualization/ChartDisplay.tsx
import React, { useRef, useEffect, useCallback } from 'react'
import ReactECharts from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type {
  EChartsOption,
  EChartsType
} from '@/src/models/visualization/echarts'
import { ChartConfig } from '@/src/models/visualization/visualization'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import Loading from '../utils/Loading'
import { debounce } from 'lodash'
import { useTranslations } from 'next-intl'

// --- Register ECharts components ---
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  CanvasRenderer
])

interface ChartDisplayProps {
  option: EChartsOption | null
  isLoading: boolean
  isReady: boolean
  config: ChartConfig
  onDownloadSvg: () => void
  chartHeight?: string | number
  getChartInstance?: (instance: EChartsType | null | undefined) => void
}

const logPrefixCD = '[ChartDisplay]'

const ChartDisplay: React.FC<ChartDisplayProps> = ({
  option,
  isLoading,
  isReady,
  config,
  onDownloadSvg,
  chartHeight = '100%',
  getChartInstance
}) => {
  const t = useTranslations()

  const chartRef = useRef<ReactECharts | null>(null)
  const chartContainerRef = useRef<HTMLDivElement | null>(null)

  const debouncedChartResize = useCallback(
    debounce(() => {
      const instance = chartRef.current?.getEchartsInstance() as
        | EChartsType
        | undefined
      if (instance) {
        // console.log(`${logPrefixCD} Resizing chart instance.`);
        instance.resize()
      }
    }, 150), // Debounce time can be adjusted
    []
  )

  useEffect(() => {
    const containerElement = chartContainerRef.current
    let observer: ResizeObserver | null = null

    if (containerElement) {
      // console.log(`${logPrefixCD} Observing chart container for resize.`);
      observer = new ResizeObserver(() => {
        // console.log(`${logPrefixCD} Chart container resized, debouncing chart resize.`);
        debouncedChartResize()
      })
      observer.observe(containerElement)
    }

    const instance = chartRef.current?.getEchartsInstance() as
      | EChartsType
      | undefined
    if (getChartInstance) {
      getChartInstance(instance)
    }

    return () => {
      if (observer && containerElement) {
        // console.log(`${logPrefixCD} Disconnecting ResizeObserver.`);
        observer.unobserve(containerElement) // More specific cleanup
        observer.disconnect()
      }
      debouncedChartResize.cancel()
    }
  }, [debouncedChartResize, getChartInstance])

  const getPlaceholderMessage = useCallback((): string => {
    const { chartType, xAxis, yAxis, color } = config
    switch (chartType) {
      case 'pie':
        if (!color?.fieldId)
          return t('Please_select_a_field_for_Slices_Color_Dimension')
        if (!yAxis?.fieldId)
          return t('Please_select_a_field_for_Value_Slice_Size_Measure')
        break
      case 'bar':
      case 'line':
      default:
        if (!xAxis?.fieldId)
          return t('Please_select_a_field_for_the_XAxis_Category_Dimension')
        if (!yAxis?.fieldId)
          return t('Please_select_a_field_for_the_YAxis_Value_Measure')
        break
    }
    return t('Configure_the_chart_using_the_panels_or_check_data_processing')
  }, [config, t]) // Added t to dependency array

  return (
    <div
      ref={chartContainerRef}
      className='relative h-full flex-1 min-w-0 overflow-hidden rounded-lg bg-gray-10 p-4 pt-10 shadow-inner' // CHANGED: flex-grow to flex-1 and added min-w-0
    >
      {/* Action Buttons - Kept commented as in original */}
      {/* <div className='absolute right-3 top-2.5 z-10 flex space-x-1.5'> ... </div> */}

      {/* Loading Overlay */}
      {isLoading && (
        <div className='absolute inset-0 z-20 flex items-center justify-center bg-white-pure backdrop-blur-sm'>
          <Loading />
        </div>
      )}

      {/* Placeholder/Instructions */}
      {!isLoading && !isReady && (
        <div className='flex h-full flex-col items-center justify-center text-center'>
          <p className='mb-2'>{getPlaceholderMessage()}</p>
          <p className='text-sm'>
            {t(
              'Drag_fields_from_the_left_panel_to_the_configuration_zones_on_the_right'
            )}
          </p>
        </div>
      )}

      {/* ECharts Component */}
      {!isLoading && isReady && option && (
        <ReactECharts
          ref={chartRef}
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          style={{ height: chartHeight, width: '100%' }} // width: '100%' is correct, it will fill the parent
        />
      )}
    </div>
  )
}

export default ChartDisplay