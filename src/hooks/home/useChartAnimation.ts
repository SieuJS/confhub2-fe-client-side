// src/components/IntroduceVisualization/hooks/useChartAnimation.ts
import { useState, useEffect, useMemo } from 'react'
import { sampleDataSets, chartTypes } from './constants'

export const useChartAnimation = (intervalDuration: number = 3000) => {
  const [currentDataSetIndex, setCurrentDataSetIndex] = useState(0)
  const [currentChartTypeIndex, setCurrentChartTypeIndex] = useState(0)

  // Logic chuyển đổi biểu đồ và bộ dữ liệu
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentChartTypeIndex(prevIndex => {
        const nextTypeIndex = (prevIndex + 1) % chartTypes.length
        // Chỉ chuyển dataset khi hoàn thành 1 vòng lặp qua các loại biểu đồ
        if (nextTypeIndex === 0) {
          setCurrentDataSetIndex(
            prevDataIndex => (prevDataIndex + 1) % sampleDataSets.length
          )
        }
        return nextTypeIndex
      })
    }, intervalDuration)

    return () => clearInterval(intervalId)
  }, [intervalDuration])

  // Dữ liệu và loại biểu đồ hiện tại được tính toán lại khi index thay đổi
  const chartData = useMemo(
    () => sampleDataSets[currentDataSetIndex],
    [currentDataSetIndex]
  )
  const chartType = useMemo(
    () => chartTypes[currentChartTypeIndex],
    [currentChartTypeIndex]
  )

  return { chartData, chartType, currentDataSetIndex }
}