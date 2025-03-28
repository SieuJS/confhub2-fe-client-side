// src/app/[locale]/visualization/page.tsx
'use client';

import { useCallback, useRef } from 'react';
import { DragDropContext, DropResult, ResponderProvided, DragStart } from '@hello-pangea/dnd';
import DataFieldPanel from '@/src/app/[locale]/visualization/DataFieldPanel';
import ChartConfigPanel from '@/src/app/[locale]/visualization/ChartConfigPanel';
import ChartDisplay from '@/src/app/[locale]/visualization/ChartDisplay';
import Loading from '@/src/app/[locale]/utils/Loading';
// import ErrorDisplay from '@/src/app/[locale]/visualization/ErrorDisplay';
import useVisualizationData from '@/src/hooks/visualization/useVisualizationData';
import useChartBuilder from '@/src/hooks/visualization/useChartBuilder';
import { FieldType } from '@/src/models/visualization/visualization';
import { downloadChartAsSvg } from '@/src/app/[locale]/visualization/utils/chartActions';
import { EChartsType } from 'echarts';

// --- Constants ---
const FIELD_LIST_DROPPABLE_ID = 'availableFields';
const logPrefixPage = "[VisualizationPage]";

// Define a type for keys in ChartConfig that hold field configuration objects
type ConfigZoneKey = 'xAxis' | 'yAxis' | 'color' | 'size';

// Helper type guard to check if a string is a ConfigZoneKey
function isConfigZoneKey(key: string): key is ConfigZoneKey {
    return ['xAxis', 'yAxis', 'color', 'size'].includes(key);
}

/**
 * Main page component for the data visualization tool.
 * Orchestrates data fetching, chart configuration via drag-and-drop,
 * and chart rendering.
 */
