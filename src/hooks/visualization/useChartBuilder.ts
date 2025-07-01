// src/hooks/visualization/useChartBuilder.ts

import { useState, useMemo, useCallback, useEffect } from 'react'; // Đảm bảo có useEffect
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField } from '../../models/visualization/visualization';
import { ConferenceDetailsListResponse } from '@/src/models/response/conference.response';
import { getAvailableFields, generateChartOption } from '../../app/[locale]/visualization/utils';
import { useTranslations } from 'next-intl';
import { notification } from '@/src/utils/toast/notification';
interface UseChartBuilderProps {
    rawData: ConferenceDetailsListResponse | null;
}

interface UseChartBuilderReturn {
    echartsOption: EChartsOption | null;
    availableFields: DataField[];
    chartConfig: ChartConfig;
    chartOptions: ChartOptions;
    isChartReady: boolean;
    updateChartConfig: (newConfig: Partial<ChartConfig>) => void;
    updateChartOptions: (newOptions: Partial<ChartOptions>) => void;
    setChartConfig: React.Dispatch<React.SetStateAction<ChartConfig>>;
}


const useChartBuilder = ({ rawData }: UseChartBuilderProps): UseChartBuilderReturn => {
    const t = useTranslations('Visualization');
    const [chartConfig, setChartConfig] = useState<ChartConfig>(defaultChartConfig);
    const [chartOptions, setChartOptions] = useState<ChartOptions>(defaultChartOptions);
    const [echartsOption, setEchartsOption] = useState<EChartsOption | null>(null);

    const dataExists = useMemo(() => !!rawData && rawData.payload.length > 0, [rawData]);

    const availableFields = useMemo<DataField[]>(() => {
        if (!dataExists || !rawData) return [];
        return getAvailableFields(rawData.payload[0]);
    }, [dataExists, rawData]);

    // ==================================================================
    // THAY ĐỔI: CẬP NHẬT LOGIC TRONG useEffect
    // ==================================================================
    useEffect(() => {
        // 1. Kiểm tra xem biểu đồ đã sẵn sàng để được tạo hay chưa.
        // Logic này tương tự như isChartReady.
        const { chartType, xAxis, yAxis, color } = chartConfig;
        let isReadyToBuild = false;
        if (chartType === 'pie') {
            isReadyToBuild = !!(color?.fieldId && yAxis?.fieldId);
        } else { // Covers bar, line
            isReadyToBuild = !!(xAxis?.fieldId && yAxis?.fieldId);
        }

        // 2. Nếu chưa sẵn sàng, reset option và thoát sớm.
        // Điều này ngăn việc gọi generateChartOption một cách không cần thiết.
        if (!isReadyToBuild) {
            setEchartsOption(null);
            return;
        }

        // 3. Nếu đã sẵn sàng và có dữ liệu, tiến hành tạo biểu đồ.
        if (dataExists && availableFields.length > 0 && rawData) {
            try {
                const option = generateChartOption(rawData.payload, chartConfig, chartOptions, availableFields);
                setEchartsOption(option);
            } catch (error: any) {
                // console.error(`Error generating chart option:`, error);
                setEchartsOption(null);
                notification.error(t('chartGenerationError'));
            }
        }
    }, [dataExists, rawData, chartConfig, chartOptions, availableFields, t]);


    // `isChartReady` bây giờ chỉ đơn giản là kiểm tra xem echartsOption có tồn tại không.
    // Nó phản ánh đúng trạng thái "biểu đồ đã được tạo thành công và sẵn sàng để hiển thị".
    const isChartReady = useMemo(() => !!echartsOption, [echartsOption]);

    // Các callback giữ nguyên
    const updateChartConfig = useCallback((newConfig: Partial<ChartConfig>) => {
        setChartConfig(prev => ({ ...prev, ...newConfig }));
    }, []);
    const updateChartOptions = useCallback((newOptions: Partial<ChartOptions>) => {
        setChartOptions(prev => ({ ...prev, ...newOptions }));
    }, []);

    return {
        echartsOption,
        availableFields,
        chartConfig,
        chartOptions,
        isChartReady, // isChartReady giờ đây đơn giản và chính xác hơn
        updateChartConfig,
        updateChartOptions,
        setChartConfig,
    };
};

export default useChartBuilder;



const defaultChartConfig: ChartConfig = {
    chartType: 'bar',
    xAxis: { fieldId: null },
    yAxis: { fieldId: null },
    color: { fieldId: null },
};

const defaultChartOptions: ChartOptions = {
    title: 'Conference Visualization',
    showLegend: true,
    showToolbox: true,
}