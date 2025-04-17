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
import type { EChartsOption, EChartsType } from '@/src/models/visualization/echarts';
import { ChartConfig } from '@/src/models/visualization/visualization';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loading from '../utils/Loading';
import { debounce } from 'lodash';

// --- Register ECharts components (No changes) ---
echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, VisualMapComponent, DataZoomComponent,
  BarChart, LineChart, PieChart, ScatterChart,
  CanvasRenderer
]);

interface ChartDisplayProps {
  option: EChartsOption | null; // Corrected type name
  isLoading: boolean;
  isReady: boolean;
  config: ChartConfig;
  onDownloadSvg: () => void;
  chartHeight?: string | number;
  getChartInstance?: (instance: EChartsType | null | undefined) => void;
}

const logPrefixCD = "[ChartDisplay]";

const ChartDisplay: React.FC<ChartDisplayProps> = ({
    option, // This prop now uses the EChartsCoreOption type
    isLoading,
    isReady,
    config,
    onDownloadSvg,
    chartHeight = '100%',
    getChartInstance
}) => {
  const chartRef = useRef<ReactECharts | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const debouncedChartResize = useCallback(
    debounce(() => {
      // --- Type Assertion (Still likely needed) ---
      const instance = chartRef.current?.getEchartsInstance() as EChartsType | undefined;
      if (instance) {
        instance.resize();
      }
    }, 150),
    []
  );

  useEffect(() => {
    const containerElement = chartContainerRef.current;
    let observer: ResizeObserver | null = null;

    if (containerElement) {
      observer = new ResizeObserver(() => {
        debouncedChartResize();
      });
      observer.observe(containerElement);
    }

    // --- Pass Instance Up ---
    // --- Type Assertion (Still likely needed) ---
    const instance = chartRef.current?.getEchartsInstance() as EChartsType | undefined;
    if (getChartInstance) {
        getChartInstance(instance);
    }
    // --- End Pass Instance ---

    return () => {
      if (observer) {
        observer.disconnect();
      }
      debouncedChartResize.cancel();
    };
  }, [debouncedChartResize, getChartInstance]);


  const getPlaceholderMessage = useCallback((): string => {
      // ... (no changes needed in this function)
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


  // --- Render Logic (No changes) ---
  return (
    <div ref={chartContainerRef} className="relative h-full flex-grow bg-gray-50 p-4 pt-10 shadow-inner rounded-lg overflow-hidden">
       {/* Action Buttons */}
       <div className="absolute top-2.5 right-3 z-10 flex space-x-1.5">
            <button onClick={onDownloadSvg} className="rounded p-1.5 text-gray-500 transition-colors duration-150 hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent" title="Download as SVG" disabled={isLoading || !isReady || !option} aria-label="Download chart as SVG">
               <ArrowDownTrayIcon className="h-5 w-5"/>
            </button>
       </div>
      {/* Loading Overlay */}
      {isLoading && (<div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm"><Loading /></div>)}
      {/* Placeholder/Instructions */}
      {!isLoading && !isReady && (<div className="flex h-full flex-col items-center justify-center text-center text-gray-500"><p className="mb-2">{getPlaceholderMessage()}</p><p className="text-sm text-gray-400">Drag fields from the left panel to the configuration zones on the right.</p></div>)}
      {/* ECharts Component */}
      {!isLoading && isReady && option && ( <ReactECharts ref={chartRef} echarts={echarts} option={option} notMerge={true} lazyUpdate={true} style={{ height: chartHeight, width: '100%' }} /> )}
    </div>
  );
};

export default ChartDisplay;