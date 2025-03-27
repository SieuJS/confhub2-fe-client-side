import { useState, useMemo, useCallback, useRef } from 'react'; // Thêm useRef
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField, ProcessedChartData } from '../../models/visualization/visualization';
import { generateChartOption, getAvailableFields } from '../../app/[locale]/visualization/utils/visualizationUtils';
interface UseChartBuilderProps {
    rawData: any[] | null; // The data fetched from backend
}

interface UseChartBuilderReturn {
    echartsOption: EChartsOption | null;
    availableFields: DataField[];
    chartConfig: ChartConfig;
    chartOptions: ChartOptions;
    isChartReady: boolean;
    updateChartConfig: (newConfig: Partial<ChartConfig>) => void;
    updateChartOptions: (newOptions: Partial<ChartOptions>) => void;
    setChartConfig: React.Dispatch<React.SetStateAction<ChartConfig>>; // For drag-and-drop updates
}

const defaultChartConfig: ChartConfig = {
    chartType: 'bar',
    xAxis: { fieldId: null },
    yAxis: { fieldId: null },
    color: { fieldId: null },
    // size: { fieldId: null }, // Initialize if needed
};

const defaultChartOptions: ChartOptions = {
    title: 'Conference Visualization',
    showLegend: true,
    showToolbox: true,
}


const logPrefix = "[useChartBuilder]";

const useChartBuilder = ({ rawData }: UseChartBuilderProps): UseChartBuilderReturn => {
    console.log(`%c${logPrefix} Hook executing. rawData exists: ${!!rawData}`);
    const [chartConfig, setChartConfig] = useState<ChartConfig>(defaultChartConfig);
    const [chartOptions, setChartOptions] = useState<ChartOptions>(defaultChartOptions);
    const prevRawDataRef = useRef<any[] | null>(null);

    // Kiểm tra tham chiếu rawData
    if (prevRawDataRef.current !== rawData) {
        console.log(`%c${logPrefix} rawData reference CHANGED!`);
        prevRawDataRef.current = rawData;
    } else {
         console.log(`%c${logPrefix} rawData reference is STABLE.`);
    }

    // Define available fields (memoized)
    const availableFields = useMemo<DataField[]>(() => {
        console.log(`%c${logPrefix} Recalculating availableFields...`);
        if (!rawData || rawData.length === 0) {
             console.log(`%c${logPrefix} ... no rawData, returning [].`);
             return [];
        }
        const fields = getAvailableFields(rawData[0]); // Pass a sample item to infer fields
        console.log(`%c${logPrefix} ... calculated ${fields.length} available fields.`);
        return fields;
    }, [rawData]);

    // Process data and generate ECharts option (memoized)
    const echartsOption = useMemo<EChartsOption | null>(() => {
        console.log(`%c${logPrefix} Recalculating echartsOption...`);
        if (!rawData || !availableFields.length) {
             console.log(`%c${logPrefix} ... no rawData or availableFields, returning null.`);
             return null;
        }

        try {
            const option = generateChartOption(rawData, chartConfig, chartOptions, availableFields);
            console.log(`%c${logPrefix} ... successfully generated chart option.`);
            return option;
        } catch (error) {
            console.error(`%c${logPrefix} Error generating chart option:`, error);
            return {
                title: { text: 'Error Generating Chart', subtext: (error as Error).message },
            };
        }
    }, [rawData, chartConfig, chartOptions, availableFields]);

    // Check if chart is ready (memoized)
    const isChartReady = useMemo(() => {
        console.log(`%c${logPrefix} Recalculating isChartReady...`);
        if (!echartsOption || !rawData) {
             console.log(`%c${logPrefix} ... echartsOption or rawData missing, returning false.`);
             return false;
        }
        const { chartType, xAxis, yAxis, color } = chartConfig;
        let ready = false;
        if (chartType === 'pie') {
            ready = !!(color.fieldId && yAxis.fieldId);
        } else {
            ready = !!(xAxis.fieldId && yAxis.fieldId);
        }
         console.log(`%c${logPrefix} ... isChartReady result: ${ready}`);
        return ready;
    }, [echartsOption, chartConfig, rawData]);

    const updateChartConfig = useCallback((newConfig: Partial<ChartConfig>) => {
        console.log(`%c${logPrefix} updateChartConfig called with:`, newConfig);
        setChartConfig(prev => {
            const updated = { ...prev, ...newConfig };
            console.log(`%c${logPrefix} ... new chartConfig state:`, updated);
            return updated;
        });
    }, []); // Dependencies trống là đúng vì chỉ sử dụng `setChartConfig`

    const updateChartOptions = useCallback((newOptions: Partial<ChartOptions>) => {
        console.log(`%c${logPrefix} updateChartOptions called with:`, newOptions);
        setChartOptions(prev => {
            const updated = { ...prev, ...newOptions };
            console.log(`%c${logPrefix} ... new chartOptions state:`, updated);
            return updated;
        });
    }, []); // Dependencies trống là đúng

    const setChartConfigDirectly = useCallback((value: ChartConfig | ((prevState: ChartConfig) => ChartConfig)) => {
        console.log(`%c${logPrefix} setChartConfig (direct) called. Value type: ${typeof value}`);
        setChartConfig(value); // Log bên trong callback nếu value là hàm
         if (typeof value === 'function') {
             setChartConfig(prev => {
                 const result = (value as (prevState: ChartConfig) => ChartConfig)(prev);
                 console.log(`%c${logPrefix} ... new chartConfig state (from function):`, result);
                 return result;
             });
         } else {
              console.log(`%c${logPrefix} ... new chartConfig state (direct value):`, value);
              setChartConfig(value);
         }
    }, []);

    console.log(`%c${logPrefix} Returning values.`);
    return {
        echartsOption,
        availableFields,
        chartConfig,
        chartOptions,
        isChartReady,
        updateChartConfig,
        updateChartOptions,
        setChartConfig: setChartConfigDirectly, // Sử dụng hàm đã bọc log
    };
};

export default useChartBuilder;