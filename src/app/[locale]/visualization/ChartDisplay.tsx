// src/components/visualization/ChartDisplay.tsx
import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption, EChartsType } from 'echarts';
import { ChartConfig } from '@/src/models/visualization/visualization'; // Adjust path if needed
// import { downloadChartAsSvg } from '../../utils/chartActions'; // Keep if used here, or remove if only used in parent
import { ArrowDownTrayIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'; // Keep ArrowDownTrayIcon
import Loading from '../utils/Loading';

// Register necessary components and renderers (Keep this part)
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
  onDownloadSvg: () => void; // Keep download prop
  // onFullscreen: () => void; // <-- REMOVE prop
  chartHeight?: string | number;
  // Optional: Add a callback to pass the instance up
  getChartInstance?: (instance: EChartsType | null | undefined) => void;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({
    option,
    isLoading,
    isReady,
    config,
    onDownloadSvg,
    // onFullscreen, // <-- REMOVE prop from destructuring
    chartHeight = '100%',
    getChartInstance // Optional callback
}) => {
  const chartRef = useRef<ReactECharts | null>(null);
  // No need for echartsInstanceRef here if we use the callback

  useEffect(() => {
     if (chartRef.current && getChartInstance) {
         getChartInstance(chartRef.current.getEchartsInstance());
     }
     // Optional: Clean up ref on unmount
     // return () => {
     //    if (getChartInstance) {
     //       getChartInstance(null);
     //    }
     // }
  }, [option, getChartInstance]); // Update ref when option changes


  const getPlaceholderMessage = (): string => {
      // ... (keep existing logic) ...
      if (config.chartType === 'pie') {
        if (!config.color.fieldId) return "Please select a field for Slices (Color).";
        if (!config.yAxis.fieldId) return "Please select a field for Value (Slice Size).";
      } else {
        if (!config.xAxis.fieldId) return "Please select a field for the X-Axis.";
        if (!config.yAxis.fieldId) return "Please select a field for the Y-Axis.";
      }
      return "Configure the chart using the panels.";
  };

  return (
    <div className="relative h-full flex-grow bg-white p-4 pt-10 shadow-inner">
       {/* Action Buttons */}
       <div className="absolute top-2 right-4 z-10 flex space-x-2">
            <button
                onClick={onDownloadSvg}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download as SVG"
                disabled={isLoading || !isReady || !option}
            >
               <ArrowDownTrayIcon className="h-5 w-5"/>
            </button>
            {/* Remove Fullscreen Button */}
            {/*
            <button
                onClick={onFullscreen} // <-- REMOVE usage
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                title="Toggle Fullscreen"
             >
               <ArrowsPointingOutIcon className="h-5 w-5"/>
            </button>
            */}
       </div>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50">
          <Loading />
        </div>
      )}

      {!isLoading && !isReady && (
         <div className="flex h-full items-center justify-center text-center text-gray-400">
            <p>{getPlaceholderMessage()}<br/>Drag fields from the left panel to the configuration zones on the right.</p>
         </div>
      )}

      {!isLoading && isReady && option && (
        <ReactECharts
          ref={chartRef}
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          style={{ height: chartHeight, width: '100%' }}
        />
      )}
    </div>
  );
};

export default ChartDisplay;