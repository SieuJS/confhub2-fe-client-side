import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ChartConfig, ChartOptions, DataField, ChartType, AVAILABLE_CHART_TYPES } from '../../../models/visualization/visualization'; // Assuming models are correctly pathed
import DropZone from './DropZone';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, Cog6ToothIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';
import { truncate } from 'fs/promises';

interface ChartConfigPanelProps {
  /** List of data fields available to be dragged into drop zones. */
  availableFields: DataField[];
  /** The current configuration of the chart (type, field mappings). */
  config: ChartConfig;
  /** The current visual options for the chart (title, legend, etc.). */
  options: ChartOptions;
  /** Callback function when the chart configuration (type, field mappings) changes. */
  onConfigChange: (newConfig: Partial<ChartConfig>) => void;
  /** Callback function when the chart visual options change. */
  onOptionsChange: (newOptions: Partial<ChartOptions>) => void;
  /** Callback function when a field needs to be removed from a specific drop zone. */
  onRemoveField: (zoneId: string) => void;
}

// Consistent logging prefix for this component
const logPrefixCCP = "[ChartConfigPanel]";

/**
 * Renders the configuration panel for a chart, allowing users to select chart type,
 * map data fields to chart encodings (axes, color, size) via drag-and-drop,
 * and adjust visual options.
 */
