// src/app/[locale]/visualization/utils/visualizationUtils.ts
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField, FieldType, ProcessedChartData } from '../../../../models/visualization/visualization';
import { groupBy, mapValues, meanBy, sumBy, countBy } from 'lodash'; // Install lodash: npm install lodash @types/lodash

// --- Field Definition ---

const logPrefixUtil = "[visualizationUtils]";

const getNestedValue = (obj: any, path: string): any => {
    // console.log(`${logPrefixUtil} getNestedValue called for path: ${path}`);
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}; export const getAvailableFields = (sampleItem: any): DataField[] => {
    console.log(`%c${logPrefixUtil} getAvailableFields called with sampleItem:`, sampleItem);
    if (!sampleItem) return [];

    const fields: DataField[] = [
        // ... (field definitions) ...
        { id: 'location.continent', name: 'Continent', type: 'dimension', accessor: (d) => getNestedValue(d, 'location.continent') },
        { id: 'location.country', name: 'Country', type: 'dimension', accessor: (d) => getNestedValue(d, 'location.country') },
        { id: 'organization.year', name: 'Year', type: 'dimension', accessor: (d) => getNestedValue(d, 'organization.year')?.toString() },
        { id: 'organization.accessType', name: 'Access Type', type: 'dimension', accessor: (d) => getNestedValue(d, 'organization.accessType') },
        { id: 'count_conferences', name: 'Number of Conferences', type: 'measure', aggregation: 'count' },
        { id: 'avg_feedback_star', name: 'Average Feedback Stars', type: 'measure', accessor: (d) => meanBy(getNestedValue(d, 'feedBacks'), 'star'), aggregation: 'average' }, // Note: meanBy might not work as expected here pre-grouping
        { id: 'count_followers', name: 'Number of Followers', type: 'measure', accessor: (d) => getNestedValue(d, 'followedBy')?.length ?? 0, aggregation: 'sum' },
        { id: 'count_feedbacks', name: 'Number of Feedbacks', type: 'measure', accessor: (d) => getNestedValue(d, 'feedBacks')?.length ?? 0, aggregation: 'sum' },
        { id: 'count_topics', name: 'Number of Topics', type: 'measure', accessor: (d) => getNestedValue(d, 'organization.topics')?.length ?? 0, aggregation: 'sum' },
    ];

    console.log(`%c${logPrefixUtil} Returning ${fields.length} available fields.`, );
    return fields;
};


// --- Data Processing ---

const aggregateData = (
    groupedData: Record<string, any[]>,
    measureField: DataField,
    availableFields: DataField[]
): Record<string, number> => {
    console.log(`%c${logPrefixUtil} aggregateData called for measure: ${measureField.id} (${measureField.aggregation})`, );
    // ... (rest of aggregateData function with its existing logs or add more if needed) ...
    if (!measureField.aggregation || !measureField.accessor) {
        console.warn(`%c${logPrefixUtil} Measure field ${measureField.id} needs aggregation and accessor`,  + 'color: orange;');
        return mapValues(groupedData, () => 0); // Return 0 for all groups
    }

    switch (measureField.aggregation) {
        case 'sum':
            console.log(`%c${logPrefixUtil} Aggregating with SUM`, );
            return mapValues(groupedData, group => sumBy(group, item => {
                const value = measureField.accessor!(item);
                // Add more detailed logging inside sumBy if needed
                if (typeof value === 'number') return value;
                if (typeof value === 'string') {
                    const num = parseFloat(value); return isNaN(num) ? 0 : num;
                }
                return 0;
            }));
        case 'average':
            console.log(`%c${logPrefixUtil} Aggregating with AVERAGE`, );
            return mapValues(groupedData, group => {
                const values = group.map(item => measureField.accessor!(item))
                    .filter(v => v !== null && v !== undefined && typeof v === 'number' && !isNaN(v)) as number[]; // Ensure numbers
                return values.length > 0 ? sumBy(values) / values.length : 0;
            });
        case 'count':
            console.log(`%c${logPrefixUtil} Aggregating with COUNT`, );
            return mapValues(groupedData, group => group.length);
        default:
            console.warn(`%c${logPrefixUtil} Unknown aggregation type: ${measureField.aggregation}`,  + 'color: orange;');
            return mapValues(groupedData, () => 0);
    }
};


