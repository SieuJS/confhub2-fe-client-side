import React, { useRef, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent, // For color/size encoding feedback
  DataZoomComponent, // For zooming/panning
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption, EChartsType } from 'echarts';
import { ChartConfig, ChartType } from '@/src/models/visualization/visualization'; // Adjust path if needed
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loading from '../utils/Loading'; // Adjust path if needed

// Register necessary ECharts components and renderers
// This ensures tree shaking works correctly with echarts-for-react
echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, VisualMapComponent, DataZoomComponent,
  BarChart, LineChart, PieChart, ScatterChart,
  CanvasRenderer
]);

interface ChartDisplayProps {
  /** The ECharts option object defining the chart's appearance and data. Null if not ready or configured. */
  option: EChartsOption | null;
  /** Indicates if chart data is currently being loaded or processed. */
  isLoading: boolean;
  /** Indicates if the chart has the minimum required configuration to be rendered. */
  isReady: boolean;
  /** The current chart configuration (type, field mappings). Used for placeholder messages. */
  config: ChartConfig;
  /** Callback function triggered when the download SVG button is clicked. */
  onDownloadSvg: () => void;
  /** Optional: Explicit height for the chart container (e.g., '400px', '100%'). Defaults to '100%'. */
  chartHeight?: string | number;
  /** Optional: Callback function to pass the ECharts instance upwards when it's created or updated. */
  getChartInstance?: (instance: EChartsType | null | undefined) => void;
}

const logPrefixCD = "[ChartDisplay]";

/**
 * Renders the ECharts chart based on the provided options or displays loading/placeholder states.
 * Includes action buttons like 'Download SVG'.
 */
const ChartDisplay: React.FC<ChartDisplayProps> = ({
    option,
    isLoading,
    isReady,
    config,
    onDownloadSvg,
    chartHeight = '100%', // Default height
    getChartInstance
}) => {
  const chartRef = useRef<ReactECharts | null>(null);

  // Effect to pass the ECharts instance up whenever it's available or the option changes
  useEffect(() => {
    // console.log(`${logPrefixCD} useEffect triggered. Option ready: ${!!option}, Ref ready: ${!!chartRef.current}`);
    const instance = chartRef.current?.getEchartsInstance();
    if (getChartInstance && instance) {
        // console.log(`${logPrefixCD} Passing chart instance up.`);
        getChartInstance(instance);
    }
    // Optional cleanup: pass null when component unmounts or instance becomes unavailable
    // return () => {
    //   if (getChartInstance) {
    //     getChartInstance(null);
    //   }
    // };
  }, [option, getChartInstance]); // Rerun when option or callback changes

  /**
   * Generates a helpful placeholder message based on the current chart configuration state.
   * @returns {string} The placeholder message.
   */
  const getPlaceholderMessage = useCallback((): string => {
      const { chartType, xAxis, yAxis, color, size } = config;
      // console.log(`${logPrefixCD} Generating placeholder message for type: ${chartType}`);

      switch (chartType as ChartType) { // Added explicit type casting for switch clarity
          case 'pie':
              if (!color?.fieldId) return "Please select a field for Slices (Color/Dimension).";
              if (!yAxis?.fieldId) return "Please select a field for Value (Slice Size/Measure).";
              break;
          case 'scatter':
              if (!xAxis?.fieldId) return "Please select a field for the X-Axis.";
              if (!yAxis?.fieldId) return "Please select a field for the Y-Axis.";
              // Size is optional for scatter, color is nice but not strictly required to draw points
              // if (!size?.fieldId) return "Optional: Select a field for Size (Bubble/Measure).";
              // if (!color?.fieldId) return "Optional: Select a field for Color / Group (Dimension).";
              break;
          case 'bar':
          case 'line':
          default: // Default covers bar, line, and potentially future types with similar axes
              if (!xAxis?.fieldId) return "Please select a field for the X-Axis (Category/Dimension).";
              if (!yAxis?.fieldId) return "Please select a field for the Y-Axis (Value/Measure).";
              // Color is often optional (series grouping)
              // if (!color?.fieldId) return "Optional: Select a field for Color / Group (Dimension).";
              break;
      }
      // Fallback message if all required fields for the *specific* type are present,
      // but perhaps the data processing hasn't finished or resulted in a valid option.
      return "Configure the chart using the panels, or check data processing.";
  }, [config]); // Dependency is the config object

  return (
    // Main container: relative for positioning children, flex-grow to take space
    <div className="relative h-full flex-grow bg-gray-50 p-4 pt-10 shadow-inner rounded-lg overflow-hidden"> {/* Slightly softer bg, added rounding/overflow */}

       {/* Action Buttons Container */}
       <div className="absolute top-2.5 right-3 z-10 flex space-x-1.5"> {/* Adjusted positioning and spacing */}
            <button
                onClick={onDownloadSvg}
                className="rounded p-1.5 text-gray-500 transition-colors duration-150 hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                title="Download as SVG"
                disabled={isLoading || !isReady || !option} // Disable if loading, not ready, or no option
                aria-label="Download chart as SVG"
            >
               <ArrowDownTrayIcon className="h-5 w-5"/>
            </button>
            {/* Fullscreen button removed as per previous step */}
       </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm"> {/* Slightly transparent bg with blur */}
          <Loading /> {/* Optional message */}
        </div>
      )}

      {/* Placeholder/Instructions - Shown when not loading AND not ready */}
      {!isLoading && !isReady && (
         <div className="flex h-full flex-col items-center justify-center text-center text-gray-500"> {/* Darker text */}
            <p className="mb-2">{getPlaceholderMessage()}</p>
            <p className="text-sm text-gray-400">Drag fields from the left panel to the configuration zones on the right.</p>
         </div>
      )}

      {/* ECharts Component - Shown when not loading AND ready AND option exists */}
      {!isLoading && isReady && option && (
        <ReactECharts
          ref={chartRef}
          echarts={echarts} // Pass the echarts core instance
          option={option} // The configuration object for the chart
          notMerge={true} // Replace the option instead of merging
          lazyUpdate={true} // Update lazily for potentially better performance
          style={{ height: chartHeight, width: '100%' }}
          // onEvents={{ // Example: If you needed to handle chart events directly
          //   'click': (params) => console.log('Chart clicked:', params),
          // }}
        />
      )}
    </div>
  );
};

export default ChartDisplay; // Memoize if props don't change often unnecessarily