// src/hooks/home/chartOptionBuilder.ts
// Hoặc: src/components/IntroduceVisualization/utils/chartOptionBuilder.ts

import type { EChartsOption } from '@/src/lib/echarts'; // Đảm bảo đường dẫn này đúng
// Nếu bạn không có '@/src/lib/echarts', hãy sử dụng định nghĩa EChartsOption từ types.ts
// import type { EChartsOption } from './types';

import type {
  ContinentData,
  ChartType,
  TranslationFunction
} from './types'; // Đảm bảo đường dẫn này đúng

interface ChartOptionConfig {
  chartType: ChartType;
  chartData: ContinentData[];
  t: TranslationFunction; // Sử dụng type TranslationFunction đã định nghĩa
}

export const getEchartsOption = ({
  chartType,
  chartData,
  t
}: ChartOptionConfig): EChartsOption => {
  // Helper function để dịch tên lục địa, đặt bên trong để truy cập `t`
  const formatAxisTick = (tickItem: string): string => {
    try {
      // Lỗi đã được sửa ở đây, vì `t` giờ đã có kiểu đúng là (key: string) => string
      return t(`continent.${tickItem}`);
    } catch (e) {
      // console.warn(
      //   `next-intl MISSING_MESSAGE: Could not resolve IntroduceVisualization.continent.${tickItem}. Check your messages file.`,
      //   e
      // );
      return tickItem; // Trả về nguyên bản nếu không dịch được
    }
  };

  const baseOption: EChartsOption = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: chartType === 'pie' ? '15%' : '18%',
      top: '5%',
      containLabel: true
    },
    tooltip: {
      trigger: chartType === 'pie' ? 'item' : 'axis',
      formatter: (params: any) => {
        const param = Array.isArray(params) ? params[0] : params;
        if (!param || param.value === undefined || param.value === null) return '';

        const originalId = param.data?.id;
        const continentName = originalId
          ? t(`continent.${originalId}`)
          : param.name || t('unknown'); // Sử dụng t để dịch 'unknown'
        const value = param.value;
        const color = param.color || param.data?.itemStyle?.color;

        return `
          <div class='rounded border border-gray-20 bg-white-pure p-2 text-sm shadow-lg backdrop-blur-sm'>
            <p class='font-semibold'>${continentName}</p>
            <p style='color: ${color}'>
              <span style='display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};'></span>
              ${t('valueLabel')}: ${value}
            </p>
          </div>
        `;
      },
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      padding: 0
    },
    animationDuration: 500,
    animationEasing: 'cubicInOut'
  };

  switch (chartType) {
    case 'bar': {
      const categories = chartData.map(item => formatAxisTick(item.id));
      const seriesData = chartData.map(item => ({
        value: item.value,
        id: item.id,
        itemStyle: { color: item.colorHex, borderRadius: [4, 4, 0, 0] }
      }));

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
          axisTick: { alignWithLabel: true }
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontSize: 10, color: '#6b7280' },
          splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
        },
        series: [
          {
            name: t('valueLabel'), // Sử dụng t để dịch 'valueLabel'
            type: 'bar',
            data: seriesData,
            barWidth: '60%'
          }
        ]
      };
    }

    case 'pie': {
      const pieData = chartData.map(item => ({
        name: formatAxisTick(item.id),
        value: item.value,
        id: item.id,
        itemStyle: {
          color: item.colorHex,
          borderColor: item.colorHex,
          borderWidth: 1
        }
      }));

      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          formatter: !Array.isArray(baseOption.tooltip)
            ? baseOption.tooltip?.formatter
            : undefined
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          bottom: '2%',
          left: 'center',
          itemWidth: 10,
          itemHeight: 10,
          icon: 'circle',
          textStyle: { fontSize: 10, color: 'var(--primary)' },
          data: pieData.map(item => ({
            name: item.name,
            itemStyle: { color: item.itemStyle.color }
          }))
        },
        series: [
          {
            name: t('valueLabel'), // Sử dụng t để dịch 'valueLabel'
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            label: { show: false },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            labelLine: { show: false },
            data: pieData,
            itemStyle: { borderWidth: 2, borderColor: '#ffffff' }
          }
        ]
      };
    }

    case 'line': {
      const categories = chartData.map(item => formatAxisTick(item.id));
      const seriesData = chartData.map(item => ({
        value: item.value,
        id: item.id,
        itemStyle: { color: item.colorHex }
      }));

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
          axisTick: { alignWithLabel: true }
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontSize: 10, color: '#6b7280' },
          splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
        },
        series: [
          {
            name: t('valueLabel'), // Sử dụng t để dịch 'valueLabel'
            type: 'line',
            smooth: true,
            data: seriesData,
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#3b82f6', width: 2 },
            itemStyle: {
              color: (params: any) =>
                params.data?.itemStyle?.color || '#3b82f6',
              borderColor: '#ffffff',
              borderWidth: 1
            },
            emphasis: {
              focus: 'series',
              itemStyle: { borderWidth: 2, borderColor: '#ffffff' }
            }
          }
        ]
      };
    }
    default:
      return baseOption;
  }
};