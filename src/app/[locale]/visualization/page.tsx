// src/app/visualization/page.tsx
'use client'; // Mark as Client Component

import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, DropResult, ResponderProvided } from 'react-beautiful-dnd';
// import FullScreen from 'react-fullscreen-crossbrowser'; // <-- REMOVE
// import useFullScreenHandle from 'react-fullscreen-crossbrowser'; // <-- REMOVE
import DataFieldPanel from '@/src/app/[locale]/visualization/DataFieldPanel'; // Adjust path if needed
import ChartConfigPanel from '@/src/app/[locale]/visualization/ChartConfigPanel'; // Adjust path if needed
import ChartDisplay from '@/src/app/[locale]/visualization/ChartDisplay'; // Adjust path if needed
import LoadingSpinner from '@/src/app/[locale]/utils/Loading'; // Adjust path if needed
// import ErrorDisplay from '@/src/app/[locale]/visualization/ErrorDisplay'; // Uncomment if you have this component
import useVisualizationData from '@/src/hooks/visualization/useVisualizationData';
import useChartBuilder from '@/src/hooks/visualization/useChartBuilder';
import { ChartConfig, DataField } from '@/src/models/visualization/visualization'; // Adjust path if needed
import { downloadChartAsSvg } from '@/src/app/[locale]/visualization/utils/chartActions'; // Adjust path if needed
import { EChartsType } from 'echarts';


const FIELD_LIST_DROPPABLE_ID = 'availableFields';
const logPrefixPage = "[VisualizationPage]";
const logStylePage = "color: green;";
const highlightLogStylePage = logStylePage + 'font-weight: bold; background-color: lightyellow;';



