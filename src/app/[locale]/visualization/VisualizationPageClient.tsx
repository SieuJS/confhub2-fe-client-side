// app/[locale]/visualization/VisualizationPageClient.tsx

'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import {
  DragDropContext,
  DropResult,
  ResponderProvided
} from '@hello-pangea/dnd'
import DataFieldPanel from './DataFieldPanel'
import ChartConfigPanel from './ChartConfigPanel'
import ChartDisplay from './ChartDisplay'
import useVisualizationData from '@/src/hooks/visualization/useVisualizationData'
import useChartBuilder from '@/src/hooks/visualization/useChartBuilder'
import { FieldType } from '@/src/models/visualization/visualization'
import { downloadChartAsSvg } from './utils/chartActions'
import { EChartsType } from 'echarts/core'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'
import { notification } from '@/src/utils/toast/notification'
import { ConferenceDetailsListResponse } from '@/src/models/response/conference.response'

// --- Props Interface ---
interface VisualizationPageClientProps {
  initialData: ConferenceDetailsListResponse | null;
  initialError: string | null;
}

// --- Constants ---
const FIELD_LIST_DROPPABLE_ID = 'availableFields'
type ConfigZoneKey = 'xAxis' | 'yAxis' | 'color' | 'size'
function isConfigZoneKey(key: string): key is ConfigZoneKey {
  return ['xAxis', 'yAxis', 'color', 'size'].includes(key)
}

const VisualizationPageClient: React.FC<VisualizationPageClientProps> = ({
  initialData,
  initialError
}) => {
  const t = useTranslations('Visualization')

  // State để đảm bảo DND chỉ render ở client
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    // Khi component được mount trên client, set state này thành true.
    // Điều này sẽ kích hoạt một lần re-render và hiển thị nội dung có DND.
    setIsClient(true)
  }, [])

  const [isFieldsPanelCollapsed, setIsFieldsPanelCollapsed] = useState(false)
  const [isConfigPanelCollapsed, setIsConfigPanelCollapsed] = useState(false)

  const { data: rawData, error: dataError } = useVisualizationData({
    initialData,
    initialError
  })

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

  const handleDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      const { destination, draggableId } = result
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
        const zoneLabel = t(`zones.${targetZoneId}`)
        notification.warning(
          t('invalidDrop', {
            fieldType: t(`fieldTypes.${field.type}`),
            zoneLabel: zoneLabel,
            acceptedType: t(`fieldTypes.${acceptedType}`)
          })
        )
        return
      }

      setChartConfig(prevConfig => ({
        ...prevConfig,
        [targetZoneId]: { ...prevConfig[targetZoneId], fieldId: draggableId }
      }))
    },
    [availableFields, setChartConfig, t]
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
      chartInstanceRef.current = instance ?? null
    },
    []
  )

  const handleDownload = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        downloadChartAsSvg(chartInstanceRef, chartOptions.title || 'chart')
        notification.success(t('downloadSuccess'))
      } catch (error) {
        console.error(`Error during SVG download:`, error)
        notification.error(t('downloadFailed'))
      }
    } else {
      console.warn(
        `Download failed: Chart instance ref not available or chart not ready.`
      )
      notification.warning(t('downloadNotReady'))
    }
  }, [chartOptions.title, t])

  if (dataError) {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-gray-10 p-4'>
        <p className='rounded border border-red-300 bg-red-50 p-4 text-center text-red-700 shadow-md'>
          {t('errorLoadingData')}: <br /> {dataError}
        </p>
      </div>
    )
  }

  if (!rawData) {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-gray-10 p-4'>
        <p className='text-center text-gray-50'>{t('noDataAvailable')}</p>
      </div>
    )
  }

    // ==================================================================
  // GIẢI PHÁP: Tái cấu trúc phần return
  // ==================================================================
  return (
    // DragDropContext luôn là component cha ngoài cùng
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className='flex h-screen w-screen flex-row overflow-hidden bg-gray-10'>
        {/* 
          Bây giờ chúng ta chỉ cần truyền isDragDisabled dựa trên !isClient.
          Nếu chưa ở client, isDragDisabled sẽ là true.
          Khi đã ở client, isDragDisabled sẽ là false.
        */}
        <DataFieldPanel
          fields={availableFields}
          droppableId={'availableFields'}
          isCollapsed={isFieldsPanelCollapsed}
          onToggle={toggleFieldsPanel}
          isDragDisabled={!isClient}
        />
        <div className='relative flex flex-grow flex-col p-2 min-w-0'>
          {isFieldsPanelCollapsed && (
            <button
              onClick={toggleFieldsPanel}
              className='absolute left-0 top-1/2 z-20 -translate-y-1/2 transform rounded-r-md bg-gray-20 p-1 shadow-md hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
              title={t('expandFieldsPanel')}
              aria-label={t('expandFieldsPanel')}
            >
              <ChevronDoubleRightIcon className='h-5 w-5' />
            </button>
          )}
          <ChartDisplay
            option={echartsOption}
            isLoading={false}
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
              title={t('expandConfigPanel')}
              aria-label={t('expandConfigPanel')}
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
          isDragDisabled={!isClient}
        />
      </div>
    </DragDropContext>
  )
}
export default VisualizationPageClient