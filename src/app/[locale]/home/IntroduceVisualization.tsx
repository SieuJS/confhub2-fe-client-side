// src/components/IntroduceVisualization.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core' // Import core echarts
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent // Import MarkLine if needed later, not strictly for basic charts
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts' // Import EChartsOption type

// Register necessary components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  BarChart,
  PieChart,
  LineChart,
  CanvasRenderer
])

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

// --- Component chính sử dụng ECharts ---
const IntroduceVisualization: React.FC = () => {
  const t = useTranslations('IntroduceVisualization')

  const [currentDataSetIndex, setCurrentDataSetIndex] = useState(0)
  const [currentChartTypeIndex, setCurrentChartTypeIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const chartData = useMemo(
    () => sampleDataSets[currentDataSetIndex],
    [currentDataSetIndex]
  )
  const chartType = useMemo(
    () => chartTypes[currentChartTypeIndex],
    [currentChartTypeIndex]
  )

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
    }, 3000) // Giữ nguyên interval 3 giây

    return () => clearInterval(intervalId)
  }, [])

  // ----- Helper Function cho định dạng tên lục địa (Giữ nguyên) -----
  const formatAxisTick = (tickItem: string): string => {
    try {
      // Sử dụng tên id làm key dịch
      return t(`continent.${tickItem}`)
    } catch (e) {
      console.warn(`Missing translation for continent.${tickItem}`)
      return tickItem // Fallback về id nếu không có bản dịch
    }
  }

  // ----- Hàm tạo ECharts Option -----
  const getEchartsOption = (): EChartsOption => {
    const baseOption: EChartsOption = {
      // Cấu hình cơ bản có thể áp dụng cho nhiều loại biểu đồ
      grid: {
        left: '3%',
        right: '4%',
        bottom: chartType === 'pie' ? '15%' : '18%', // Tăng bottom cho Pie để chứa legend
        top: '5%',
        containLabel: true // Đảm bảo label không bị cắt
      },
      tooltip: {
        trigger: chartType === 'pie' ? 'item' : 'axis', // Trigger khác nhau cho Pie và các loại khác
        formatter: (params: any) => {
          // Echarts formatter nhận params khác Recharts
          const param = Array.isArray(params) ? params[0] : params
          if (!param || param.value === undefined || param.value === null) {
            return ''
          }
          const continentId = param.name || param.data?.id // Lấy id từ name (axis) hoặc data (pie)
          const continentName = formatAxisTick(continentId)
          const value = param.value
          const color = param.color || param.data?.itemStyle?.color // Lấy màu

          // Tạo HTML tooltip đơn giản
          return `
            <div class='rounded border border-gray-200 bg-white/90 p-2 text-sm shadow-lg backdrop-blur-sm'>
              <p class='font-semibold'>${continentName}</p>
              <p style='color: ${color}'>
                <span style='display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};'></span>
                ${t('valueLabel')}: ${value}
              </p>
            </div>
          `
        },
        backgroundColor: 'transparent', // Để style bằng CSS class ở trên
        borderColor: 'transparent',
        padding: 0 // Bỏ padding mặc định của ECharts
      },
      animationDuration: 500, // Giữ animation duration
      animationEasing: 'cubicInOut'
    }

    // --- Cấu hình cụ thể cho từng loại biểu đồ ---
    switch (chartType) {
      case 'bar': {
        const categories = chartData.map(item => formatAxisTick(item.id))
        const seriesData = chartData.map(item => ({
          value: item.value,
          itemStyle: {
            color: item.colorHex,
            borderRadius: [4, 4, 0, 0] // Tương đương radius của Recharts Bar
          }
        }))

        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
              interval: 0, // Hiển thị tất cả các label
              rotate: -30, // Xoay label
              fontSize: 10,
              color: '#6b7280',
              margin: 12 // Khoảng cách từ label đến trục (tương đương dy)
            },
            axisTick: {
              alignWithLabel: true
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 10,
              color: '#6b7280'
            },
            splitLine: {
              // Tương đương CartesianGrid ngang
              lineStyle: {
                type: 'dashed',
                color: '#e5e7eb'
              }
            }
          },
          series: [
            {
              name: t('valueLabel'), // Tên series (hiển thị trong tooltip nếu có nhiều series)
              type: 'bar',
              data: seriesData,
              barWidth: '60%' // Điều chỉnh độ rộng cột nếu cần
            }
          ]
        }
      }

      case 'pie': {
        const pieData = chartData.map(item => ({
          name: formatAxisTick(item.id), // Tên hiển thị trong legend và tooltip
          value: item.value,
          id: item.id, // Giữ lại id gốc nếu cần tham chiếu
          itemStyle: {
            color: item.colorHex,
            borderColor: item.colorHex, // Thêm border để giống Recharts Cell
            borderWidth: 1
          }
        }))

        return {
          ...baseOption,
          tooltip: {
            // Override tooltip trigger for pie
            trigger: 'item',
            formatter: !Array.isArray(baseOption.tooltip)
              ? baseOption.tooltip?.formatter
              : undefined // Sử dụng lại formatter đã định nghĩa nếu không phải là mảng
          },
          legend: {
            type: 'scroll', // Cho phép cuộn nếu legend quá dài
            orient: 'horizontal',
            bottom: '2%', // Đặt legend ở dưới cùng
            left: 'center',
            itemWidth: 10, // Kích thước icon legend
            itemHeight: 10,
            icon: 'circle', // Hình dạng icon legend
            textStyle: {
              fontSize: 10,
              color: '#6b7280'
            },
            // ECharts tự động lấy data và màu từ series.data cho Pie
            // Không cần formatter phức tạp như Recharts renderCustomLegend
            data: pieData.map(item => ({
              name: item.name,
              itemStyle: { color: item.itemStyle.color } // Đảm bảo màu legend đúng
            }))
          },
          series: [
            {
              name: t('valueLabel'),
              type: 'pie',
              radius: ['40%', '70%'], // Tương đương innerRadius, outerRadius
              center: ['50%', '45%'], // Điều chỉnh vị trí tâm Pie
              avoidLabelOverlap: true, // Tránh label chồng chéo (nếu hiển thị label)
              label: {
                show: false // Ẩn label mặc định trên lát bánh
                // position: 'center' // Có thể hiển thị ở giữa nếu cần
              },
              emphasis: {
                // Hiệu ứng khi hover
                label: {
                  // show: true, // Hiển thị label khi hover nếu muốn
                  // fontSize: '14',
                  // fontWeight: 'bold'
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
              },
              labelLine: {
                show: false // Ẩn đường nối label
              },
              data: pieData,
              itemStyle: {
                // Thêm khoảng cách giữa các lát bánh
                borderWidth: 2, // Điều chỉnh độ rộng khoảng cách
                borderColor: '#ffffff' // Màu của khoảng cách (thường là màu nền)
              }
            }
          ]
        }
      }

      case 'line': {
        const categories = chartData.map(item => formatAxisTick(item.id))
        const seriesData = chartData.map(item => item.value)

        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
              interval: 0,
              rotate: -30,
              fontSize: 10,
              color: '#6b7280',
              margin: 12
            },
            axisTick: {
              alignWithLabel: true
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 10,
              color: '#6b7280'
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#e5e7eb'
              }
            }
          },
          series: [
            {
              name: t('valueLabel'),
              type: 'line',
              smooth: true, // Tương đương type='monotone' của Recharts
              data: seriesData,
              showSymbol: true, // Hiển thị các điểm (dot)
              symbol: 'circle', // Hình dạng điểm
              symbolSize: 6, // Kích thước điểm (tương đương r=3)
              lineStyle: {
                color: '#3b82f6', // Màu đường line
                width: 2
              },
              itemStyle: {
                // Style cho điểm (dot)
                color: '#3b82f6', // Màu nền điểm
                borderColor: '#ffffff', // Màu viền điểm
                borderWidth: 1
              },
              emphasis: {
                // Style khi hover (tương đương activeDot)
                focus: 'series', // Làm nổi bật cả series khi hover
                itemStyle: {
                  // symbolSize: 8,
                  borderWidth: 2,
                  borderColor: '#ffffff'
                  // color: '#3b82f6' // Màu giữ nguyên
                }
              }
            }
          ]
        }
      }
      default:
        return baseOption // Trả về option cơ bản nếu không khớp loại nào
    }
  }

  // ----- Render biểu đồ bằng ECharts -----
  const renderChart = () => {
    if (!isClient) {
      return (
        <div className='flex h-full items-center justify-center text-gray-400'>
          Loading Chart...
        </div>
      )
    }

    const option = getEchartsOption()

    return (
      <div
        key={chartType} // Key để trigger animation khi chartType thay đổi
        className='animate-fade-simple h-full w-full' // Sử dụng lại class fade
      >
        <ReactECharts
          echarts={echarts} // Truyền instance echarts đã import
          option={option}
          notMerge={true} // Quan trọng: không merge option cũ và mới, thay thế hoàn toàn
          lazyUpdate={true} // Cập nhật lazy để tối ưu performance
          style={{ height: '100%', width: '100%' }}
        />
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
      className='m-0 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6 shadow-lg md:m-12 md:p-4'
    >
      {/* --- CSS Keyframes cho fade (Giữ nguyên) --- */}
      <style>{`
            @keyframes fadeSimple {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-simple {
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
            className='group inline-flex items-center justify-center rounded-lg bg-button px-6 py-3 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-button focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
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

        {/* Phần hiển thị biểu đồ mô phỏng (Sử dụng ECharts) */}
        <div className='mt-8 w-full lg:mt-0 lg:w-1/2'>
          <div className='relative flex h-80 items-center justify-center overflow-hidden rounded-lg p-2 lg:h-96'>
            {/* Render biểu đồ ECharts */}
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