const VisualizationPage: React.FC = () => {

    console.log(`%c${logPrefixPage} Rendering...`, logStylePage);
    const { data: rawData, loading: dataLoading, error: dataError } = useVisualizationData();
    console.log(`%c${logPrefixPage} Data Hook State: loading=${dataLoading}, error=${dataError}, rawData exists=${!!rawData}`, logStylePage);

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

    console.log(`%c${logPrefixPage} Builder Hook State: isChartReady=${isChartReady}, availableFields=${availableFields.length}`, logStylePage);


    const chartInstanceRef = useRef<EChartsType | null | undefined>(null); // Keep ref for potential future use or download

    const handleDragStart = useCallback((start: any) => {
        console.log(`%c${logPrefixPage} handleDragStart:`, highlightLogStylePage, start);
    }, []);

    const handleDragEnd = useCallback((result: DropResult, provided: ResponderProvided) => {
        console.log(`%c${logPrefixPage} handleDragEnd:`, highlightLogStylePage, result);
        const { source, destination, draggableId } = result;

        if (!destination) {
            console.log(`%c${logPrefixPage} ... Dropped outside a valid zone.`, highlightLogStylePage);
            return;
        }

        if (destination.droppableId === FIELD_LIST_DROPPABLE_ID) {
            console.log(`%c${logPrefixPage} ... Dropped back into field list.`, highlightLogStylePage);
            return;
        }

        const field = availableFields.find(f => f.id === draggableId);
        if (!field) {
            console.error(`%c${logPrefixPage} ... Could not find field with id: ${draggableId}`, highlightLogStylePage + 'color: red;');
            return;
        }

        const targetZone = destination.droppableId as keyof Omit<ChartConfig, 'chartType' | 'size'> | 'size'; // Adjust type to include size potentially
        console.log(`%c${logPrefixPage} ... Dropped field '${field.name}' (${field.id}) onto zone '${targetZone}'`, highlightLogStylePage);


        // --- Validation ---
        const zoneDefinition: { [key: string]: { acceptedType: 'dimension' | 'measure' | 'any' } } = { // Index signature
            xAxis: { acceptedType: 'dimension' },
            yAxis: { acceptedType: 'measure' },
            color: { acceptedType: 'dimension' },
            size: { acceptedType: 'measure' },
        };

        if (zoneDefinition[targetZone]) {
            const accepted = zoneDefinition[targetZone].acceptedType;
            if (accepted !== 'any' && field.type !== accepted) {
                console.warn(`%c${logPrefixPage} ... Invalid drop: ${field.type} into ${targetZone} (needs ${accepted})`, highlightLogStylePage + 'color: orange;');
                alert(`Cannot drop a ${field.type} field into the ${targetZone} zone (requires ${accepted}).`);
                return; // Prevent invalid drop
            }
        }
        // --- End Validation ---


        console.log(`%c${logPrefixPage} ... Updating chart config for zone: ${targetZone}`, highlightLogStylePage);


        // Update the chart configuration state
        setChartConfig(prevConfig => {
            console.log(`%c${logPrefixPage} ... setChartConfig update function running. Prev:`, highlightLogStylePage, prevConfig);
            const newZoneConfig = { fieldId: draggableId };
            const update = { ...prevConfig, [targetZone]: newZoneConfig };
            console.log(`%c${logPrefixPage} ... setChartConfig update function returning:`, highlightLogStylePage, update);
            return update;
        });

    }, [availableFields, setChartConfig]); // Include setChartConfig in dependencies


    const handleRemoveField = useCallback((zoneId: string) => {
        console.log(`%c${logPrefixPage} handleRemoveField called for zone: ${zoneId}`, logStylePage);
        setChartConfig(prevConfig => {
            console.log(`%c${logPrefixPage} ... setChartConfig (remove) update function running. Prev:`, logStylePage, prevConfig);
            const update = { ...prevConfig, [zoneId as keyof Omit<ChartConfig, 'chartType'>]: { fieldId: null } };
            console.log(`%c${logPrefixPage} ... setChartConfig (remove) update function returning:`, logStylePage, update);
            return update;
        });
    }, [setChartConfig]);

    // Handler for downloading SVG - requires access to chart instance
    // This is tricky with refs across components. A Context or lifting state might be better.
    // For now, we assume ChartDisplay somehow exposes its internal ref or instance.
    const handleDownload = () => {
        // This relies on the ChartDisplay component somehow making its instance available
        // e.g., via a callback prop or lifting the ref up. THIS IS A SIMPLIFICATION.
        // A better approach: Pass the chartInstanceRef down to ChartDisplay.
        const tempChartInstance = (chartInstanceRef.current as any)?.getEchartsInstance(); // Example of accessing if possible
        if (tempChartInstance) {
            downloadChartAsSvg({ current: tempChartInstance }, chartOptions.title || 'chart');
        } else {
            console.warn("Chart instance ref not available in parent for download.");
            alert("Download failed: Chart instance not accessible.");
        }
    };

    if (dataLoading) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
    }

    if (dataError) {
        // return <div className="flex h-screen items-center justify-center"><ErrorDisplay message={dataError} /></div>; // Uncomment/implement as needed
        return <div className="flex h-screen items-center justify-center"><p className="text-red-500">Error loading data: {dataError}</p></div>; // Simple error display
    }

    if (!rawData) {
        //  return <div className="flex h-screen items-center justify-center"><ErrorDisplay message="No data loaded." /></div>; // Uncomment/implement as needed
        return <div className="flex h-screen items-center justify-center"><p className="text-gray-500">No data available.</p></div>; // Simple message
    }

    // Remove FullScreen wrapper
    return (
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}> {/* Thêm onDragStart */}
            <div className={`flex h-screen w-screen flex-row overflow-hidden bg-gray-100`}>
                <DataFieldPanel fields={availableFields} droppableId={FIELD_LIST_DROPPABLE_ID} />

                <div className="flex flex-grow flex-col">
                    <ChartDisplay
                        option={echartsOption}
                        isLoading={dataLoading} // Should be false here if main layout renders
                        isReady={isChartReady}
                        config={chartConfig}
                        onDownloadSvg={handleDownload}
                        chartHeight={'calc(100% - 0px)'}
                    // Pass ref callback if ChartDisplay supports it
                    // getChartInstance={(instance) => {
                    //     console.log(`%c${logPrefixPage} Chart instance received from ChartDisplay`, logStylePage);
                    //     chartInstanceRef.current = instance;
                    // }}
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