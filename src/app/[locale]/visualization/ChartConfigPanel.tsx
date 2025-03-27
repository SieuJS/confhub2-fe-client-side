// src/app/visualization/ChartConfigPanel.tsx
import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { ChartConfig, ChartOptions, DataField, ChartType, AVAILABLE_CHART_TYPES } from '../../../models/visualization/visualization';
import DropZone from './DropZone';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, Cog6ToothIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';

interface ChartConfigPanelProps {
  availableFields: DataField[];
  config: ChartConfig;
  options: ChartOptions;
  onConfigChange: (newConfig: Partial<ChartConfig>) => void;
  onOptionsChange: (newOptions: Partial<ChartOptions>) => void;
  onRemoveField: (zoneId: string) => void; // Handler to remove a field from a zone
}


const logPrefixCCP = "[ChartConfigPanel]";


const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
    availableFields,
    config,
    options,
    onConfigChange,
    onOptionsChange,
    onRemoveField
}) => {
    const { chartType } = config;
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const getFieldById = (id: string | null): DataField | null => {
        // console.log(`%c${logPrefixCCP} getFieldById called for id: ${id}`, );
        if (!id) return null;
        return availableFields.find(f => f.id === id) || null;
    };

    const handleChartTypeChange = (value: ChartType) => {
        console.log(`%c${logPrefixCCP} Chart type changed to: ${value}`, );
        onConfigChange({ chartType: value });
    }
     const handleOptionChange = (update: Partial<ChartOptions>) => {
        console.log(`%c${logPrefixCCP} Option changed:`, update);
        onOptionsChange(update);
    }


    const selectedChartType = AVAILABLE_CHART_TYPES.find(ct => ct.id === chartType) || AVAILABLE_CHART_TYPES[0];

    // Define which drop zones are visible based on chart type
    const showXAxis = chartType !== 'pie';
    const showYAxis = true; // Always needed (Value for Pie)
    const showColor = true; // Always useful
    const showSize = chartType === 'scatter'; // Only for scatter

    console.log(`%c${logPrefixCCP} DropZone visibility - X: ${showXAxis}, Y: ${showYAxis}, Color: ${showColor}, Size: ${showSize}`, );

    return (
        <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white p-4 shadow-sm">
             <h3 className="mb-4 text-lg font-semibold text-gray-800">Configuration</h3>

             {/* Chart Type Selector */}
             <div className="mb-4">
                 <Listbox value={chartType} onChange={(value) => onConfigChange({ chartType: value })}>
                    <Listbox.Label className="mb-1 block text-sm font-medium text-gray-600">Chart Type</Listbox.Label>
                    <div className="relative">
                        <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                            <span className="block truncate">{selectedChartType.name}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>
                         <Transition as={React.Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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


            {/* Drop Zones */}
            {showXAxis && (
                <Droppable droppableId="xAxis">
                    {(provided, snapshot) => (
                    <DropZone
                        id="xAxis"
                        label="X-Axis"
                        acceptedType="dimension" // Or 'any' for scatter measures
                        field={getFieldById(config.xAxis.fieldId)}
                        onRemoveField={onRemoveField}
                        provided={provided}
                        snapshot={snapshot}
                    />
                    )}
                </Droppable>
            )}

            {showYAxis && (
                <Droppable droppableId="yAxis">
                    {(provided, snapshot) => (
                    <DropZone
                        id="yAxis"
                        label={chartType === 'pie' ? "Value (Slice Size)" : "Y-Axis"}
                        acceptedType="measure"
                        field={getFieldById(config.yAxis.fieldId)}
                        onRemoveField={onRemoveField}
                        provided={provided}
                        snapshot={snapshot}
                    />
                    )}
                </Droppable>
            )}

            {showColor && (
                <Droppable droppableId="color">
                    {(provided, snapshot) => (
                    <DropZone
                        id="color"
                        label={chartType === 'pie' ? "Slices (Color)" : "Color / Group"}
                        acceptedType="dimension"
                        field={getFieldById(config.color.fieldId)}
                        onRemoveField={onRemoveField}
                        provided={provided}
                        snapshot={snapshot}
                    />
                    )}
                </Droppable>
             )}

            {showSize && config.size && ( // Check if config.size exists
                <Droppable droppableId="size">
                    {(provided, snapshot) => (
                    <DropZone
                        id="size"
                        label="Size (Bubble)"
                        acceptedType="measure"
                        field={getFieldById(config.size?.fieldId ?? null)}
                        onRemoveField={onRemoveField}
                        provided={provided}
                        snapshot={snapshot}
                    />
                    )}
                </Droppable>
             )}

            {/* Chart Options Section */}
             <div className='mt-6 border-t border-gray-200 pt-4'>
                 <button
                     onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                     className='flex w-full items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-800'
                 >
                     <span>Chart Options</span>
                     <Cog6ToothIcon className={`h-5 w-5 transition-transform ${isOptionsOpen ? 'rotate-90' : ''}`}/>
                 </button>

                 {isOptionsOpen && (
                     <div className='mt-3 space-y-3'>
                          {/* Title Input */}
                         <div>
                            <label htmlFor="chartTitle" className="mb-1 block text-xs font-medium text-gray-500">Chart Title</label>
                            <input
                                type="text"
                                id="chartTitle"
                                value={options.title}
                                onChange={(e) => onOptionsChange({ title: e.target.value })}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                         </div>
                         {/* Legend Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Show Legend</span>
                            <button onClick={() => onOptionsChange({ showLegend: !options.showLegend })} title={options.showLegend ? 'Hide Legend' : 'Show Legend'}>
                                {options.showLegend ? <EyeIcon className="h-5 w-5 text-blue-500"/> : <EyeSlashIcon className="h-5 w-5 text-gray-400"/> }
                            </button>
                        </div>
                        {/* Toolbox Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Show Toolbox</span>
                             <button onClick={() => onOptionsChange({ showToolbox: !options.showToolbox })} title={options.showToolbox ? 'Hide Toolbox' : 'Show Toolbox'}>
                                 {options.showToolbox ? <EyeIcon className="h-5 w-5 text-blue-500"/> : <EyeSlashIcon className="h-5 w-5 text-gray-400"/> }
                            </button>
                        </div>
                        {/* Add more options here: Color palettes, Axis labels, etc. */}
                     </div>
                 )}
             </div>
        </div>
    );
};

export default ChartConfigPanel;