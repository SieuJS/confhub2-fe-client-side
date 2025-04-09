// src/components/IntroduceVisualization.tsx

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts'

// --- Định nghĩa interface và dữ liệu mẫu giữ nguyên ---
interface ContinentData {
  id: string
  value: number
  colorHex: string
}

const sampleDataSets: ContinentData[][] = [
  // Giữ nguyên dữ liệu
  [
    { id: 'asia', value: 45, colorHex: '#3b82f6' },
    { id: 'europe', value: 38, colorHex: '#22c55e' },
    { id: 'northAmerica', value: 28, colorHex: '#ef4444' },
    { id: 'southAmerica', value: 15, colorHex: '#eab308' },
    { id: 'africa', value: 12, colorHex: '#a855f7' },
    { id: 'oceania', value: 8, colorHex: '#ec4899' }
  ],
  [
    { id: 'asia', value: 50, colorHex: '#3b82f6' },
    { id: 'europe', value: 35, colorHex: '#22c55e' },
    { id: 'northAmerica', value: 32, colorHex: '#ef4444' },
    { id: 'southAmerica', value: 18, colorHex: '#eab308' },
    { id: 'africa', value: 10, colorHex: '#a855f7' },
    { id: 'oceania', value: 7, colorHex: '#ec4899' }
  ],
  [
    { id: 'asia', value: 40, colorHex: '#3b82f6' },
    { id: 'europe', value: 42, colorHex: '#22c55e' },
    { id: 'northAmerica', value: 25, colorHex: '#ef4444' },
    { id: 'southAmerica', value: 20, colorHex: '#eab308' },
    { id: 'africa', value: 15, colorHex: '#a855f7' },
    { id: 'oceania', value: 9, colorHex: '#ec4899' }
  ]
]

const chartTypes: ('bar' | 'pie' | 'line')[] = ['bar', 'pie', 'line']

