// src/components/SuperBannerFor/hooks/useFlightAnimation.ts
import { useMemo } from 'react'
import { createArcPath } from './svgUtils'
import {
  Flight,
  drawDuration,
  waitDuration,
  fadeOutDelay,
  rippleDelayBetween,
  rippleDuration,
  baseInitialDelay,
  delayBetweenOrders,
  totalPathCycleDuration
} from '@/src/hooks/home/constants'
import { Transition } from 'framer-motion'

// Định nghĩa kiểu dữ liệu trả về, chứa mọi thứ cần thiết để render
interface ProcessedFlight {
  key: string
  pathData: string
  endCoords: { x: number; y: number }
  pathTransition: Transition
  ripple1Transition: Transition
  ripple2Transition: Transition
}

interface UseFlightAnimationProps {
  flights: Flight[]
  coordinates: { [key: string]: { x: number; y: number } }
}

export const useFlightAnimation = ({
  flights,
  coordinates
}: UseFlightAnimationProps): ProcessedFlight[] => {
  // Sử dụng useMemo để chỉ tính toán lại khi flights hoặc coordinates thay đổi
  const processedFlights = useMemo(() => {
    if (!flights.length) return []

    // --- BƯỚC 1: Sắp xếp và tính toán các giá trị dùng chung ---
    const sortedFlights = [...flights].sort((a, b) => a.order - b.order)
    const minOrder = sortedFlights[0].order

    // Các mốc thời gian (dưới dạng phần trăm) cho keyframes
    const drawEnd = drawDuration / totalPathCycleDuration
    const waitEnd = (drawDuration + waitDuration) / totalPathCycleDuration
    const shrinkFadeStart =
      (drawDuration + waitDuration + fadeOutDelay) / totalPathCycleDuration
    const shrinkEnd = 1

    // Mảng 'times' cho transition của đường bay
    const pathTimes = [0, drawEnd, Math.min(shrinkFadeStart, shrinkEnd - 0.001), shrinkEnd].sort((a, b) => a - b)

    // --- BƯỚC 2: Xử lý từng chuyến bay để tạo props cho animation ---
    return sortedFlights
      .map((flight, index) => {
        const startCoords = coordinates[flight.from]
        const endCoords = coordinates[flight.to]

        // Kiểm tra tọa độ hợp lệ
        if (
          !startCoords || typeof startCoords.x !== 'number' || typeof startCoords.y !== 'number' ||
          !endCoords || typeof endCoords.x !== 'number' || typeof endCoords.y !== 'number'
        ) {
          console.warn(`Invalid coordinates for flight: ${flight.from} -> ${flight.to}`)
          return null
        }

        // Tạo path SVG
        const pathData = createArcPath(startCoords.x, startCoords.y, endCoords.x, endCoords.y)

        // Tính toán initial delay dựa trên 'order'
        const orderDifference = flight.order - minOrder
        const initialDelay = baseInitialDelay + orderDifference * delayBetweenOrders

        // Tạo các đối tượng transition cho framer-motion
        const pathTransition: Transition = {
          delay: initialDelay,
          duration: totalPathCycleDuration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
          times: pathTimes
        }

        const rippleBaseTransition = {
            duration: rippleDuration,
            ease: 'easeOut' as const,
            repeat: Infinity,
            repeatType: 'loop' as const,
            repeatDelay: totalPathCycleDuration - rippleDuration,
        }

        const ripple1Transition: Transition = {
            ...rippleBaseTransition,
            delay: initialDelay + drawDuration,
        }

        const ripple2Transition: Transition = {
            ...rippleBaseTransition,
            delay: initialDelay + drawDuration + rippleDelayBetween,
        }

        // Trả về một object chứa tất cả dữ liệu đã được xử lý
        return {
          key: `${flight.from}-${flight.to}-${flight.order}-${index}`,
          pathData,
          endCoords,
          pathTransition,
          ripple1Transition,
          ripple2Transition
        }
      })
      .filter((flight): flight is ProcessedFlight => flight !== null) // Lọc bỏ các chuyến bay không hợp lệ
  }, [flights, coordinates])

  return processedFlights
}