const processDataForChart = (
    rawData: any[],
    config: ChartConfig,
    availableFields: DataField[]
): ProcessedChartData => {
    console.log(`%c${logPrefixUtil} processDataForChart called for type: ${config.chartType}`, );
    // ... (rest of processDataForChart function with checks and logic) ...
    const xAxisField = availableFields.find(f => f.id === config.xAxis.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis.fieldId);
    const colorField = availableFields.find(f => f.id === config.color.fieldId);
    const sizeField = availableFields.find(f => f.id === config.size?.fieldId); // Find size field

    console.log(`%c${logPrefixUtil} Fields - X: ${xAxisField?.id}, Y: ${yAxisField?.id}, Color: ${colorField?.id}, Size: ${sizeField?.id}`, );

    // --- Input Validation ---
    if (config.chartType !== 'pie' && (!xAxisField || xAxisField.type !== 'dimension')) {
        throw new Error(`Invalid or missing Dimension field for X-Axis (${config.xAxis.fieldId}).`);
    }
    if (!yAxisField || yAxisField.type !== 'measure') {
        throw new Error(`Invalid or missing Measure field for Y-Axis/Value (${config.yAxis.fieldId}).`);
    }
    if (config.chartType === 'pie' && (!colorField || colorField.type !== 'dimension')) {
        throw new Error(`Pie chart requires a Dimension field for Color/Slices (${config.color.fieldId}).`);
    }
    if (config.chartType === 'pie' && !yAxisField) {
        throw new Error(`Pie chart requires a Measure field for Value/Size (${config.yAxis.fieldId})`);
    }

    let categories: string[] = [];
    let series: any[] = [];
    let legendData: string[] = [];

    console.log(`%c${logPrefixUtil} Processing for ${config.chartType}`, );

    // --- Bar/Line Chart Logic ---
    if (config.chartType === 'bar' || config.chartType === 'line') {
        if (!xAxisField || !yAxisField || !xAxisField.accessor) {
            throw new Error('Bar/Line charts require valid X (Dimension) and Y (Measure) fields.');
        }

        const groupKeyAccessor = (item: any) => xAxisField.accessor!(item)?.toString() ?? 'Unknown';
        console.log(`%c${logPrefixUtil} Grouping by X-Axis: ${xAxisField.id}`, );
        const groupedByX = groupBy(rawData, groupKeyAccessor);
        categories = Object.keys(groupedByX).sort();
        console.log(`%c${logPrefixUtil} Categories found: ${categories.length}`, );

        if (!colorField || !colorField.accessor) {
            console.log(`%c${logPrefixUtil} Simple ${config.chartType}: Aggregating Y-Axis: ${yAxisField.id}`, );
            const aggregatedValues = aggregateData(groupedByX, yAxisField, availableFields);
            const data = categories.map(cat => aggregatedValues[cat] ?? 0);
            series.push({
                name: yAxisField.name,
                type: config.chartType,
                data: data,
                emphasis: { focus: 'series' }, // Nice ECharts effect
                // smooth: config.chartType === 'line', // Optional for line chart
            });
            legendData.push(yAxisField.name);

        } else {
            console.log(`%c${logPrefixUtil} Grouped ${config.chartType}: Grouping by Color: ${colorField.id}`, );
            const colorKeyAccessor = (item: any) => colorField.accessor!(item)?.toString() ?? 'Unknown';
            const groupedByColor = groupBy(rawData, colorKeyAccessor);
            legendData = Object.keys(groupedByColor).sort();
            console.log(`%c${logPrefixUtil} Color groups found: ${legendData.length}`, );

            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                // Group this subset by X-axis
                const groupedSubsetByX = groupBy(colorGroupData, item => xAxisField.accessor!(item)?.toString() ?? 'Unknown');
                // Aggregate the Y-axis measure for this specific color group
                const aggregatedValues = aggregateData(groupedSubsetByX, yAxisField, availableFields);

                // Map aggregated values to the main categories order
                const data = categories.map(cat => aggregatedValues[cat] ?? 0);

                return {
                    name: colorValue, // Legend name is the color category value
                    type: config.chartType,
                    // stack: 'total', // Enable stacking if desired
                    emphasis: { focus: 'series' },
                    data: data,
                };
            });
        }
    }
    // --- Pie Chart Logic ---
    else if (config.chartType === 'pie') {
        if (!colorField || !yAxisField || !colorField.accessor) {
            throw new Error('Pie chart requires a Dimension for Color and a Measure for Value.');
        }
        const groupKeyAccessor = (item: any) => colorField.accessor!(item)?.toString() ?? 'Unknown';
        console.log(`%c${logPrefixUtil} Grouping Pie by Color: ${colorField.id}`, );
        const groupedByColor = groupBy(rawData, groupKeyAccessor);
        legendData = Object.keys(groupedByColor).sort();
        console.log(`%c${logPrefixUtil} Pie slices found: ${legendData.length}`, );
        console.log(`%c${logPrefixUtil} Aggregating Pie values by Y-Axis: ${yAxisField.id}`, );
        const aggregatedValues = aggregateData(groupedByColor, yAxisField, availableFields);

        const data = legendData.map(name => ({
            name: name,
            value: aggregatedValues[name] ?? 0,
        }));

        series.push({
            name: yAxisField.name, // Overall name for the pie
            type: 'pie',
            radius: ['40%', '70%'], // Make it a donut chart
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false, // Show labels on hover/tooltip instead
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '20',
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: data,
        });
        // Categories are not typically used directly in Pie series data
    }
    // --- Scatter Plot Logic ---
    else if (config.chartType === 'scatter') {
        if (!xAxisField || !yAxisField || !xAxisField.accessor || !yAxisField.accessor) {
            throw new Error('Scatter plot requires X (Dimension or Measure) and Y (Measure) fields.');
            // Note: Scatter X-axis *can* be a measure too. Add logic if needed.
        }
        const sizeField = availableFields.find(f => f.id === config.size?.fieldId);

        // Scatter often doesn't need aggregation if each point is an item
        // If X is a dimension, you might need aggregation similar to bar/line
        // For simplicity, assume X and Y accessors return direct values per item

        if (!colorField || !colorField.accessor) {
            // Simple Scatter
            const data = rawData.map(item => {
                const xVal = xAxisField.accessor!(item);
                const yVal = yAxisField.accessor!(item);
                const sizeVal = sizeField?.accessor ? sizeField.accessor(item) : 10; // Default size
                // Return [x, y, size] or [x, y]
                return sizeField ? [xVal, yVal, sizeVal] : [xVal, yVal];
            }).filter(point => point[0] != null && point[1] != null); // Filter out invalid points

            series.push({
                name: yAxisField.name,
                type: 'scatter',
                symbolSize: sizeField ? undefined : 10, // Use data size if sizeField, else fixed size
                data: data,
                emphasis: { focus: 'series' },
            });
            legendData.push(yAxisField.name);

        } else {
            // Grouped Scatter (by color)
            const groupedByColor = groupBy(rawData, item => colorField.accessor!(item)?.toString() ?? 'Unknown');
            legendData = Object.keys(groupedByColor).sort();

            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                const data = colorGroupData.map(item => {
                    const xVal = xAxisField.accessor!(item);
                    const yVal = yAxisField.accessor!(item);
                    const sizeVal = sizeField?.accessor ? sizeField.accessor(item) : 10;
                    return sizeField ? [xVal, yVal, sizeVal] : [xVal, yVal];
                }).filter(point => point[0] != null && point[1] != null);

                return {
                    name: colorValue,
                    type: 'scatter',
                    symbolSize: sizeField ? undefined : 10,
                    data: data,
                    emphasis: { focus: 'series' },
                };
            });
        }
        // Scatter X-axis is often 'value' type
        categories = []; // No categories for value axis
    }
    else {
        console.error(`%c${logPrefixUtil} Unsupported chart type: ${config.chartType}`,  + 'color: red;');
        throw new Error(`Unsupported chart type: ${config.chartType}`);
    }

    console.log(`%c${logPrefixUtil} processDataForChart finished. Series count: ${series.length}, Categories count: ${categories.length}, Legend count: ${legendData.length}`, );

    return { categories, series, legendData };
};

