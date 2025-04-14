// src/app/[locale]/visualization/utils/visualizationUtils.ts
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField, FieldType, ProcessedChartData, ChartType } from '../../../../models/visualization/visualization'; // Adjust path as needed
import { groupBy, mapValues, sumBy, countBy, meanBy } from 'lodash'; // Ensure lodash is installed
import { ConferenceResponse } from '@/src/models/response/conference.response';

// --- Constants ---
const UNKNOWN_CATEGORY = 'Unknown'; // Consistent handling for null/undefined keys

// --- Utility Functions ---

/**
 * Safely retrieves a nested value from an object using a dot-separated path.
 * @param obj The object to traverse.
 * @param path The dot-separated path string (e.g., 'location.country').
 * @returns The value found at the path, or undefined if the path is invalid.
 */
const getNestedValue = (obj: any, path: string): any => {
    // Basic check for non-object input
    if (typeof obj !== 'object' || obj === null) {
        return undefined;
    }
    // console.log(`${logPrefixUtil} getNestedValue called for path: ${path}`);
    try {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    } catch (error) {
        // Handle potential errors during reduce if path is malformed, though unlikely with string split
        console.error(`Error accessing path "${path}":`, 'color: red;', error);
        return undefined;
    }
};

/**
 * Parses a value to a number, returning 0 for invalid or non-numeric types.
 * @param value The value to parse.
 * @returns The parsed number, or 0 if parsing fails.
 */
const parseNumericValue = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }
    // Could add boolean handling (true=1, false=0) if needed
    return 0;
};

// --- STABLE ACCESSOR DEFINITIONS ---
// Define accessors outside getAvailableFields so they have stable references
const accessors = {
    continent: (d: any) => getNestedValue(d, 'organizations.locations[0].continent') ?? UNKNOWN_CATEGORY,
    country: (d: any) => getNestedValue(d, 'organizations.locations[0].country') ?? UNKNOWN_CATEGORY,
    year: (d: any) => getNestedValue(d, 'organizations.year')?.toString() ?? UNKNOWN_CATEGORY,
    accessType: (d: any) => getNestedValue(d, 'organizations.accessType') ?? UNKNOWN_CATEGORY,
    followersCount: (d: any) => getNestedValue(d, 'followedBy')?.length ?? 0,
    feedbacksCount: (d: any) => getNestedValue(d, 'feedBacks')?.length ?? 0,
    topicsCount: (d: any) => getNestedValue(d, 'organizations.topics')?.length ?? 0,
    feedbacksArray: (d: any) => getNestedValue(d, 'feedBacks'), // Returns array for aggregation
};


// --- STABLE FIELD DEFINITIONS (Template) ---
// Define this structure ONCE, outside the function.
const AVAILABLE_FIELDS_TEMPLATE: DataField[] = [
    // Dimensions
    { id: 'organizations.location[0].continent', name: 'Continent', type: 'dimension', accessor: accessors.continent },
    { id: 'organizations.location[0].country', name: 'Country', type: 'dimension', accessor: accessors.country },
    { id: 'organizations.year', name: 'Year', type: 'dimension', accessor: accessors.year },
    { id: 'organizations.accessType', name: 'Access Type', type: 'dimension', accessor: accessors.accessType },

    // Measures
    { id: 'count_records', name: 'Record Count', type: 'measure', aggregation: 'count' }, // No accessor needed for simple count
    { id: 'count_followers', name: '# Followers', type: 'measure', accessor: accessors.followersCount, aggregation: 'sum' },
    { id: 'count_feedbacks', name: '# Feedbacks', type: 'measure', accessor: accessors.feedbacksCount, aggregation: 'sum' },
    { id: 'count_topics', name: '# Topics', type: 'measure', accessor: accessors.topicsCount, aggregation: 'sum' },
    {
        id: 'feedback_star',
        name: 'Feedback Star Value',
        type: 'measure',
        accessor: accessors.feedbacksArray,
        aggregation: 'average'
    },
];

// --- Field Definition ---

