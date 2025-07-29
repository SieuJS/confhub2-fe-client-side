import React, { useState, Fragment } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import {
  ChartConfig,
  ChartOptions,
  DataField,
  ChartType,
  AVAILABLE_CHART_TYPES,
  FieldType,
} from '../../../models/visualization/visualization';
import DropZone from './DropZone';
import { Listbox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';

// --- Interfaces ---
interface ChartConfigPanelProps {
  availableFields: DataField[];
  config: ChartConfig;
  options: ChartOptions;
  onConfigChange: (newConfig: Partial<ChartConfig>) => void;
  onOptionsChange: (newOptions: Partial<ChartOptions>) => void;
  onRemoveField: (zoneId: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isDragDisabled?: boolean;
}

interface ZoneConfig {
  show: boolean;
  label: string;
  acceptedType: FieldType;
  required: boolean;
}

// --- Component ---
const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
  availableFields,
  config,
  options,
  onConfigChange,
  onOptionsChange,
  onRemoveField,
  isCollapsed,
  onToggle,
  isDragDisabled = false,
}) => {
  const t = useTranslations('Visualization.configPanel');
  const { chartType } = config;
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);

  // --- Helper Functions ---
  const getFieldById = (id: string | null | undefined): DataField | null => {
    if (!id) return null;
    return availableFields.find(f => f.id === id) || null;
  };

  // ==================================================================
  // "BỘ NÃO" CỦA PANEL: Định nghĩa các quy tắc cho từng loại biểu đồ
  // ==================================================================
  const CHART_TYPE_CONFIGS: Record<ChartType, { xAxis: ZoneConfig; yAxis: ZoneConfig; color: ZoneConfig }> = {
    none: {
      xAxis: { show: false, label: '', acceptedType: 'dimension', required: false },
      yAxis: { show: false, label: '', acceptedType: 'measure', required: false },
      color: { show: false, label: '', acceptedType: 'dimension', required: false },
    },
    bar: {
      xAxis: { show: true, label: t('zones.xAxisBar'), acceptedType: 'dimension', required: true },
      yAxis: { show: true, label: t('zones.yAxisBar'), acceptedType: 'measure', required: true },
      color: { show: true, label: t('zones.colorBar'), acceptedType: 'dimension', required: false },
    },
    line: {
      xAxis: { show: true, label: t('zones.xAxisLine'), acceptedType: 'dimension', required: true },
      yAxis: { show: true, label: t('zones.yAxisLine'), acceptedType: 'measure', required: true },
      color: { show: true, label: t('zones.colorLine'), acceptedType: 'dimension', required: false },
    },
    pie: {
      xAxis: { show: false, label: '', acceptedType: 'dimension', required: false },
      yAxis: { show: true, label: t('zones.yAxisPie'), acceptedType: 'measure', required: true },
      color: { show: true, label: t('zones.colorPie'), acceptedType: 'dimension', required: true },
    },
    scatter: {
      xAxis: { show: true, label: t('zones.xAxisScatter'), acceptedType: 'measure', required: true },
      yAxis: { show: true, label: t('zones.yAxisScatter'), acceptedType: 'measure', required: true },
      color: { show: true, label: t('zones.colorScatter'), acceptedType: 'dimension', required: false },
    },
    map: {
      xAxis: { show: true, label: t('zones.xAxisMap'), acceptedType: 'dimension', required: true },
      yAxis: { show: true, label: t('zones.yAxisMap'), acceptedType: 'measure', required: true },
      color: { show: false, label: '', acceptedType: 'dimension', required: false }, // Color is handled by visualMap
    },
    treemap: {
      xAxis: { show: true, label: t('zones.xAxisTreemap'), acceptedType: 'dimension', required: true },
      yAxis: { show: true, label: t('zones.yAxisTreemap'), acceptedType: 'measure', required: true },
      color: { show: true, label: t('zones.colorTreemap'), acceptedType: 'dimension', required: false },
    },
  };

  const currentChartConfig = CHART_TYPE_CONFIGS[chartType] || CHART_TYPE_CONFIGS.none;
  const selectedChartTypeInfo = AVAILABLE_CHART_TYPES.find(ct => ct.id === chartType) || AVAILABLE_CHART_TYPES[0];

  return (
    <div
      className={`relative flex h-full flex-col flex-shrink-0 border-l border-gray-20 bg-gray-10 shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? 'pointer-events-none w-0 overflow-hidden border-none p-0 opacity-0' : 'w-72 opacity-100'
      }`}
      aria-hidden={isCollapsed}
    >
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between">
          <h3 className="whitespace-nowrap text-base font-semibold">{t('title')}</h3>
          <button
            onClick={onToggle}
            className="rounded p-1 hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={t('collapse')}
            aria-label={t('collapse')}
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-4 pb-4">
        {/* Chart Type Selector */}
        <div className="mb-4">
          <Listbox value={chartType} onChange={(value: ChartType) => onConfigChange({ chartType: value })}>
            <Listbox.Label className="mb-1 block text-sm font-medium">{t('chartType')}</Listbox.Label>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-30 bg-white-pure py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                <span className="block truncate">{selectedChartTypeInfo.name}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-40" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white-pure py-1 text-base shadow-lg ring-1 ring-black-pure ring-opacity-5 focus:outline-none sm:text-sm">
                  {AVAILABLE_CHART_TYPES.map(type => (
                    <Listbox.Option key={type.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-90'}`} value={type.id}>
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{type.name}</span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Dynamic Drop Zones */}
        <div className="space-y-1">
          {currentChartConfig.xAxis.show && (
            <Droppable droppableId="xAxis" isDropDisabled={isDragDisabled}>
              {(provided, snapshot) => (
                <DropZone id="xAxis" {...currentChartConfig.xAxis} field={getFieldById(config.xAxis?.fieldId)} onRemoveField={onRemoveField} provided={provided} snapshot={snapshot} />
              )}
            </Droppable>
          )}
          {currentChartConfig.yAxis.show && (
            <Droppable droppableId="yAxis" isDropDisabled={isDragDisabled}>
              {(provided, snapshot) => (
                <DropZone id="yAxis" {...currentChartConfig.yAxis} field={getFieldById(config.yAxis?.fieldId)} onRemoveField={onRemoveField} provided={provided} snapshot={snapshot} />
              )}
            </Droppable>
          )}
          {currentChartConfig.color.show && (
            <Droppable droppableId="color" isDropDisabled={isDragDisabled}>
              {(provided, snapshot) => (
                <DropZone id="color" {...currentChartConfig.color} field={getFieldById(config.color?.fieldId)} onRemoveField={onRemoveField} provided={provided} snapshot={snapshot} />
              )}
            </Droppable>
          )}
        </div>

        {/* Chart Options Section */}
        <div className="mt-4 border-t border-gray-20 pt-4">
          <button onClick={() => setIsOptionsOpen(!isOptionsOpen)} className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-80 focus:outline-none" aria-expanded={isOptionsOpen}>
            <span>{t('options.title')}</span>
            <Cog6ToothIcon className={`h-5 w-5 text-gray-50 transition-transform duration-200 ${isOptionsOpen ? 'rotate-90' : ''}`} />
          </button>
          <Transition show={isOptionsOpen} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
            <div className="mt-3 space-y-4">
              <div>
                <label htmlFor="chartTitle" className="mb-1 block text-xs font-medium">{t('options.chartTitle')}</label>
                <input type="text" id="chartTitle" placeholder={t('options.chartTitlePlaceholder')} value={options.title} onChange={e => onOptionsChange({ title: e.target.value })} className="w-full rounded border border-gray-30 bg-white-pure px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('options.showLegend')}</span>
                <button onClick={() => onOptionsChange({ showLegend: !options.showLegend })} title={t(options.showLegend ? 'options.hideLegend' : 'options.showLegend')} className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                  {options.showLegend ? <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" /> : <EyeSlashIcon className="h-5 w-5 text-gray-50 hover:text-gray-70" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('options.showToolbox')}</span>
                <button onClick={() => onOptionsChange({ showToolbox: !options.showToolbox })} title={t(options.showToolbox ? 'options.hideToolbox' : 'options.showToolbox')} className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                  {options.showToolbox ? <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" /> : <EyeSlashIcon className="h-5 w-5 text-gray-50 hover:text-gray-70" />}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default ChartConfigPanel;