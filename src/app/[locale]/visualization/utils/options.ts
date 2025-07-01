// src/app/[locale]/visualization/utils/options.ts
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { processDataForChart } from './processor'; // Import data processor

const logPrefixOptions = 'OPTIONS:';

/**
 * Generates the final ECharts option object.
 * @param rawData Array of ConferenceResponse items.
 * @param config User's chart configuration.
 * @param options Chart display options (title, legend, etc.).
 * @param availableFields List of all defined DataFields.
 * @returns EChartsOption object ready for rendering.
 */
export const generateChartOption = (
    rawData: ConferenceResponse[],
    config: ChartConfig,
    options: ChartOptions,
    availableFields: DataField[]
): EChartsOption => {
    // console.log(`${logPrefixOptions} generateChartOption: Start. Type: ${config.chartType}, Title: "${options.title}"`);

    // 1. Xử lý Dữ liệu
    // console.log(`${logPrefixOptions} generateChartOption: Calling processDataForChart...`);
    const { categories, series, legendData } = processDataForChart(rawData, config, availableFields);
    // console.log(`${logPrefixOptions} generateChartOption: Data processed. Series: ${series.length}, Categories: ${categories?.length}, Legend: ${legendData?.length}`);

    // Tìm các trường để lấy tên trục, v.v.
    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
    // REMOVED: sizeField không còn cần thiết

    // 2. Xác định Loại Trục
    // Vì scatter đã bị loại bỏ, trục X cho các biểu đồ thanh/đường luôn là 'category'.
    const xAxisType: 'category' = 'category';
    // console.log(`${logPrefixOptions} generateChartOption: X-Axis type: ${xAxisType}`);

    // 3. Xây dựng Tùy chọn Trục
    let xAxisOption: EChartsOption['xAxis'] = undefined;
    if (config.chartType !== 'pie') {
        // Logic chỉ còn lại cho xAxisType là 'category'
        xAxisOption = {
            type: 'category',
            name: xAxisField?.name,
            nameLocation: 'middle',
            nameGap: (categories && categories.length > 10) ? 40 : 25,
            nameTextStyle: { fontSize: 12 },
            data: categories,
            axisTick: { alignWithLabel: true },
            axisLabel: {
                fontSize: 10,
                rotate: (categories && categories.length > 10) ? 30 : 0,
                interval: (categories && categories.length > 20) ? 'auto' : 0,
            },
            boundaryGap: true,
        };
    }

    // 4. Xây dựng Cấu trúc Tùy chọn Cơ bản
    const finalOption: EChartsOption = {
        title: {
            text: options.title || 'Chart',
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'normal' },
        },
        tooltip: {
            trigger: config.chartType === 'pie' ? 'item' : 'axis',
            axisPointer: { type: 'cross' }, // Crosshair cho tooltip trục
        },
        legend: {
            show: options.showLegend && legendData && legendData.length > 0,
            type: 'scroll',
            orient: 'horizontal',
            left: 'center',
            bottom: 5,
            data: legendData,
            textStyle: { fontSize: 10 },
            itemWidth: 15,
            itemHeight: 10,
        },
        toolbox: {
            show: options.showToolbox,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            itemSize: 14,
            feature: {
                magicType: {
                    type: ['line', 'bar', 'stack'],
                    title: { line: 'Line', bar: 'Bar', stack: 'Stack', tiled: 'Tiled' }
                },
                restore: { title: 'Restore' },
                saveAsImage: {
                    name: options.title?.replace(/[^a-z0-9]/gi, '_') || 'chart',
                    type: 'png',
                    pixelRatio: 2,
                    title: 'Save PNG'
                },
                dataView: { readOnly: true, title: 'Data View', lang: ['Data View', 'Close', 'Refresh'] },
            },
        },
        grid: {
            left: '3%',
            right: '8%',
            bottom: options.showLegend && legendData && legendData.length > 0 ? '10%' : '5%',
            top: '15%',
            containLabel: true
        },
        xAxis: xAxisOption,
        yAxis: config.chartType !== 'pie' ? {
            type: 'value',
            name: yAxisField?.name,
            nameLocation: 'middle',
            nameGap: 45,
            nameTextStyle: { fontSize: 12 },
            axisLabel: {
                fontSize: 10,
            },
        } : undefined, // Không có yAxis cho Pie
        series: series,
    };

    // 5. Áp dụng các Ghi đè & Cải tiến Cụ thể cho Từng Biểu đồ

    // Biểu đồ Tròn:
    if (config.chartType === 'pie') {
        delete finalOption.yAxis;
        delete finalOption.grid;
        // Điều chỉnh trình định dạng tooltip cho Pie
        finalOption.tooltip = {
            ...finalOption.tooltip,
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)' // Tooltip chuẩn cho pie: Tên Series, Tên Mục, Giá trị, Phần trăm
        };
    }

    // REMOVED: Toàn bộ khối logic cho biểu đồ phân tán (scatter) đã được xóa.

    // Thêm DataZoom cho các biểu đồ có nhiều danh mục
    const addDataZoom = categories && categories.length > 20;
    if (config.chartType !== 'pie' && addDataZoom) {
        // console.log(`Adding dataZoom for X-axis.`, 'color: purple;');
        finalOption.dataZoom = [
            {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'filter',
                bottom: (options.showLegend && legendData && legendData.length > 0) ? 35 : 15,
                height: 15,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'filter',
            }
        ];

        // Điều chỉnh padding dưới của grid một cách an toàn
        if (finalOption.grid && !Array.isArray(finalOption.grid)) {
            if (options.showLegend && legendData && legendData.length > 0) {
                // Tăng padding nếu cả chú giải và zoom đều hiển thị
                finalOption.grid.bottom = '15%';
            } else {
                // Padding ít hơn nếu chỉ có zoom
                finalOption.grid.bottom = '10%';
            }
        }
    }

    // console.log(`Final ECharts option constructed.`, 'color: purple; font-weight: bold;');
    // console.log(JSON.stringify(finalOption, null, 2)); // Ghi log sâu tùy chọn cuối cùng nếu cần

    return finalOption;
};