/**
 * Returns the STABLE list of available fields if data exists.
 * @param sampleItem A sample raw data item (only used for existence check).
 * @returns A STABLE array of DataField objects, or an empty array.
 */
export const getAvailableFields = (sampleItem: any): DataField[] => {
    console.log(`getAvailableFields called. Sample exists: ${!!sampleItem}`, 'color: blue;');
    if (!sampleItem || typeof sampleItem !== 'object') {
        console.warn(`Invalid or missing sampleItem. Returning empty fields.`, 'color: orange;');
        return []; // Return empty array if no data/sample
    }

    // Return the pre-defined STABLE template array
    console.log(`Returning STABLE template with ${AVAILABLE_FIELDS_TEMPLATE.length} fields.`, 'color: blue;');
    return AVAILABLE_FIELDS_TEMPLATE;
};



// --- Data Processing ---

/**
 * Aggregates data within groups based on the measure field's aggregation type.
 * @param groupedData Data grouped by one or more dimensions (Record<string, any[]>).
 * @param measureField The DataField object representing the measure to aggregate.
 * @returns A record mapping group keys to aggregated numeric values.
 */
const aggregateData = (
    groupedData: Record<string, any[]>,
    measureField: DataField
): Record<string, number> => {
    console.log(`aggregateData called for measure: ${measureField.id} (Aggregation: ${measureField.aggregation || 'none'})`, 'color: green;');

    if (!measureField.aggregation) {
        console.warn(`Measure field ${measureField.id} is missing aggregation type. Returning 0 for all groups.`, 'color: orange;');
        return mapValues(groupedData, () => 0);
    }

    switch (measureField.aggregation) {
        case 'sum':
            console.log(`  Aggregating with SUM`, 'color: green;');
            if (!measureField.accessor) {
                console.warn(`  SUM aggregation for ${measureField.id} requires an accessor. Returning 0.`, 'color: orange;');
                return mapValues(groupedData, () => 0);
            }
            return mapValues(groupedData, group =>
                sumBy(group, item => parseNumericValue(measureField.accessor!(item)))
            );

        case 'average':
            console.log(`  Aggregating with AVERAGE`, 'color: green;');
            if (!measureField.accessor) {
                console.warn(`  AVERAGE aggregation for ${measureField.id} requires an accessor. Returning 0.`, 'color: orange;');
                return mapValues(groupedData, () => 0);
            }
            // Handle average differently: assumes accessor returns an array (e.g., feedback objects)
            // and we calculate the mean of a property ('star') within that array *across the group*.
            if (measureField.id === 'feedback_star') { // Specific handling for feedback average
                return mapValues(groupedData, group => {
                    const allStars = group.flatMap(item => {
                        const feedbacks = measureField.accessor!(item); // Get array of feedbacks per item
                        if (!Array.isArray(feedbacks)) return [];
                        return feedbacks.map(fb => parseNumericValue(getNestedValue(fb, 'star'))); // Extract 'star' and parse
                    }).filter(star => star > 0); // Filter out 0 or invalid stars if needed
                    return allStars.length > 0 ? sumBy(allStars) / allStars.length : 0;
                });
            } else {
                // Generic average: assumes accessor returns a single numeric value per item
                return mapValues(groupedData, group => {
                    const values = group.map(item => parseNumericValue(measureField.accessor!(item)));
                    const validValues = values.filter(v => !isNaN(v)); // Keep only valid numbers
                    return validValues.length > 0 ? sumBy(validValues) / validValues.length : 0;
                });
            }


        case 'count':
            console.log(`  Aggregating with COUNT`, 'color: green;');
            // Count the number of items in each group
            return mapValues(groupedData, group => group.length);

        default:
            console.warn(`  Unknown aggregation type: ${measureField.aggregation}. Returning 0.`, 'color: orange;');
            return mapValues(groupedData, () => 0);
    }
};


