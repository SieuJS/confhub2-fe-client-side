// src/app/[locale]/visualization/utils/options.ts
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { processDataForChart } from './processor';

export const generateChartOption = (
    rawData: ConferenceResponse[],
    config: ChartConfig,
    options: ChartOptions,
    availableFields: DataField[]
): EChartsOption => {
    const { categories, series, legendData, visualMap } = processDataForChart(rawData, config, availableFields);

    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);

    // Base option structure
    const finalOption: EChartsOption = {
        title: { text: options.title || 'Chart', left: 'center' },
        tooltip: { trigger: 'item', triggerOn: 'mousemove' },
        legend: {
            show: options.showLegend && legendData && legendData.length > 0,
            type: 'scroll',
            orient: 'horizontal',
            left: 'center',
            bottom: 5,
            data: legendData,
        },
        toolbox: {
            show: options.showToolbox,
            feature: {
                saveAsImage: { title: 'Save Image' },
                restore: { title: 'Restore' },
                dataView: { readOnly: true, title: 'Data View' },
            }
        },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    };

    // --- Chart-specific Overrides ---

    if (config.chartType === 'bar' || config.chartType === 'line') {
        finalOption.tooltip = { trigger: 'axis', axisPointer: { type: 'cross' } };
        finalOption.xAxis = {
            type: 'category',
            name: xAxisField?.name,
            data: categories,
            axisLabel: { rotate: categories && categories.length > 10 ? 30 : 0, interval: 0 },
        };
        finalOption.yAxis = { type: 'value', name: yAxisField?.name };
        finalOption.series = series;
    } else if (config.chartType === 'pie') {
        finalOption.tooltip = { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' };
        finalOption.series = series;
        delete finalOption.xAxis;
        delete finalOption.yAxis;
        delete finalOption.grid;
    } else if (config.chartType === 'map') {
        finalOption.visualMap = visualMap;
        finalOption.series = series;
        finalOption.tooltip = { trigger: 'item', formatter: '{b}<br/>{a}: {c}' }; // Country <br/> Series Name: Value
        delete finalOption.xAxis;
        delete finalOption.yAxis;
        delete finalOption.grid;
        delete finalOption.legend; // Legend is handled by visualMap
    } else if (config.chartType === 'treemap') {
        finalOption.series = series;
        finalOption.tooltip = { trigger: 'item', formatter: '{b}<br/>Value: {c}' };
        delete finalOption.xAxis;
        delete finalOption.yAxis;
        delete finalOption.grid;
    }

    return finalOption;
};