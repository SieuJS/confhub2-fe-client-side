// src/app/[locale]/visualization/ChartDisplay.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, VisualMapComponent, DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption, EChartsType } from 'echarts';
import { ChartConfig } from '@/src/models/visualization/visualization'; // Adjust path
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loading from '../utils/Loading'; // Adjust path
import { debounce } from 'lodash'; // Import debounce

// --- Register ECharts components (Keep as is) ---
echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, VisualMapComponent, DataZoomComponent,
  BarChart, LineChart, PieChart, ScatterChart,
  CanvasRenderer
]);

interface ChartDisplayProps {
  option: EChartsOption | null;
  isLoading: boolean;
  isReady: boolean;
  config: ChartConfig;
  onDownloadSvg: () => void;
  chartHeight?: string | number;
  getChartInstance?: (instance: EChartsType | null | undefined) => void;
}

const logPrefixCD = "[ChartDisplay]";

const ChartDisplay: React.FC<ChartDisplayProps> = ({
    option,
    isLoading,
    isReady,
    config,
    onDownloadSvg,
    chartHeight = '100%',
    getChartInstance
}) => {
  const chartRef = useRef<ReactECharts | null>(null);
  // Ref for the container DIV that wraps ReactECharts
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Debounced Resize Handler ---
  // useCallback ensures the debounced function identity is stable unless dependencies change
  const debouncedChartResize = useCallback(
    debounce(() => {
      const instance = chartRef.current?.getEchartsInstance();
      if (instance) {
        // console.log(`${logPrefixCD} Resizing chart due to container size change.`);
        instance.resize({
           // You could add width/height explicitly if needed, but usually not required
           // width: 'auto',
           // height: 'auto'
        });
      }
    }, 150), // Adjust debounce delay (ms) as needed (e.g., 150ms)
    [] // No dependencies needed for the debounce function itself
  );

  // --- Effect for ResizeObserver and Instance Callback ---
  useEffect(() => {
    const containerElement = chartContainerRef.current;
    let observer: ResizeObserver | null = null;

    if (containerElement) {
      // Create and attach ResizeObserver
      observer = new ResizeObserver(() => {
        // Call the debounced resize function when the container size changes
        debouncedChartResize();
      });
      observer.observe(containerElement);
      // console.log(`${logPrefixCD} ResizeObserver attached.`);
    }

    // --- Pass Instance Up ---
    // Check if chartRef and getChartInstance are available
    const instance = chartRef.current?.getEchartsInstance();
    if (getChartInstance) {
        // Pass the instance (or null/undefined if not ready)
        getChartInstance(instance);
        // console.log(`${logPrefixCD} Passing chart instance up: ${instance ? 'Instance available' : 'No instance'}`);
    }
    // --- End Pass Instance ---

    // --- Cleanup Function ---
    return () => {
      if (observer) {
        // console.log(`${logPrefixCD} Disconnecting ResizeObserver.`);
        observer.disconnect();
      }
      // Cancel any pending debounced calls
      debouncedChartResize.cancel();
       // Optionally clear the instance passed up on unmount
      // if (getChartInstance) {
      //   getChartInstance(null);
      // }
    };
    // Dependencies:
    // - debouncedChartResize: Ensures effect reruns if debounce logic changes (though it shouldn't here).
    // - getChartInstance: Ensures the instance is passed up if the callback prop changes.
  }, [debouncedChartResize, getChartInstance]);


  // --- getPlaceholderMessage (Keep as is) ---
  const getPlaceholderMessage = useCallback((): string => {
      const { chartType, xAxis, yAxis, color, size } = config;
      switch (chartType) {
          case 'pie':
              if (!color?.fieldId) return "Please select a field for Slices (Color/Dimension).";
              if (!yAxis?.fieldId) return "Please select a field for Value (Slice Size/Measure).";
              break;
          case 'scatter':
              if (!xAxis?.fieldId) return "Please select a field for the X-Axis.";
              if (!yAxis?.fieldId) return "Please select a field for the Y-Axis.";
              break;
          case 'bar':
          case 'line':
          default:
              if (!xAxis?.fieldId) return "Please select a field for the X-Axis (Category/Dimension).";
              if (!yAxis?.fieldId) return "Please select a field for the Y-Axis (Value/Measure).";
              break;
      }
      return "Configure the chart using the panels, or check data processing.";
  }, [config]);


  // --- Render Logic ---
  return (
    // Attach the ref to the direct parent of ReactECharts
    <div ref={chartContainerRef} className="relative h-full flex-grow bg-gray-50 p-4 pt-10 shadow-inner rounded-lg overflow-hidden">

       {/* Action Buttons (Keep as is) */}
       <div className="absolute top-2.5 right-3 z-10 flex space-x-1.5">
            <button
                onClick={onDownloadSvg}
                className="rounded p-1.5 text-gray-500 transition-colors duration-150 hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                title="Download as SVG"
                disabled={isLoading || !isReady || !option}
                aria-label="Download chart as SVG"
            >
               <ArrowDownTrayIcon className="h-5 w-5"/>
            </button>
       </div>

      {/* Loading Overlay (Keep as is) */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loading />
        </div>
      )}

      {/* Placeholder/Instructions (Keep as is) */}
      {!isLoading && !isReady && (
         <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
            <p className="mb-2">{getPlaceholderMessage()}</p>
            <p className="text-sm text-gray-400">Drag fields from the left panel to the configuration zones on the right.</p>
         </div>
      )}

      {/* ECharts Component - Ensure it fills the container */}
      {!isLoading && isReady && option && (
        <ReactECharts
          ref={chartRef} // Keep ref for accessing instance
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          // CRITICAL: Ensure style allows the chart to fill the container monitored by ResizeObserver
          style={{ height: chartHeight, width: '100%' }}
        />
      )}
    </div>
  );
};

export default ChartDisplay;