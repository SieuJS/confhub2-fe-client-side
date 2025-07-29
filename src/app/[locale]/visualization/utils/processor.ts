// src/app/[locale]/visualization/utils/processor.ts
import { groupBy, mapValues, sumBy, meanBy } from 'lodash';
import { ChartConfig, ProcessedChartData, DataField, ChartType } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { getNestedValue, parseNumericValue } from './helpers';
import { UNKNOWN_CATEGORY } from './fields';

// --- IMPORTANT HELPER: Data Flattening ---
/**
 * "Làm phẳng" dữ liệu hội nghị dựa trên mảng `ranks`.
 * Một hội nghị có N ranks sẽ tạo ra N object mới.
 * @param rawData Mảng dữ liệu hội nghị gốc.
 * @returns Mảng dữ liệu đã được làm phẳng.
 */
export const flattenDataByRank = (rawData: ConferenceResponse[]): any[] => {
    const flattenedData: any[] = [];
    rawData.forEach(conf => {
        const ranks = getNestedValue(conf, 'ranks');
        if (Array.isArray(ranks) && ranks.length > 0) {
            ranks.forEach(rank => {
                flattenedData.push({
                    ...conf, // Giữ lại toàn bộ thông tin hội nghị gốc
                    ...rank, // Thêm các thuộc tính của rank vào cấp cao nhất
                });
            });
        } else {
            // Nếu hội nghị không có rank, vẫn giữ lại nó trong bộ dữ liệu
            flattenedData.push({ ...conf, rank: UNKNOWN_CATEGORY, source: UNKNOWN_CATEGORY, researchField: UNKNOWN_CATEGORY });
        }
    });
    return flattenedData;
};


const aggregateData = (
    groupedData: Record<string, any[]>,
    measureField: DataField
): Record<string, number> => {
    const aggregationType = measureField.aggregation;
    if (!aggregationType) return mapValues(groupedData, () => 0);

    switch (aggregationType) {
        case 'count':
            return mapValues(groupedData, group => group.length);
        case 'sum':
            if (!measureField.accessor) return mapValues(groupedData, () => 0);
            return mapValues(groupedData, group =>
                sumBy(group, item => parseNumericValue(measureField.accessor!(item)))
            );
        case 'average':
            if (!measureField.accessor) return mapValues(groupedData, () => 0);
            return mapValues(groupedData, group => {
                // Lọc ra các giá trị không phải null/undefined trước khi tính trung bình
                const validItems = group.map(item => measureField.accessor!(item)).filter(val => val !== null && val !== undefined);
                return meanBy(validItems, val => parseNumericValue(val));
            });
        default:
            return mapValues(groupedData, () => 0);
    }
};