// --- ECharts Option Generation ---
export const generateChartOption = (
    rawData: any[],
    config: ChartConfig,
    options: ChartOptions,
    availableFields: DataField[]
): EChartsOption => {

    console.log(`%c${logPrefixUtil} generateChartOption called. Type: ${config.chartType}, Title: ${options.title}`, );
    const { categories, series, legendData } = processDataForChart(rawData, config, availableFields);

    const xAxisField = availableFields.find(f => f.id === config.xAxis.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis.fieldId);

    const finalOption: EChartsOption = {
        title: {
            text: options.title || 'Chart',
            left: 'center',
            // Add subtext if needed
        },
        tooltip: {
            trigger: config.chartType === 'pie' ? 'item' : 'axis', // 'item' for pie, 'axis' for others
            // formatter: // Add custom formatter if needed
            axisPointer: { // Optional: enhance axis tooltip
                type: 'cross', // Or 'shadow', 'line'
            },
        },
        legend: {
            show: options.showLegend && legendData && legendData.length > 1, // Show legend only if multiple series/pie slices
            orient: 'horizontal', // Or 'vertical'
            left: 'center',
            bottom: 'bottom',
            data: legendData,
            // type: 'scroll', // If many legend items
        },
        toolbox: {
            show: options.showToolbox,
            feature: {
                // dataZoom: { yAxisIndex: 'none' }, // Optional: Zoom/pan
                // dataView: { readOnly: false }, // Optional: View data table
                magicType: { type: ['line', 'bar', 'stack'] }, // Optional: Switch chart type (if applicable)
                restore: {},
                saveAsImage: { // ECharts built-in save
                    name: options.title || 'chart',
                    type: 'png', // Default save format
                    pixelRatio: 2, // Higher resolution
                }
            },
            right: 20, // Position toolbox
        },
        grid: { // Adjust grid padding
            left: '3%',
            right: '4%',
            bottom: legendData && legendData.length > 1 ? '10%' : '3%', // More bottom padding if legend is shown
            containLabel: true // Prevent labels from being cut off
        },
        xAxis: config.chartType === 'pie' ? undefined : (categories && categories.length > 0 ? { // Conditional type
            type: 'category',
            data: categories,
            name: xAxisField?.name,
            nameLocation: 'middle',
            nameGap: 25,
            axisTick: { alignWithLabel: true },
            axisLabel: {
                // rotate: 45,
                // interval: 0,
            }
        } : {
            type: 'value',
            name: xAxisField?.name,
            nameLocation: 'middle',
            nameGap: 25,
            axisTick: { alignWithLabel: true } as any,
            axisLabel: {
                // formatter: '{value} units'
            }
        }),
        yAxis: config.chartType === 'pie' ? undefined : { // No Axis for Pie
            type: 'value',
            name: yAxisField?.name, // Axis Label
            nameLocation: 'middle',
            nameGap: 40, // Adjust gap based on label length
            axisLabel: {
                // formatter: '{value} units' // Custom formatting
            },
        },
        // Add visualMap for color/size encoding based on data values if needed
        // visualMap: [],
        series: series,
        // Optional: Add dataZoom for scrolling/zooming large datasets
        // dataZoom: [ { type: 'slider' }, { type: 'inside' } ],
        // backgroundColor: '#fff', // Set background color if needed
    };



    // --- Specific adjustments ---
    if (config.chartType === 'pie') {
        // Remove axis properties specifically for pie
        delete finalOption.xAxis;
        delete finalOption.yAxis;
        delete finalOption.grid;
    }

    if (config.chartType === 'scatter' && finalOption.xAxis) {
        // Scatter X-axis might be value type
        (finalOption.xAxis as any).type = 'value';
        (finalOption.xAxis as any).data = undefined; // Remove category data for value axis
        (finalOption.xAxis as any).boundaryGap = false;
    }

    console.log(`%c${logPrefixUtil} Final ECharts option constructed.`, );


    return finalOption;
};