/**
 * Processes raw data based on the chart configuration to prepare it for ECharts.
 * Handles grouping, aggregation, and structuring data into categories and series.
 * @param rawData The raw array of data items.
 * @param config The ChartConfig object defining the visualization setup.
 * @param availableFields The list of all defined DataFields.
 * @returns A ProcessedChartData object containing categories, series, and legend data.
 * @throws Error if the configuration is invalid for the selected chart type.
 */
const processDataForChart = (
    rawData: any[],
    config: ChartConfig,
    availableFields: DataField[]
): ProcessedChartData => {
    console.log(`processDataForChart started for type: ${config.chartType}`, 'color: blue;');
    if (!rawData || rawData.length === 0) {
        console.warn(`Raw data is empty or invalid.`, 'color: orange;');
        return { categories: [], series: [], legendData: [] };
    }

    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
    const colorField = availableFields.find(f => f.id === config.color?.fieldId);
    const sizeField = availableFields.find(f => f.id === config.size?.fieldId);

    console.log(`Fields - X: ${xAxisField?.id || 'N/A'}, Y: ${yAxisField?.id || 'N/A'}, Color: ${colorField?.id || 'N/A'}, Size: ${sizeField?.id || 'N/A'}`, 'color: gray;');

    // --- Input Validation ---
    // !!! IMPORTANT FIX: Check fields existence *before* assuming type/accessor exists !!!
    // Modify the validation blocks like this:
    if (!yAxisField) { // Check if yAxisField exists first
        throw new Error(`Chart requires a Measure field for Y-Axis/Value (Selected: ${config.yAxis?.fieldId || 'none'}).`);
    }
    if (yAxisField.type !== 'measure') { // Then check type
        throw new Error(`Field '${yAxisField.name}' selected for Y-Axis/Value is not a Measure.`);
    }

    switch (config.chartType as ChartType) {
        case 'bar':
        case 'line':
            if (!xAxisField) {
                throw new Error(`Bar/Line chart requires a Dimension field for X-Axis (Selected: ${config.xAxis?.fieldId || 'none'}).`);
            }
            if (xAxisField.type !== 'dimension') {
                throw new Error(`Field '${xAxisField.name}' selected for X-Axis is not a Dimension.`);
            }
            break;
        case 'pie':
            if (!colorField) {
                throw new Error(`Pie chart requires a Dimension field for Color/Slices (Selected: ${config.color?.fieldId || 'none'}).`);
            }
            if (colorField.type !== 'dimension') {
                throw new Error(`Field '${colorField.name}' selected for Color/Slices is not a Dimension.`);
            }
            break;
        case 'scatter':
            if (!xAxisField) {
                throw new Error(`Scatter chart requires a field for X-Axis (Selected: ${config.xAxis?.fieldId || 'none'}).`);
            }
            // No type check needed for X-axis here, can be dimension or measure
            if (sizeField && !sizeField) { // Check sizeField exists if config.size.fieldId is set
                throw new Error(`Selected Size field (ID: ${config.size?.fieldId}) not found.`);
            }
            if (sizeField && sizeField.type !== 'measure') {
                throw new Error(`Field '${sizeField.name}' selected for Size must be a Measure.`);
            }
            break;
        default:
            throw new Error(`Unsupported chart type: ${config.chartType}`);
    }


    let categories: string[] = [];
    let series: any[] = [];
    let legendData: string[] = [];
    const chartType = config.chartType as ChartType;

    console.log(`Processing logic for ${chartType}`, 'color: blue;');

    // --- Bar/Line Chart Logic ---
    if (chartType === 'bar' || chartType === 'line') {
        // !!! Add checks here too before using accessors !!!
        if (!xAxisField?.accessor) { // Check accessor exists
            throw new Error(`Internal Error: X-Axis field '${xAxisField?.name}' is missing its accessor function.`);
        }
        // yAxisField is guaranteed to exist from validation above
        // No need to check yAxisField.accessor here as aggregation handles it

        const groupKeyAccessor = (item: any): string => xAxisField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        console.log(`Grouping by X-Axis: ${xAxisField.id}`, 'color: green;');
        const groupedByX = groupBy(rawData, groupKeyAccessor);
        categories = Object.keys(groupedByX).sort(); // Use sorted keys as categories
        console.log(`Categories found (${categories.length}): ${categories.slice(0, 10).join(', ')}...`, 'color: gray;');

        if (!colorField?.accessor) {
            // Single series (no color grouping)
            console.log(`Single series ${chartType}: Aggregating Y-Axis (${yAxisField.id})`, 'color: green;');
            const aggregatedValues = aggregateData(groupedByX, yAxisField);
            const data = categories.map(cat => aggregatedValues[cat] ?? 0);

            series.push({
                name: yAxisField.name,
                type: chartType,
                data: data,
                emphasis: { focus: 'series' },
                smooth: chartType === 'line' ? true : undefined, // Optional smoothing for line
                // stack: 'total', // Optional stacking
            });
            legendData.push(yAxisField.name);

        } else {
            // Multiple series (grouped by color)
            console.log(`Grouped ${chartType}: Grouping by Color (${colorField.id})`, 'color: green;');
            const colorKeyAccessor = (item: any): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
            const groupedByColor = groupBy(rawData, colorKeyAccessor);
            legendData = Object.keys(groupedByColor).sort();
            console.log(`Color groups found (${legendData.length}): ${legendData.slice(0, 10).join(', ')}...`, 'color: gray;');

            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                // Group this subset by X-axis
                const groupedSubsetByX = groupBy(colorGroupData, groupKeyAccessor);
                // Aggregate the Y-axis measure for this specific color group
                const aggregatedValues = aggregateData(groupedSubsetByX, yAxisField);
                // Map aggregated values to the main categories order
                const data = categories.map(cat => aggregatedValues[cat] ?? 0);

                return {
                    name: colorValue, // Legend name is the color category value
                    type: chartType,
                    stack: 'total', // Stack grouped bars/lines by default, can be option later
                    emphasis: { focus: 'series' },
                    smooth: chartType === 'line' ? true : undefined,
                    data: data,
                };
            });
        }
    }
    // --- Pie Chart Logic ---
    else if (chartType === 'pie') {
        if (!colorField?.accessor) {
            throw new Error(`Internal Error: Color field '${colorField?.name}' is missing its accessor function.`);
        }
        // yAxisField guaranteed from validation
        const groupKeyAccessor = (item: any): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        console.log(`Grouping Pie by Color: ${colorField.id}`, 'color: green;');
        const groupedByColor = groupBy(rawData, groupKeyAccessor);
        legendData = Object.keys(groupedByColor).sort();
        console.log(`Pie slices found (${legendData.length}): ${legendData.slice(0, 10).join(', ')}...`, 'color: gray;');

        console.log(`Aggregating Pie values by Y-Axis: ${yAxisField.id}`, 'color: green;');
        const aggregatedValues = aggregateData(groupedByColor, yAxisField);

        const data = legendData.map(name => ({
            name: name, // Slice name
            value: aggregatedValues[name] ?? 0, // Slice value
        }));

        series.push({
            name: yAxisField.name, // Overall name for the pie (optional)
            type: 'pie',
            radius: ['40%', '70%'], // Donut chart
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 1 }, // Subtle styling
            label: { show: false, position: 'center' }, // Hide labels by default
            emphasis: { // Show label on hover
                label: { show: true, fontSize: 16, fontWeight: 'bold' }
            },
            labelLine: { show: false },
            data: data,
        });
        // Categories are not applicable for pie charts
        categories = [];
    }
    // --- Scatter Plot Logic ---
    // --- Scatter Plot Logic ---
    else if (chartType === 'scatter') {
        if (!xAxisField?.accessor) {
            throw new Error(`Internal Error: X-Axis field '${xAxisField?.name}' is missing its accessor function.`);
        }
        if (!yAxisField?.accessor) { // Scatter needs Y accessor directly usually
            throw new Error(`Internal Error: Y-Axis field '${yAxisField?.name}' is missing its accessor function.`);
        }
        // sizeField checked in validation
        const sizeAccessor = sizeField?.accessor; // Optional accessor
        const defaultSize = 8; // Default bubble size

        const mapItemToPoint = (item: any): (number | string | null)[] | null => {
            const xVal = xAxisField.accessor!(item);
            const yVal = yAxisField.accessor!(item);
            // Scatter points usually require numeric X and Y. Handle potential non-numeric data.
            // FIX: For category X-axis, keep the string value from the accessor
            const finalXVal = xAxisField.type === 'dimension'
                ? (xVal === null || xVal === undefined ? UNKNOWN_CATEGORY : String(xVal)) // Ensure string for category axis
                : parseNumericValue(xVal); // Parse if measure axis
            const numY = parseNumericValue(yVal);
            const sizeVal = sizeAccessor ? parseNumericValue(sizeAccessor(item)) : defaultSize;

            // Check validity *after* determining finalXVal type
            if ((xAxisField.type === 'measure' && (finalXVal === null || finalXVal === undefined || isNaN(Number(finalXVal)))) ||
                numY === null || numY === undefined || isNaN(numY)) {
                // console.warn(`Skipping invalid scatter point: X=${xVal}, Y=${yVal}`, 'color: orange;');
                return null; // Skip invalid points
            }

            // Format: [X, Y, Size?, ItemName/ID?] - ItemName could be used in tooltips
            const pointData: (number | string | null)[] = [finalXVal, numY];
            if (sizeAccessor) {
                pointData.push(sizeVal > 0 ? sizeVal : 1); // Ensure size is positive
            }
            // Optionally add original item data or ID for tooltips
            // pointData.push(item.id || item.name); // Example
            return pointData;
        };


        if (!colorField?.accessor) {
            // Simple Scatter (single series)
            console.log(`Simple scatter: Mapping points`, 'color: green;');
            const data = rawData.map(mapItemToPoint).filter(point => point !== null); // Type: ((number | string | null)[] | null)[] -> (number | string | null)[][]

            series.push({
                name: yAxisField.name,
                type: 'scatter',
                symbolSize: sizeAccessor ? undefined : defaultSize, // Let data control size if field exists
                data: data, // Assign the possibly mixed array here
                emphasis: { focus: 'series', scale: 1.1 }, // Scale point on hover
            });
            legendData.push(yAxisField.name);

        } else {
            // Grouped Scatter (by color)
            console.log(`Grouped scatter: Grouping by Color (${colorField.id})`, 'color: green;');
            const colorKeyAccessor = (item: any): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
            const groupedByColor = groupBy(rawData, colorKeyAccessor);
            legendData = Object.keys(groupedByColor).sort();
            console.log(`Color groups found (${legendData.length}): ${legendData.slice(0, 10).join(', ')}...`, 'color: gray;');

            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                const data = colorGroupData.map(mapItemToPoint).filter(point => point !== null); // Type: (number | string | null)[][]

                return {
                    name: colorValue,
                    type: 'scatter',
                    symbolSize: sizeAccessor ? undefined : defaultSize,
                    data: data, // Assign the possibly mixed array here
                    emphasis: { focus: 'series', scale: 1.1 },
                };
            });
        }

        // --- FIX START: Correctly handle category generation ---
        // Determine X-axis type for scatter (Value or Category)
        if (xAxisField.type === 'dimension') {
            // Ensure accessor exists (should be guaranteed by earlier checks, but good practice)
            if (!xAxisField.accessor) {
                throw new Error(`Internal Error: X-Axis dimension field '${xAxisField?.name}' is missing its accessor function.`);
            }
            categories = rawData
                .map(item => {
                    const value = xAxisField.accessor!(item); // Get the raw value from the accessor

                    // Explicitly handle null/undefined and convert other types to string
                    if (value === null || value === undefined) {
                        return UNKNOWN_CATEGORY; // Use your constant for consistency
                    }
                    // Handle potential arrays - decide how: placeholder, join, etc.
                    if (Array.isArray(value)) {
                        console.warn(`Dimension field ${xAxisField.id} returned an array. Using placeholder "${UNKNOWN_CATEGORY}".`, 'color: orange;');
                        return UNKNOWN_CATEGORY; // Hoặc JSON.stringify(value) ? value.join(',') ? Tùy thuộc hành vi mong muốn
                    }
                    // Convert numbers, booleans, etc., to string
                    return String(value);
                })
                .filter((v, i, a) => a.indexOf(v) === i) // Filter unique strings
                .sort(); // Sort strings
            console.log(`Scatter categories (dimension) found (${categories.length}): ${categories.slice(0, 10).join(', ')}...`, 'color: gray;');
        } else {
            // If X-axis is a measure, categories are usually not applicable for scatter ECharts config
            // ECharts will treat the X-axis as 'value' type automatically.
            categories = [];
            console.log(`Scatter categories: Not applicable (X-axis is measure)`, 'color: gray;');
        }
        // --- FIX END ---
    }

    console.log(`processDataForChart finished. Series: ${series.length}, Categories: ${categories.length}, Legend: ${legendData.length}`, 'color: blue;');
    return { categories, series, legendData };
};


