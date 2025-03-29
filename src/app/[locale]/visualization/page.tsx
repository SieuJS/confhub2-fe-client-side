// src/app/[locale]/visualization/page.tsx
'use client';

import { useCallback, useRef, useState, useEffect } from 'react'; // Import useState
import { DragDropContext, DropResult, ResponderProvided, DragStart } from '@hello-pangea/dnd';
import DataFieldPanel from '@/src/app/[locale]/visualization/DataFieldPanel';
import ChartConfigPanel from '@/src/app/[locale]/visualization/ChartConfigPanel';
import ChartDisplay from '@/src/app/[locale]/visualization/ChartDisplay';
import Loading from '@/src/app/[locale]/utils/Loading';
import useVisualizationData from '@/src/hooks/visualization/useVisualizationData';
import useChartBuilder from '@/src/hooks/visualization/useChartBuilder';
import { FieldType } from '@/src/models/visualization/visualization';
import { downloadChartAsSvg } from '@/src/app/[locale]/visualization/utils/chartActions';
import { EChartsType } from 'echarts';
// Import icons for collapse buttons
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/20/solid';

// --- Constants ---
const FIELD_LIST_DROPPABLE_ID = 'availableFields';
const logPrefixPage = "[VisualizationPage]";

// Define a type for keys in ChartConfig that hold field configuration objects
type ConfigZoneKey = 'xAxis' | 'yAxis' | 'color' | 'size';

// Helper type guard to check if a string is a ConfigZoneKey
function isConfigZoneKey(key: string): key is ConfigZoneKey {
    return ['xAxis', 'yAxis', 'color', 'size'].includes(key);
}

const VisualizationPage: React.FC = () => {
    // --- State for Collapsible Panels ---
    const [isFieldsPanelCollapsed, setIsFieldsPanelCollapsed] = useState(false);
    const [isConfigPanelCollapsed, setIsConfigPanelCollapsed] = useState(false);

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

    // --- Toggle Functions ---
    const toggleFieldsPanel = useCallback(() => {
        setIsFieldsPanelCollapsed(prev => !prev);
    }, []);

    const toggleConfigPanel = useCallback(() => {
        setIsConfigPanelCollapsed(prev => !prev);
    }, []);

    // --- EFFECT TO RESIZE CHART WHEN PANELS ARE TOGGLED ---
    useEffect(() => {
        // Add a small delay to allow CSS transitions to approximate completion
        const resizeTimer = setTimeout(() => {
            if (chartInstanceRef.current) {
                // console.log(`${logPrefixPage} Resizing chart due to panel toggle.`); // Optional debug log
                chartInstanceRef.current.resize();
            }
        }, 350); // Adjust timing if needed - should be slightly > transition duration (300ms)

        // Cleanup function to clear the timeout if the component unmounts
        // or if the dependencies change again before the timeout executes.
        return () => clearTimeout(resizeTimer);

        // Depend on the collapsed states. Whenever they change, trigger the resize.
    }, [isFieldsPanelCollapsed, isConfigPanelCollapsed]);
    // --- End Effect ---


    // --- Drag and Drop Handlers (Keep existing logic) ---
    const handleDragStart = useCallback((start: DragStart) => {
        // console.log("Drag started:", start);
    }, []);

    const handleDragEnd = useCallback(/* ... existing handleDragEnd logic ... */
        (result: DropResult, provided: ResponderProvided) => {
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

            const targetZoneId = destination.droppableId;

            if (!isConfigZoneKey(targetZoneId)) {
                return;
            }

            let acceptedType: FieldType | 'any' = 'any';
            switch (targetZoneId) {
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

            setChartConfig(prevConfig => {
                const newConfig = {
                    ...prevConfig,
                    [targetZoneId]: {
                        ...prevConfig[targetZoneId],
                        fieldId: draggableId
                    }
                };
                return newConfig;
            });

        }, [availableFields, setChartConfig, chartConfig.chartType]);

    /**
     * Handles removing a field from a configuration zone.
     */
    const handleRemoveField = useCallback(
        (zoneId: string) => {
            if (!isConfigZoneKey(zoneId)) {
                return;
            }
            setChartConfig(prevConfig => {
                const newConfig = {
                    ...prevConfig,
                    [zoneId]: {
                        ...prevConfig[zoneId],
                        fieldId: null
                    }
                };
                return newConfig;
            });
        }, [setChartConfig]);


    /**
     * Callback passed to ChartDisplay to receive the ECharts instance.
     */
    // --- Chart Instance and Download Handlers ---
    // --- Chart Instance Callback ---
    // Keep this exactly as it is, it's needed to get the instance for download etc.
    // The ResizeObserver in ChartDisplay will use the instance internally.
    const handleGetChartInstance = useCallback((instance: EChartsType | null | undefined) => {
        if (instance !== chartInstanceRef.current) {
            // console.log(`${logPrefixPage} Received chart instance:`, instance ? 'Instance acquired' : 'Instance removed');
            chartInstanceRef.current = instance ?? null;
            // NO NEED to call resize here, ResizeObserver handles it
        }
    }, []);

    /**
     * Handles the download SVG action.
     */
    const handleDownload = useCallback(() => {
        if (chartInstanceRef.current) {
            try {
                downloadChartAsSvg(chartInstanceRef, chartOptions.title || 'chart');
            } catch (error) {
                console.error(`%c${logPrefixPage} -> Error during SVG download:`, error);
            }
        } else {
            console.warn(`%c${logPrefixPage} -> Download failed: Chart instance ref not available or chart not ready.`);
        }
    }, [chartOptions.title]);


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

                {/* Left Panel: Fields */}
                <DataFieldPanel
                    fields={availableFields}
                    droppableId={FIELD_LIST_DROPPABLE_ID}
                    isCollapsed={isFieldsPanelCollapsed}
                    onToggle={toggleFieldsPanel}
                />

                {/* Center Panel: Chart Display */}
                {/* REMOVED transition classes from this div */}
                <div className="relative flex flex-grow flex-col p-2">
                    {/* Expand Fields Button */}
                    {isFieldsPanelCollapsed && (
                        <button
                            onClick={toggleFieldsPanel}
                            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 transform rounded-r-md bg-gray-200 p-1 text-gray-600 shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            title="Expand Fields Panel" aria-label="Expand Fields Panel"
                        >
                            <ChevronDoubleRightIcon className="h-5 w-5" />
                        </button>
                    )}

                    <ChartDisplay
                        option={echartsOption}
                        isLoading={dataLoading}
                        isReady={isChartReady}
                        config={chartConfig}
                        onDownloadSvg={handleDownload}
                        getChartInstance={handleGetChartInstance} // Pass the callback
                        chartHeight="100%"
                    />

                    {/* Expand Config Button */}
                    {isConfigPanelCollapsed && (
                        <button
                            onClick={toggleConfigPanel}
                            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 transform rounded-l-md bg-gray-200 p-1 text-gray-600 shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            title="Expand Configuration Panel" aria-label="Expand Configuration Panel"
                        >
                            <ChevronDoubleLeftIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Right Panel: Configuration */}
                <ChartConfigPanel
                    availableFields={availableFields}
                    config={chartConfig}
                    options={chartOptions}
                    onConfigChange={updateChartConfig}
                    onOptionsChange={updateChartOptions}
                    onRemoveField={handleRemoveField}
                    isCollapsed={isConfigPanelCollapsed}
                    onToggle={toggleConfigPanel}
                />

            </div>
        </DragDropContext>
    );
};


export default VisualizationPage;