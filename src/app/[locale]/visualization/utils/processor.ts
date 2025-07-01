// src/app/[locale]/visualization/utils/processor.ts
import { groupBy, mapValues, sumBy } from 'lodash';
import { ChartConfig, ProcessedChartData, DataField, ChartType } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { getNestedValue, parseNumericValue } from './helpers'; // Import helpers
import { UNKNOWN_CATEGORY } from './fields'; // Import constants if needed

const logPrefixProcessor = 'PROCESSOR:';

/**
 * Aggregates data within groups based on the measure field's aggregation type.
 * (Internal helper function for processDataForChart)
 */
const aggregateData = (
    groupedData: Record<string, ConferenceResponse[]>,
    measureField: DataField
): Record<string, number> => {
    const measureId = measureField.id;
    const aggregationType = measureField.aggregation;
    // console.log(`${logPrefixProcessor} aggregateData: Aggregating "${measureId}" (${aggregationType}) for groups: [${Object.keys(groupedData).join(', ')}]`);

    if (!aggregationType) {
        // console.warn(`${logPrefixProcessor} aggregateData: Missing aggregation type for "${measureId}". Returning 0.`);
        return mapValues(groupedData, () => 0);
    }

    switch (aggregationType) {
        case 'sum':
            if (!measureField.accessor) {
                // console.warn(`${logPrefixProcessor} aggregateData: SUM needs accessor for "${measureId}". Returning 0.`);
                return mapValues(groupedData, () => 0);
            }
            return mapValues(groupedData, (group, key) => {
                const sum = sumBy(group, item => parseNumericValue(measureField.accessor!(item), `${measureId} for SUM in group ${key}`));
                return sum;
            });

        case 'average':
            const avgTargetProp = (measureField as any).avgTargetProperty;
            // console.log(`${logPrefixProcessor} aggregateData: AVERAGE for "${measureId}" ${avgTargetProp ? `(prop: "${avgTargetProp}")` : ''}.`);
            if (!measureField.accessor) {
                // console.warn(`${logPrefixProcessor} aggregateData: AVERAGE needs accessor for "${measureId}". Returning 0.`);
                return mapValues(groupedData, () => 0);
            }
            return mapValues(groupedData, (group, key) => {
                const allValues: number[] = [];
                group.forEach((item, index) => {
                    const accessedValue = measureField.accessor!(item);
                    if (avgTargetProp && Array.isArray(accessedValue)) {
                        const arrayValues = accessedValue
                            .map((subItem: any, subIndex: number) => parseNumericValue(getNestedValue(subItem, avgTargetProp), `${avgTargetProp} from ${measureId}[${subIndex}]`))
                            .filter(v => !isNaN(v));
                        allValues.push(...arrayValues);
                    } else if (!avgTargetProp) {
                        const numValue = parseNumericValue(accessedValue, `${measureId} for AVERAGE item ${index}`);
                        if (!isNaN(numValue)) allValues.push(numValue);
                    } else {
                        // console.warn(`${logPrefixProcessor} aggregateData: AVERAGE - Mismatch for "${measureId}" in group "${key}". Expected array for avgTargetProp.`);
                    }
                });
                const average = allValues.length > 0 ? sumBy(allValues) / allValues.length : 0;
                return average;
            });

        case 'count':
            return mapValues(groupedData, (group, key) => {
                const count = group.length;
                return count;
            });

        default:
            // console.warn(`${logPrefixProcessor} aggregateData: Unknown aggregation type: "${aggregationType}" for "${measureId}". Returning 0.`);
            return mapValues(groupedData, () => 0);
    }
};


/**
 * Processes raw data based on chart configuration into a structure suitable for ECharts.
 * @param rawData Array of ConferenceResponse items.
 * @param config User's chart configuration.
 * @param availableFields List of all defined DataFields.
 * @returns Processed chart data (categories, series, legend).
 * @throws Error on invalid configuration.
 */