// --- ECharts Option Generation ---

/**
 * Generates the ECharts option object based on processed data and configuration.
 * @param rawData The raw array of data items (needed again for processing).
 * @param config The ChartConfig object.
 * @param options The ChartOptions object (title, legend visibility, etc.).
 * @param availableFields The list of all defined DataFields.
 * @returns An EChartsOption object ready for rendering.
 * @throws Error from processDataForChart if configuration is invalid.
 */
export const generateChartOption = (
    rawData: ConferenceResponse[],
    config: ChartConfig,
    options: ChartOptions,
    availableFields: DataField[]
): EChartsOption => {
    // console.log(`generateChartOption called. Type: ${config.chartType}, Title: "${options.title}"`, 'color: purple;');

    // 1. Process Data
    const { categories, series, legendData } = processDataForChart(rawData, config, availableFields);

    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
    const sizeField = availableFields.find(f => f.id === config.size?.fieldId);

    // 2. Determine Axis Types
    let xAxisType: 'category' | 'value' | 'time' | 'log' = 'category'; // Default
    if (config.chartType === 'scatter') {
        xAxisType = (xAxisField && xAxisField.type === 'measure') ? 'value' : 'category';
    } else if (config.chartType === 'bar' || config.chartType === 'line') {
        xAxisType = 'category';
    }

    // --- FIX: Define xAxisOption using indexed access type ---
    let xAxisOption: EChartsOption['xAxis'] = undefined;
    if (config.chartType !== 'pie') {
        if (xAxisType === 'category') {
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
                boundaryGap: true, // <-- Boolean là đúng cho category
            };
        } else { // Includes 'value', 'time', 'log'
            xAxisOption = {
                type: 'value', // Hoặc 'time', 'log'
                name: xAxisField?.name,
                nameLocation: 'middle',
                nameGap: 25,
                nameTextStyle: { fontSize: 12 },
                axisTick: undefined, // Thường không cần tick đặc biệt cho value axis
                axisLabel: {
                    fontSize: 10,
                },
                // boundaryGap: false, // <-- XÓA DÒNG NÀY
                // Mặc định cho type 'value' là không có khoảng đệm thêm (boundaryGap = [0,0])
            };
        }
    }
    // --- FIX END ---


    // 3. Build Base Option Structure
    const finalOption: EChartsOption = {
        title: {
            text: options.title || 'Chart',
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'normal' },
        },
        tooltip: {
            trigger: config.chartType === 'pie' ? 'item' : 'axis',
            axisPointer: { type: 'cross' }, // Crosshair for axis tooltips
            // formatter: // Add custom formatter later if needed based on chart type/data
        },
        legend: {
            show: options.showLegend && legendData && legendData.length > 0, // Show if enabled and items exist
            type: 'scroll', // Allow scrolling if many items
            orient: 'horizontal',
            left: 'center',
            bottom: 5, // Position at bottom
            data: legendData,
            textStyle: { fontSize: 10 }, // Smaller legend text
            itemWidth: 15, // Adjust legend item symbol size
            itemHeight: 10,
        },
        toolbox: {
            show: options.showToolbox,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            itemSize: 14, // Smaller toolbox icons
            feature: {
                // dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset' } },
                magicType: {
                    type: ['line', 'bar', 'stack'], // Allow switching (contextually useful)
                    title: { line: 'Line', bar: 'Bar', stack: 'Stack', tiled: 'Tiled' }
                },
                restore: { title: 'Restore' },
                saveAsImage: {
                    name: options.title?.replace(/[^a-z0-9]/gi, '_') || 'chart', // Sanitize filename
                    type: 'png',
                    pixelRatio: 2, // Higher resolution save
                    title: 'Save PNG'
                },
                dataView: { readOnly: true, title: 'Data View', lang: ['Data View', 'Close', 'Refresh'] }, // Allow viewing data
            },
        },
        grid: { // Padding around the chart area
            left: '3%',
            right: '8%', // Increased right padding for toolbox
            bottom: options.showLegend && legendData && legendData.length > 0 ? '10%' : '5%', // Adjust based on legend
            top: '15%', // Padding for title
            containLabel: true // Ensure axis labels fit
        },
        xAxis: xAxisOption, // <-- Assign the conditionally created option object
        yAxis: config.chartType !== 'pie' ? { // yAxis is usually 'value' in these examples
            type: 'value',
            name: yAxisField?.name,
            nameLocation: 'middle',
            nameGap: 45, // Adjust based on expected label length
            nameTextStyle: { fontSize: 12 },
            axisLabel: {
                fontSize: 10,
                // formatter: '{value} units' // Custom formatting if needed
            },
        } : undefined, // No yAxis for Pie
        series: series,
        // visualMap: [], // Placeholder for continuous color/size mapping
        // dataZoom: [], // Placeholder for zoom/scroll
        // backgroundColor: '#fff', // Optional background
    };

    // 4. Apply Chart-Specific Overrides & Enhancements

    // Pie Chart: Remove axis/grid explicitly (already handled by xAxisOption being undefined)
    if (config.chartType === 'pie') {
        // delete finalOption.xAxis; // No longer needed
        delete finalOption.yAxis;
        delete finalOption.grid;
        // Adjust tooltip formatter for Pie
        finalOption.tooltip = {
            ...finalOption.tooltip,
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)' // Standard pie tooltip: Series Name, Item Name, Value, Percentage
        };
    }

    // Scatter Chart: Ensure value axis types are correct (already handled by xAxisOption logic)
    // Scatter Chart logic
    // Scatter Chart logic
    if (config.chartType === 'scatter') {

        // Add visualMap if size field is used
        if (sizeField && finalOption.series && Array.isArray(finalOption.series) && finalOption.series.length > 0) {
            let minSize = Infinity, maxSize = -Infinity;
            let sizeDataExists = false;

            finalOption.series.forEach(s => {
                // Check if series is scatter and data exists and has length
                // (length check is important for ArrayLike)
                if (s.type === 'scatter' && s.data && typeof (s.data as any).length === 'number') {

                    // --- FIX START: Use standard for loop for ArrayLike compatibility ---
                    const dataLength = (s.data as any).length; // Get length safely
                    for (let i = 0; i < dataLength; i++) {
                        // Truy cập phần tử bằng chỉ mục
                        const item = (s.data as any)[i];

                        // Giữ nguyên type guard bên trong cho từng 'item'
                        if (Array.isArray(item) && item.length > 2) {
                            const sizeVal = item[2];
                            if (typeof sizeVal === 'number' && !isNaN(sizeVal)) {
                                sizeDataExists = true;
                                minSize = Math.min(minSize, sizeVal);
                                maxSize = Math.max(maxSize, sizeVal);
                            }
                        }
                        // Bạn có thể thêm else if để xử lý trường hợp item là object
                        // else if (typeof item === 'object' && item !== null && Array.isArray((item as any).value)) {
                        //    // Xử lý item.value[2] nếu cần
                        // }
                        // else {
                        //    console.warn("Unexpected scatter data item format:", item);
                        // }
                    }
                    // --- FIX END ---
                }
            });

            // Logic thêm visualMap không đổi
            if (sizeDataExists && isFinite(minSize) && isFinite(maxSize) && minSize !== maxSize) {
                console.log(`Adding visualMap for size. Range: ${minSize}-${maxSize}`, 'color: purple;');
                finalOption.visualMap = [{
                    type: 'continuous',
                    dimension: 2,
                    min: minSize,
                    max: maxSize,
                    itemWidth: 15,
                    itemHeight: 80,
                    text: [`Max: ${maxSize.toFixed(1)}`, `Min: ${minSize.toFixed(1)}`],
                    textGap: 5,
                    textStyle: { fontSize: 10 },
                    calculable: true,
                    realtime: true,
                    inRange: { symbolSize: [5, 30] },
                    orient: 'vertical',
                    left: 10,
                    bottom: '15%'
                }];
            } else if (sizeDataExists) {
                console.log(`Size field selected, but min/max range invalid or constant (${minSize}-${maxSize}). Skipping visualMap.`, 'color: orange;');
            }
        }
        // Adjust scatter tooltip formatter
        finalOption.tooltip = {
            ...finalOption.tooltip,
            trigger: 'item', // Tooltip per point
            formatter: (params: any) => {
                const seriesName = params.seriesName;
                const data = params.data || [];
                // Use axis field names if available, otherwise default
                const xName = xAxisField?.name ?? 'X';
                const yName = yAxisField?.name ?? 'Y';
                let tooltip = `${seriesName}<br/>`;
                // Access data array elements, checking length
                if (data.length > 0) tooltip += `${xName}: ${data[0]}<br/>`;
                if (data.length > 1) tooltip += `${yName}: ${data[1]}<br/>`;
                if (sizeField && data.length > 2) {
                    tooltip += `${sizeField.name}: ${data[2]}<br/>`;
                }
                return tooltip;
            }
        };
    }

    // Add DataZoom for charts with many categories or value-based X-axis
    const addDataZoom = (xAxisType === 'value') || (xAxisType === 'category' && categories && categories.length > 20);
    if (config.chartType !== 'pie' && addDataZoom) {
        console.log(`Adding dataZoom for X-axis.`, 'color: purple;');
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

        // --- FIX START: Adjust grid bottom padding more safely ---
        // Kiểm tra grid tồn tại VÀ không phải là mảng (vì chúng ta khởi tạo nó là object)
        if (finalOption.grid && !Array.isArray(finalOption.grid)) {
            // Bên trong khối này, TypeScript biết finalOption.grid là một object đơn lẻ (GridComponentOption)
            if (options.showLegend && legendData && legendData.length > 0) {
                // Tăng padding nếu cả legend và zoom đều hiển thị
                finalOption.grid.bottom = '15%'; // Truy cập trực tiếp, không cần 'as'
            } else {
                // Padding ít hơn nếu chỉ có zoom
                finalOption.grid.bottom = '10%'; // Truy cập trực tiếp
            }
        }
        // Optional: Nếu có khả năng grid là mảng ở đâu đó khác, bạn cần xử lý trường hợp đó:
        // else if (Array.isArray(finalOption.grid) && finalOption.grid.length > 0) {
        //     // Quyết định grid nào cần sửa, ví dụ: grid đầu tiên
        //     const gridToModify = finalOption.grid[0];
        //     if (options.showLegend && legendData && legendData.length > 0) {
        //         gridToModify.bottom = '15%';
        //     } else {
        //         gridToModify.bottom = '10%';
        //     }
        // }
        // --- FIX END ---
    }


    console.log(`Final ECharts option constructed.`, 'color: purple; font-weight: bold;');
    // console.log(JSON.stringify(finalOption, null, 2)); // Deep log final option if needed

    return finalOption;
};