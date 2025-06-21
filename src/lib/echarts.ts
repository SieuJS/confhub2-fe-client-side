// src/lib/echarts.ts
import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

// Đăng ký các thành phần cần thiết cho ECharts
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  PieChart,
  LineChart,
  CanvasRenderer
])

// Xuất khẩu instance đã được cấu hình và các type cần thiết
export { echarts }
export type { EChartsOption }