// src/app/[locale]/journal/detail/QuartileHistoryChart.tsx
'use client'

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { EChartsOption, LineSeriesOption } from 'echarts' // <-- THÊM IMPORT

// Định nghĩa kiểu dữ liệu đầu vào cho rõ ràng
interface QuartileData {
  Category: string
  Year: string
  Quartile: string // "Q1", "Q2", etc.
}

interface Props {
  data: QuartileData[]
  t: (key: string) => string
}

/**
 * Hàm trợ giúp chuyển đổi chuỗi Quartile thành giá trị số để vẽ biểu đồ.
 * ECharts sẽ vẽ giá trị cao hơn ở trên, nên ta đảo ngược: Q1 (tốt nhất) -> 4, Q4 (thấp nhất) -> 1.
 * @param quartile - Chuỗi như "Q1", "Q2"
 * @returns - Số từ 1 đến 4
 */
const getQuartileValue = (quartile: string): number => {
  return 5 - parseInt(quartile.replace('Q', ''))
}

export const QuartileHistoryChart: React.FC<Props> = ({ data, t }) => {
  const chartOption = useMemo((): EChartsOption => {
    const years = [...new Set(data.map(item => item.Year))].sort()
    const categories = [...new Set(data.map(item => item.Category))]

    // Khai báo kiểu rõ ràng cho biến 'series'
    const series: LineSeriesOption[] = categories.map(category => {
      // <-- SỬA Ở ĐÂY
      return {
        name: category,
        type: 'line', // TypeScript bây giờ sẽ kiểm tra giá trị này so với LineSeriesOption
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: years.map(year => {
          const item = data.find(
            d => d.Year === year && d.Category === category
          )
          return item ? getQuartileValue(item.Quartile) : null
        })
      }
    })

    // 3. Xây dựng đối tượng option hoàn chỉnh cho ECharts
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let tooltipHtml = `${params[0].axisValueLabel}<br/>`
          params.forEach((param: any) => {
            // Chuyển giá trị số ngược lại thành chuỗi Quartile để hiển thị
            const quartileString = `Q${5 - param.value}`
            tooltipHtml += `
              <div style="display: flex; align-items: center; gap: 8px;">
                ${param.marker} 
                <span>${param.seriesName}: <b>${quartileString}</b></span>
              </div>
            `
          })
          return tooltipHtml
        }
      },
      legend: {
        data: categories,
        bottom: 0, // Đặt chú thích ở dưới cùng
        type: 'scroll' // Cho phép cuộn nếu có quá nhiều chú thích
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%', // Dành không gian cho legend
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: years
      },
      yAxis: {
        type: 'value',
        min: 1,
        max: 4,
        interval: 1, // Đảm bảo các vạch chia là 1, 2, 3, 4
        // Đây là phần quan trọng: hiển thị label Q1, Q2... thay vì số
        axisLabel: {
          formatter: (value: number) => `Q${5 - value}`
        }
      },
      series: series,
      // Tùy chọn: Thêm màu sắc cho đẹp hơn
      color: ['#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE']
    }
  }, [data]) // Phụ thuộc vào `data`

  return (
    <section
      id='quartile-history'
      className='border-border scroll-mt-28 border-b py-8 md:py-12'
    >
      <h2 className='mb-6 text-2xl font-bold  md:text-3xl'>
        {t('QuartileHistory.title')}
      </h2>
      <div className='rounded-lg bg-background p-2  shadow-sm'>
        <ReactECharts
          option={chartOption}
          style={{ height: '450px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    </section>
  )
}