const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
    availableFields,
    config,
    options,
    onConfigChange,
    onOptionsChange,
    onRemoveField
}) => {
    const { chartType } = config;
    const [isOptionsOpen, setIsOptionsOpen] = useState(false); // Local state for options accordion

    /**
     * Finds a DataField object from the availableFields array by its ID.
     * @param id - The ID of the field to find.
     * @returns The DataField object if found, otherwise null.
     */
    const getFieldById = (id: string | null | undefined): DataField | null => {
        // console.log(`%c${logPrefixCCP} getFieldById called for id: ${id}`, 'color: gray'); // Optional: uncomment for debugging
        if (!id) return null;
        return availableFields.find(f => f.id === id) || null;
    };

    // Find the full ChartType object for display purposes
    const selectedChartType = AVAILABLE_CHART_TYPES.find(ct => ct.id === chartType) || AVAILABLE_CHART_TYPES[0]; // Fallback to the first type

    // Determine visibility of drop zones based on the selected chart type
    // These rules define the typical encodings for common chart types.
    const showXAxis = chartType !== 'pie'; // Pie charts don't have a conventional X-axis
    const showYAxis = true; // Always needed (represents value/measure, even for Pie slice size)
    const showColor = true; // Color/Grouping is generally applicable (e.g., series in line/bar, slices in pie)
    const showSize = chartType === 'scatter'; // Size encoding is primarily used in scatter/bubble charts

    // console.log(`%c${logPrefixCCP} Rendering with ChartType: ${chartType}`, 'color: blue');
    // console.log(`%c${logPrefixCCP} DropZone visibility - X: ${showXAxis}, Y: ${showYAxis}, Color: ${showColor}, Size: ${showSize}`, 'color: blue');

    return (
        <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white p-4 shadow-sm overflow-y-auto"> {/* Added overflow-y-auto */}
             <h3 className="mb-4 text-lg font-semibold text-gray-800">Configuration</h3>

             {/* Chart Type Selector */}
             <div className="mb-6"> {/* Increased margin-bottom */}
                 <Listbox value={chartType} onChange={(value: ChartType) => {
                    // console.log(`%c${logPrefixCCP} Chart type changed to: ${value}`, 'color: green');
                    onConfigChange({ chartType: value });
                 }}>
                    <Listbox.Label className="mb-1 block text-sm font-medium text-gray-600">Chart Type</Listbox.Label>
                    <div className="relative">
                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                            <span className="block truncate">{selectedChartType.name}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>
                         <Transition as={React.Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"> {/* Increased z-index */}
                            {AVAILABLE_CHART_TYPES.map((type) => (
                                <Listbox.Option
                                    key={type.id}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                        }`
                                    }
                                    value={type.id}
                                >
                                {({ selected }) => (
                                    <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {type.name}
                                    </span>
                                    {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    ) : null}
                                    </>
                                )}
                                </Listbox.Option>
                            ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                 </Listbox>
             </div>

            {/* Drop Zones Section */}
            <div className="space-y-3"> {/* Added spacing between drop zones */}
                {showXAxis && (
                    <Droppable droppableId="xAxis">
                        {(provided, snapshot) => (
                        <DropZone
                            id="xAxis"
                            label={chartType === 'scatter' ? "X-Axis (Measure/Dimension)" : "X-Axis (Category/Dimension)"} // More specific label for scatter
                            acceptedType={chartType === 'scatter' ? "any" : "dimension"} // Scatter X can be measure or dimension
                            field={getFieldById(config.xAxis?.fieldId)} // Use optional chaining
                            onRemoveField={onRemoveField}
                            provided={provided}
                            snapshot={snapshot}
                            required={true} // Indicate if generally required
                        />
                        )}
                    </Droppable>
                )}

                {showYAxis && (
                    <Droppable droppableId="yAxis">
                        {(provided, snapshot) => (
                        <DropZone
                            id="yAxis"
                            label={chartType === 'pie' ? "Value (Slice Size)" : "Y-Axis (Value/Measure)"}
                            acceptedType="measure" // Y-axis or Pie value typically represents a measure
                            field={getFieldById(config.yAxis?.fieldId)} // Use optional chaining
                            onRemoveField={onRemoveField}
                            provided={provided}
                            snapshot={snapshot}
                            required={true} // A value mapping is always required
                        />
                        )}
                    </Droppable>
                )}

                {showColor && (
                    <Droppable droppableId="color">
                        {(provided, snapshot) => (
                        <DropZone
                            id="color"
                            label={chartType === 'pie' ? "Slices (Color/Dimension)" : "Color / Group (Dimension)"}
                            acceptedType="dimension" // Color is typically used for categorical grouping
                            field={getFieldById(config.color?.fieldId)} // Use optional chaining
                            onRemoveField={onRemoveField}
                            provided={provided}
                            snapshot={snapshot}
                            required={chartType === 'pie'} // Required to define pie slices
                        />
                        )}
                    </Droppable>
                )}

                {showSize && ( // config.size might not exist initially depending on ChartConfig definition
                    <Droppable droppableId="size">
                        {(provided, snapshot) => (
                        <DropZone
                            id="size"
                            label="Size (Bubble/Measure)"
                            acceptedType="measure" // Size typically maps to a quantitative measure
                            // Safely access fieldId using optional chaining, provide null if size or fieldId is missing
                            field={getFieldById(config.size?.fieldId)}
                            onRemoveField={onRemoveField}
                            provided={provided}
                            snapshot={snapshot}
                            required={false} // Size is usually optional
                        />
                        )}
                    </Droppable>
                )}
            </div>

            {/* Chart Options Section */}
             <div className='mt-6 border-t border-gray-200 pt-4'>
                 <button
                     onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                     className='flex w-full items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none' // Added focus style
                     aria-expanded={isOptionsOpen} // Accessibility improvement
                     aria-controls="chart-options-panel" // Accessibility improvement
                 >
                     <span>Chart Options</span>
                     <Cog6ToothIcon className={`h-5 w-5 transition-transform duration-200 ${isOptionsOpen ? 'rotate-90' : ''}`}/> {/* Added duration */}
                 </button>

                 {/* Use transition for smoother open/close */}
                 <Transition
                    show={isOptionsOpen}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                 >
                    <div id="chart-options-panel" className='mt-3 space-y-4'> {/* Increased spacing */}
                          {/* Title Input */}
                         <div>
                            <label htmlFor="chartTitle" className="mb-1 block text-xs font-medium text-gray-500">Chart Title</label>
                            <input
                                type="text"
                                id="chartTitle"
                                name="chartTitle"
                                placeholder="Enter chart title"
                                value={options.title}
                                onChange={(e) => {
                                    // console.log(`%c${logPrefixCCP} Option changed: title`, 'color: purple');
                                    onOptionsChange({ title: e.target.value });
                                }}
                                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" // Adjusted padding
                            />
                         </div>
                         {/* Legend Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Show Legend</span>
                            <button
                                onClick={() => {
                                    // console.log(`%c${logPrefixCCP} Option changed: showLegend`, 'color: purple');
                                    onOptionsChange({ showLegend: !options.showLegend });
                                }}
                                title={options.showLegend ? 'Hide Legend' : 'Show Legend'}
                                className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" // Added focus style
                            >
                                {options.showLegend
                                    ? <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800"/>
                                    : <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600"/>
                                }
                            </button>
                        </div>
                        {/* Toolbox Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Show Toolbox</span>
                             <button
                                onClick={() => {
                                    // console.log(`%c${logPrefixCCP} Option changed: showToolbox`, 'color: purple');
                                    onOptionsChange({ showToolbox: !options.showToolbox });
                                }}
                                title={options.showToolbox ? 'Hide Toolbox' : 'Show Toolbox'}
                                className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" // Added focus style
                             >
                                 {options.showToolbox
                                    ? <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800"/>
                                    : <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600"/>
                                }
                            </button>
                        </div>
                        {/* Placeholder for more options */}
                        {/* <p className="text-xs text-gray-400 italic">More options coming soon (e.g., color palettes, axis formatting)...</p> */}
                     </div>
                 </Transition>
             </div>
        </div>
    );
};

export default ChartConfigPanel;