export const processDataForChart = (
    rawData: ConferenceResponse[],
    config: ChartConfig,
    availableFields: DataField[]
): ProcessedChartData => {
    const chartType = config.chartType as ChartType;
    // console.log(`${logPrefixProcessor} processDataForChart: Start. Type: "${chartType}", Data length: ${rawData?.length ?? 0}`);

    if (!rawData || rawData.length === 0) {
        // console.warn(`${logPrefixProcessor} processDataForChart: No raw data. Returning empty.`);
        return { categories: [], series: [], legendData: [] };
    }

    // Tìm các trường đã chọn
    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
    const colorField = availableFields.find(f => f.id === config.color?.fieldId);
    // REMOVED: sizeField không còn cần thiết

    // console.log(`${logPrefixProcessor} processDataForChart: Fields - X:${xAxisField?.id || 'N/A'} Y:${yAxisField?.id || 'N/A'} Color:${colorField?.id || 'N/A'}`);

    // --- Xác thực đầu vào ---
    if (!yAxisField) {
        const errorMsg = `Chart requires a Measure field for Y-Axis/Value (Selected: ${config.yAxis?.fieldId || 'none'}).`;
        throw new Error(errorMsg);
    }
    if (yAxisField.type !== 'measure') {
        const errorMsg = `Field '${yAxisField.name}' (ID: ${yAxisField.id}) selected for Y-Axis/Value is not a Measure (Type: ${yAxisField.type}).`;
        throw new Error(errorMsg);
    }
    // Tất cả các loại biểu đồ còn lại đều yêu cầu một phương thức tổng hợp
    if (!yAxisField.aggregation) {
        const errorMsg = `Measure field '${yAxisField.name}' (ID: ${yAxisField.id}) requires an 'aggregation' type but has none.`;
        throw new Error(errorMsg);
    }

    let categories: string[] = [];
    let series: any[] = [];
    let legendData: string[] = [];

    // console.log(`${logPrefixProcessor} processDataForChart: Processing logic for ${chartType}...`);

    // --- Logic Biểu đồ Cột/Đường ---
    if (chartType === 'bar' || chartType === 'line') {
        if (!xAxisField?.accessor || !yAxisField?.aggregation) throw new Error("Bar/Line chart requires valid X (Dimension w/ accessor) and Y (Measure w/ aggregation) fields.");

        const groupKeyAccessor = (item: ConferenceResponse): string => xAxisField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;

        const groupedByX = groupBy(rawData, groupKeyAccessor);
        categories = Object.keys(groupedByX).sort();

        if (!colorField?.accessor) { // Một chuỗi duy nhất
            const aggregatedValues = aggregateData(groupedByX, yAxisField);
            const data = categories.map(cat => aggregatedValues[cat] ?? 0);
            series.push({ name: yAxisField.name, type: chartType, data, emphasis: { focus: 'series' }, smooth: chartType === 'line' });
            legendData.push(yAxisField.name);
        } else { // Nhiều chuỗi theo màu sắc
            const colorKeyAccessor = (item: ConferenceResponse): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
            const groupedByColor = groupBy(rawData, colorKeyAccessor);
            legendData = Object.keys(groupedByColor).sort();
            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                const groupedSubsetByX = groupBy(colorGroupData, groupKeyAccessor);
                const aggregatedValues = aggregateData(groupedSubsetByX, yAxisField);
                const data = categories.map(cat => aggregatedValues[cat] ?? 0);
                return { name: colorValue, type: chartType, stack: 'total', emphasis: { focus: 'series' }, smooth: chartType === 'line', data };
            });
        }
    }
    // --- Logic Biểu đồ Tròn ---
    else if (chartType === 'pie') {
        if (!colorField?.accessor || !yAxisField?.aggregation) throw new Error("Pie chart requires valid Color (Dimension w/ accessor) and Value (Measure w/ aggregation) fields.");
        const groupKeyAccessor = (item: ConferenceResponse): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        const groupedByColor = groupBy(rawData, groupKeyAccessor);
        legendData = Object.keys(groupedByColor).sort();
        const aggregatedValues = aggregateData(groupedByColor, yAxisField);
        const data = legendData.map(name => ({ name, value: aggregatedValues[name] ?? 0 }));
        series.push({
            name: yAxisField.name,
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 1 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: data,
        });
        categories = [];
    }
    // --- Logic Biểu đồ Phân tán đã được loại bỏ ---

    // console.log(`${logPrefixProcessor} processDataForChart: Finished. Series: ${series.length}, Categories: ${categories.length}, Legend: ${legendData.length}`);
    return { categories, series, legendData };
};