// --- Component chính sử dụng Recharts ---
const IntroduceVisualization: React.FC = () => {
  const t = useTranslations('IntroduceVisualization')

  const [currentDataSetIndex, setCurrentDataSetIndex] = useState(0)
  const [currentChartTypeIndex, setCurrentChartTypeIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const chartData = sampleDataSets[currentDataSetIndex]
  const chartType = chartTypes[currentChartTypeIndex]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentChartTypeIndex(prevIndex => {
        const nextTypeIndex = (prevIndex + 1) % chartTypes.length
        if (nextTypeIndex === 0) {
          setCurrentDataSetIndex(
            prevDataIndex => (prevDataIndex + 1) % sampleDataSets.length
          )
        }
        return nextTypeIndex
      })
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  // ----- Helper Functions cho Recharts (Giữ nguyên) -----
  const formatAxisTick = (tickItem: string) => {
    try {
      return t(`continent.${tickItem}`)
    } catch (e) {
      return tickItem
    }
  }

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const continentName = formatAxisTick(label || data.id)
      const value = payload[0].value
      return (
        <div className='rounded border border-gray-200 bg-white/80 p-2 text-sm shadow-lg backdrop-blur-sm'>
          <p className='font-semibold'>{continentName}</p>
          <p
            style={{ color: payload[0].color || data.colorHex }}
          >{`${t('valueLabel')}: ${value}`}</p>
        </div>
      )
    }
    return null
  }

  const renderCustomLegend = (props: any) => {
    const { payload } = props
    return (
      <ul className='mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs'>
        {payload.map((entry: any, index: number) => {
          const continentName = formatAxisTick(entry.payload?.id || entry.value)
          return (
            <li key={`item-${index}`} className='flex items-center'>
              <span
                className='mr-1 h-2 w-2 rounded-full'
                style={{ backgroundColor: entry.color }}
              ></span>
              <span style={{ color: entry.color }}>{continentName}</span>
            </li>
          )
        })}
      </ul>
    )
  }

  // ----- Render biểu đồ bằng Recharts -----
  const renderChart = () => {
    if (!isClient) {
      return (
        <div className='flex h-full items-center justify-center text-gray-400'>
          Loading Chart...
        </div>
      )
    }

    // Khai báo với kiểu rõ ràng hơn để TypeScript hiểu
    let chartElement: React.ReactElement | null = null

    // --- Logic gán chartElement (Giữ nguyên) ---
    if (chartType === 'bar') {
      chartElement = (
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -25, bottom: 35 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            vertical={false}
            stroke='#e5e7eb'
          />
          <XAxis
            dataKey='id'
            tickFormatter={formatAxisTick}
            angle={-30}
            textAnchor='end'
            interval={0}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
          <Tooltip
            content={renderCustomTooltip}
            cursor={{ fill: 'rgba(209, 213, 219, 0.3)' }}
          />
          <Bar
            dataKey='value'
            radius={[4, 4, 0, 0]}
            animationDuration={500} // Có thể giữ hoặc tăng lại nếu muốn
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.colorHex} />
            ))}
          </Bar>
        </BarChart>
      )
    } else if (chartType === 'pie') {
      chartElement = (
        <PieChart data={chartData}>
          <Pie
            data={chartData}
            cx='50%'
            cy='45%'
            outerRadius='75%'
            innerRadius='40%'
            dataKey='value'
            nameKey='id'
            paddingAngle={2}
            animationDuration={500} // Có thể giữ hoặc tăng lại nếu muốn
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.colorHex}
                stroke={entry.colorHex}
              />
            ))}
          </Pie>
          <Tooltip content={renderCustomTooltip} />
          <Legend
            content={renderCustomLegend}
            verticalAlign='bottom'
            wrapperStyle={{ fontSize: '10px', marginTop: '15px' }}
          />
        </PieChart>
      )
    } else if (chartType === 'line') {
      chartElement = (
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 15, left: -25, bottom: 35 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            vertical={false}
            stroke='#e5e7eb'
          />
          <XAxis
            dataKey='id'
            tickFormatter={formatAxisTick}
            angle={-30}
            textAnchor='end'
            interval={0}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
          <Tooltip content={renderCustomTooltip} />
          <Line
            type='monotone'
            dataKey='value'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 1 }}
            activeDot={{
              r: 6,
              fill: '#3b82f6',
              stroke: '#ffffff',
              strokeWidth: 2
            }}
            animationDuration={500} // Có thể giữ hoặc tăng lại nếu muốn
          />
        </LineChart>
      )
    }

    // --- SỬA LỖI TS2322: Kiểm tra chartElement trước khi dùng ---
    // Mặc dù logic trên đảm bảo nó không null khi isClient=true,
    // việc kiểm tra này giúp TypeScript yên tâm.
    if (!chartElement) {
      return null // Trả về null nếu vì lý do nào đó chartElement không được gán
    }

    // --- QUAY LẠI HIỆU ỨNG FADE ---
    return (
      <div
        key={chartType} // Key để trigger animation khi chartType thay đổi
        className='animate-fade-simple h-full w-full' // Sử dụng lại class fade
        // Không cần style transform-origin nữa
      >
        {/* ResponsiveContainer giờ đây nhận chartElement (đã chắc chắn là ReactElement) */}
        <ResponsiveContainer width='100%' height='100%'>
          {chartElement}
        </ResponsiveContainer>
      </div>
    )
  }

  // Lấy tên biểu đồ đã dịch (Giữ nguyên)
  const translatedChartType = t(
    chartType === 'bar'
      ? 'chartTypeBar'
      : chartType === 'pie'
        ? 'chartTypePie'
        : 'chartTypeLine'
  )

  return (
    <section
      aria-labelledby='visualization-intro-heading'
      className='my-8 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6 shadow-lg md:p-10'
    >
      {/* --- QUAY LẠI HIỆU ỨNG FADE: Khôi phục CSS Keyframes --- */}
      <style>{`
            @keyframes fadeSimple {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-simple {
                 /* Áp dụng lại animation fade */
                 animation: fadeSimple 0.5s ease-in-out forwards;
            }
       `}</style>

      <div className='container mx-auto flex flex-col items-center gap-8 lg:flex-row lg:gap-12'>
        {/* Phần nội dung văn bản (Giữ nguyên) */}
        <div className='text-center lg:w-1/2 lg:text-left'>
          <h2
            id='visualization-intro-heading'
            className='mb-4 text-3xl font-bold text-gray-800 md:text-4xl'
          >
            {t('heading')}
          </h2>
          <p className='mb-6 text-lg leading-relaxed text-gray-600'>
            {t('description')}
          </p>
          <Link
            href={`/visualization`}
            className='group inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            aria-label={t('buttonAriaLabel')}
          >
            <span>{t('buttonText')}</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M17 8l4 4m0 0l-4 4m4-4H3'
              />
            </svg>
          </Link>
        </div>

        {/* Phần hiển thị biểu đồ mô phỏng (Giữ nguyên cấu trúc) */}
        <div className='mt-8 w-full lg:mt-0 lg:w-1/2'>
          <div className='relative flex h-80 items-center justify-center overflow-hidden rounded-lg  p-4  lg:h-96'>
            {/* Render biểu đồ Recharts */}
            {renderChart()}
          </div>
          <p className='mt-3 text-center text-sm italic '>
            {t('chartExampleLabel', { chartType: translatedChartType })}
          </p>
        </div>
      </div>
    </section>
  )
}

export default IntroduceVisualization