export const processDataForChart = (
    rawData: ConferenceResponse[],
    config: ChartConfig,
    availableFields: DataField[]
): ProcessedChartData => {
    const { chartType } = config;

    if (!rawData || rawData.length === 0) {
        return { series: [] };
    }

    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const colorField = availableFields.find(f => f.id === config.color?.fieldId);

    // --- IMPORTANT: Decide which dataset to use ---
    const rankFieldIds = ['rank.value', 'rank.source', 'rank.researchField'];
    const usesRankFields = [config.xAxis.fieldId, config.yAxis.fieldId, config.color.fieldId].some(id => id && rankFieldIds.includes(id));
    
    const processedData = usesRankFields ? flattenDataByRank(rawData) : rawData;

    // --- Validation ---
    const requiresMeasure = ['bar', 'line', 'pie', 'map', 'treemap', 'scatter'];
    if (requiresMeasure.includes(chartType) && (!yAxisField || yAxisField.type !== 'measure')) {
        throw new Error(`Chart type '${chartType}' requires a Measure on the Y-Axis/Value.`);
    }

    let categories: string[] = [];
    let series: any[] = [];
    let legendData: string[] = [];
    let visualMap: any = undefined;

    // --- Chart Logic ---
    if (chartType === 'bar' || chartType === 'line') {
        if (!xAxisField?.accessor || !yAxisField?.aggregation) throw new Error("Bar/Line chart requires a Dimension on X-Axis and a Measure on Y-Axis.");
        
        const groupKeyAccessor = (item: any): string => xAxisField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        const groupedByX = groupBy(processedData, groupKeyAccessor);
        categories = Object.keys(groupedByX).sort();

        if (!colorField?.accessor) { // Single series
            const aggregatedValues = aggregateData(groupedByX, yAxisField);
            const data = categories.map(cat => aggregatedValues[cat] ?? 0);
            series.push({ name: yAxisField.name, type: chartType, data, emphasis: { focus: 'series' } });
            legendData.push(yAxisField.name);
        } else { // Multi-series by color
            const colorKeyAccessor = (item: any): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
            const groupedByColor = groupBy(processedData, colorKeyAccessor);
            legendData = Object.keys(groupedByColor).sort();
            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                const groupedSubsetByX = groupBy(colorGroupData, groupKeyAccessor);
                const aggregatedValues = aggregateData(groupedSubsetByX, yAxisField);
                const data = categories.map(cat => aggregatedValues[cat] ?? 0);
                return { name: colorValue, type: chartType, stack: 'total', emphasis: { focus: 'series' }, data };
            });
        }
    } else if (chartType === 'pie') {
        // For Pie, Color field acts as the category
        if (!colorField?.accessor || !yAxisField?.aggregation) throw new Error("Pie chart requires a Dimension on Color and a Measure on Value (Y-Axis).");
        
        const groupKeyAccessor = (item: any): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        const groupedByColor = groupBy(processedData, groupKeyAccessor);
        legendData = Object.keys(groupedByColor).sort();
        const aggregatedValues = aggregateData(groupedByColor, yAxisField);
        
        series.push({
            name: yAxisField.name,
            type: 'pie',
            radius: ['40%', '70%'],
            data: legendData.map(name => ({ name, value: aggregatedValues[name] ?? 0 })),
        });
    } else if (chartType === 'map') {
        // For Map, X-Axis is Location, Y-Axis is Value
        if (!xAxisField?.accessor || !yAxisField?.aggregation) throw new Error("Map chart requires a Location Dimension (e.g., Country) on X-Axis and a Measure on Y-Axis.");

        const groupKeyAccessor = (item: any): string => xAxisField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        const groupedByLocation = groupBy(processedData, groupKeyAccessor);
        const aggregatedValues = aggregateData(groupedByLocation, yAxisField);

        const data = Object.keys(aggregatedValues)
            .map(name => ({ name, value: aggregatedValues[name] ?? 0 }))
            .filter(item => item.name !== UNKNOWN_CATEGORY); // Don't plot 'Unknown' on map

        series.push({
            name: yAxisField.name,
            type: 'map',
            map: 'world',
            roam: true,
            data,
        });

        const values = data.map(d => d.value);
        visualMap = {
            left: 'left',
            min: Math.min(...values),
            max: Math.max(...values),
            inRange: { color: ['#e0ffff', '#006edd'] }, // Light blue to dark blue
            calculable: true,
            text: ['High', 'Low'],
        };
    } else if (chartType === 'treemap') {
        // For Treemap, X-Axis is hierarchy, Y-Axis is size
        if (!xAxisField?.accessor || !yAxisField?.aggregation) throw new Error("Treemap requires a Dimension on X-Axis and a Measure on Y-Axis.");

        const groupKeyAccessor = (item: any): string => xAxisField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        const groupedByX = groupBy(processedData, groupKeyAccessor);
        const aggregatedValues = aggregateData(groupedByX, yAxisField);

        const data = Object.keys(aggregatedValues)
            .map(name => ({ name, value: aggregatedValues[name] ?? 0 }))
            .filter(item => item.name !== UNKNOWN_CATEGORY);

        series.push({
            name: xAxisField.name,
            type: 'treemap',
            data,
        });
    }

    return { categories, series, legendData, visualMap };
};