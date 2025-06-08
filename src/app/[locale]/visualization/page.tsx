// src/app/[locale]/visualization/page.tsx
'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
  DragStart
} from '@hello-pangea/dnd'
import DataFieldPanel from '@/src/app/[locale]/visualization/DataFieldPanel'
import ChartConfigPanel from '@/src/app/[locale]/visualization/ChartConfigPanel'
import ChartDisplay from '@/src/app/[locale]/visualization/ChartDisplay'
import Loading from '@/src/app/[locale]/utils/Loading'
import useVisualizationData from '@/src/hooks/visualization/useVisualizationData'
import useChartBuilder from '@/src/hooks/visualization/useChartBuilder'
import { FieldType } from '@/src/models/visualization/visualization'
import { downloadChartAsSvg } from '@/src/app/[locale]/visualization/utils/chartActions'
import { EChartsType } from 'echarts/core'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'

// --- Constants ---
const FIELD_LIST_DROPPABLE_ID = 'availableFields'
type ConfigZoneKey = 'xAxis' | 'yAxis' | 'color' | 'size'
function isConfigZoneKey(key: string): key is ConfigZoneKey {
  return ['xAxis', 'yAxis', 'color', 'size'].includes(key)
}

const VisualizationPage: React.FC = () => {
  const t = useTranslations()

  const [isFieldsPanelCollapsed, setIsFieldsPanelCollapsed] = useState(false)
  const [isConfigPanelCollapsed, setIsConfigPanelCollapsed] = useState(false)

  const {
    data: rawData,
    loading: dataLoading,
    error: dataError
  } = useVisualizationData()
  const {
    echartsOption,
    availableFields,
    chartConfig,
    chartOptions,
    isChartReady,
    updateChartConfig,
    updateChartOptions,
    setChartConfig
  } = useChartBuilder({ rawData })

  const chartInstanceRef = useRef<EChartsType | null | undefined>(null)

  const toggleFieldsPanel = useCallback(
    () => setIsFieldsPanelCollapsed(prev => !prev),
    []
  )
  const toggleConfigPanel = useCallback(
    () => setIsConfigPanelCollapsed(prev => !prev),
    []
  )

  // REMOVED: useEffect for manual resize on panel collapse/expand
  // The ResizeObserver in ChartDisplay.tsx handles this more effectively.

  const handleDragStart = useCallback((start: DragStart) => {
    // console.log("Drag started:", start);
  }, [])

  const handleDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      const { source, destination, draggableId } = result
      if (!destination || destination.droppableId === FIELD_LIST_DROPPABLE_ID)
        return

      const field = availableFields.find(f => f.id === draggableId)
      if (!field) return

      const targetZoneId = destination.droppableId
      if (!isConfigZoneKey(targetZoneId)) return

      let acceptedType: FieldType | 'any' = 'any'
      switch (targetZoneId) {
        case 'xAxis':
          acceptedType = 'dimension'
          break
        case 'yAxis':
          acceptedType = 'measure'
          break
        case 'color':
          acceptedType = 'dimension'
          break
        case 'size':
          acceptedType = 'measure'
          break
      }

      if (field.type !== acceptedType) {
        const zoneLabel =
          targetZoneId.charAt(0).toUpperCase() + targetZoneId.slice(1)
        console.warn(
          `Invalid drop: ${field.type} field into ${zoneLabel} zone (requires ${acceptedType})`
        )
        alert(
          t('Cannot_drop_field_into_zone', {
            fieldType: field.type,
            zoneLabel: zoneLabel,
            acceptedType: acceptedType
          }) // Example of using t for dynamic alert
        )
        return
      }

      setChartConfig(prevConfig => ({
        ...prevConfig,
        [targetZoneId]: { ...prevConfig[targetZoneId], fieldId: draggableId }
      }))
    },
    [availableFields, setChartConfig, chartConfig.chartType, t] // Added t
  )

  const handleRemoveField = useCallback(
    (zoneId: string) => {
      if (!isConfigZoneKey(zoneId)) return
      setChartConfig(prevConfig => ({
        ...prevConfig,
        [zoneId]: { ...prevConfig[zoneId], fieldId: null }
      }))
    },
    [setChartConfig]
  )

  const handleGetChartInstance = useCallback(
    (instance: EChartsType | null | undefined) => {
      if (instance !== chartInstanceRef.current) {
        chartInstanceRef.current = instance ?? null
      }
    },
    []
  )

  const handleDownload = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        downloadChartAsSvg(chartInstanceRef, chartOptions.title || 'chart')
      } catch (error) {
        console.error(`Error during SVG download:`, error)
        alert(
          `${t('Failed_to_download_chart')}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    } else {
      console.warn(
        `Download failed: Chart instance ref not available or chart not ready.`
      )
    }
  }, [chartOptions.title, t]) // Added t

  if (dataLoading)
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-gray-10'>
        <Loading />
      </div>
    )
  if (dataError)
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-gray-10 p-4'>
        <p className='rounded border border-red-300 bg-red-50 p-4 text-center text-red-700 shadow-md'>
          {t('Error_loading_visualization_data')}: <br /> {dataError}
        </p>
      </div>
    )
  if (!rawData)
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-gray-10 p-4'>
        <p className='text-center text-gray-50'>
          {t('No_data_loaded_or_available_for_visualization')}
        </p>
      </div>
    )

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className='flex h-screen w-screen flex-row overflow-hidden bg-gray-10'>
        <DataFieldPanel
          fields={availableFields}
          droppableId={FIELD_LIST_DROPPABLE_ID}
          isCollapsed={isFieldsPanelCollapsed}
          onToggle={toggleFieldsPanel}
        />
        {/* This is the main chart area container */}
        <div className='relative flex flex-grow flex-col p-2 min-w-0'> {/* ADDED: min-w-0 */}
          {isFieldsPanelCollapsed && (
            <button
              onClick={toggleFieldsPanel}
              className='absolute left-0 top-1/2 z-20 -translate-y-1/2 transform rounded-r-md bg-gray-20 p-1 shadow-md hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              title={t('Expand_Fields_Panel')}
              aria-label={t('Expand_Fields_Panel')}
            >
              <ChevronDoubleRightIcon className='h-5 w-5' />
            </button>
          )}
          <ChartDisplay
            option={echartsOption}
            isLoading={dataLoading}
            isReady={isChartReady}
            config={chartConfig}
            onDownloadSvg={handleDownload}
            getChartInstance={handleGetChartInstance}
            chartHeight='100%'
          />
          {isConfigPanelCollapsed && (
            <button
              onClick={toggleConfigPanel}
              className='absolute right-0 top-1/2 z-20 -translate-y-1/2 transform rounded-l-md bg-gray-20 p-1 shadow-md hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              title={t('Expand_Configuration_Panel')}
              aria-label={t('Expand_Configuration_Panel')}
            >
              <ChevronDoubleLeftIcon className='h-5 w-5' />
            </button>
          )}
        </div>
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
  )
}
export default VisualizationPage