const VisualizationPage: React.FC = () => {

    // --- Hooks ---
    const { data: rawData, loading: dataLoading, error: dataError } = useVisualizationData();

    const {
        echartsOption,
        availableFields,
        chartConfig,
        chartOptions,
        isChartReady,
        updateChartConfig,
        updateChartOptions,
        setChartConfig,
    } = useChartBuilder({ rawData });

    const chartInstanceRef = useRef<EChartsType | null | undefined>(null);

    // --- Drag and Drop Handlers ---

    const handleDragStart = useCallback((start: DragStart) => {
    }, []);

    const handleDragEnd = useCallback((result: DropResult, provided: ResponderProvided) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }
        if (destination.droppableId === FIELD_LIST_DROPPABLE_ID) {
            return;
        }

        const field = availableFields.find(f => f.id === draggableId);
        if (!field) {
            return;
        }

        const targetZoneId = destination.droppableId; // Keep as string initially

        // --- Refined Validation & Update ---
        // 1. Check if the targetZoneId is actually one of the zones we can drop fields into
        if (!isConfigZoneKey(targetZoneId)) {
            // Optionally provide feedback
            // alert(`Cannot drop fields onto the '${targetZoneId}' area.`);
            return;
        }
        // Now TypeScript knows targetZoneId is 'xAxis' | 'yAxis' | 'color' | 'size'

        // 2. Validate field type against the specific zone
        let acceptedType: FieldType | 'any' = 'any';
        switch (targetZoneId) { // targetZoneId is now type ConfigZoneKey
            case 'xAxis':
                acceptedType = chartConfig.chartType === 'scatter' ? 'any' : 'dimension';
                break;
            case 'yAxis': acceptedType = 'measure'; break;
            case 'color': acceptedType = 'dimension'; break;
            case 'size': acceptedType = 'measure'; break;
        }

        if (acceptedType !== 'any' && field.type !== acceptedType) {
            const zoneLabel = targetZoneId.charAt(0).toUpperCase() + targetZoneId.slice(1);
            console.warn(`%c${logPrefixPage} -> Invalid drop: ${field.type} field into ${zoneLabel} zone (requires ${acceptedType})`);
            alert(`Cannot drop a ${field.type} field into the ${zoneLabel} zone (requires ${acceptedType}).`);
            return;
        }

        // 3. Update Chart Configuration State - Now safe
        setChartConfig(prevConfig => {
            const newConfig = {
                ...prevConfig,
                // targetZoneId is guaranteed to be a ConfigZoneKey here
                [targetZoneId]: {
                    // Spread the existing properties of the specific zone object (e.g., prevConfig.xAxis)
                    // This is now safe because properties like xAxis, yAxis etc., are expected to be objects
                    ...prevConfig[targetZoneId],
                    fieldId: draggableId // Set the new field ID
                }
            };
            return newConfig;
        });

    }, [availableFields, setChartConfig, chartConfig.chartType]);

    /**
     * Handles removing a field from a configuration zone.
     */
    const handleRemoveField = useCallback((zoneId: string) => {

        // Ensure we only try to remove from valid field configuration zones
        if (!isConfigZoneKey(zoneId)) {
            return; // Do nothing if it's not a valid zone to clear
        }
        // Now TypeScript knows zoneId is 'xAxis' | 'yAxis' | 'color' | 'size'

        setChartConfig(prevConfig => {
            const newConfig = {
                ...prevConfig,
                // zoneId is guaranteed to be a ConfigZoneKey here
                [zoneId]: {
                    // Spread the existing properties of the specific zone object
                    ...prevConfig[zoneId],
                    fieldId: null // Clear the field ID for that zone
                }
            };
            return newConfig;
        });
    }, [setChartConfig]);

    /**
     * Callback passed to ChartDisplay to receive the ECharts instance.
     */
    const handleGetChartInstance = useCallback((instance: EChartsType | null | undefined) => {
        // This assignment already handles undefined correctly
        chartInstanceRef.current = instance ?? null;
    }, []);


    /**
     * Handles the download SVG action.
     */
    const handleDownload = useCallback(() => {
        // No change needed here, the types now match
        if (chartInstanceRef.current) { // Still check if current is truthy (not null)
            try {
                downloadChartAsSvg(
                    chartInstanceRef, // Pass the ref object
                    chartOptions.title || 'chart'
                );
            } catch (error) {
                console.error(`%c${logPrefixPage} -> Error during SVG download:`, error);
            }
        } else {
            console.warn(`%c${logPrefixPage} -> Download failed: Chart instance ref is not available or chart not ready.`);
        }
    }, [chartOptions.title]); // Pass chartInstanceRef only if its identity is needed, otherwise just its .current value's dependencies



    // --- Render Logic ---
    // (Render logic remains the same as previous correct version)
    if (dataLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <Loading />
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100 p-4">
                <p className="rounded border border-red-300 bg-red-50 p-4 text-center text-red-700 shadow-md">
                    Error loading visualization data: <br /> {dataError}
                </p>
            </div>
        );
    }

    if (!rawData) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100 p-4">
                <p className="text-center text-gray-500">No data loaded or available for visualization.</p>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="flex h-screen w-screen flex-row overflow-hidden bg-gray-100">
                <DataFieldPanel fields={availableFields} droppableId={FIELD_LIST_DROPPABLE_ID} />
                <div className="flex flex-grow flex-col p-2">
                    <ChartDisplay
                        option={echartsOption}
                        isLoading={false}
                        isReady={isChartReady}
                        config={chartConfig}
                        onDownloadSvg={handleDownload}
                        getChartInstance={handleGetChartInstance}
                        chartHeight="100%"
                    />
                </div>
                <ChartConfigPanel
                    availableFields={availableFields}
                    config={chartConfig}
                    options={chartOptions}
                    onConfigChange={updateChartConfig}
                    onOptionsChange={updateChartOptions}
                    onRemoveField={handleRemoveField}
                />
            </div>
        </DragDropContext>
    );
};

export default VisualizationPage;


