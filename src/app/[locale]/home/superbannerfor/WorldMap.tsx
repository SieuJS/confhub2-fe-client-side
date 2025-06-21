// src/components/SuperBannerFor/WorldMap.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { useFlightAnimation } from '@/src/hooks/home/useFlightAnimation'
import { WorldMapProps, countriesData } from '@/src/hooks/home/constants'

const goldColor = '#FFD700'

const WorldMap: React.FC<WorldMapProps> = ({
  viewBox = '0 0 1009.6727 665.96301',
  flights = [],
  coordinates = {},
  className,
  ...restProps
}) => {
  // Gọi custom hook để lấy dữ liệu đã xử lý
  const processedFlights = useFlightAnimation({ flights, coordinates })

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox={viewBox}
      className={className}
      {...restProps}
    >
      {/* Layer 1: Vẽ các quốc gia (không đổi) */}
      <g id='countries'>
        {countriesData.map(country => (
          <path
            key={country.id}
            id={country.id}
            d={country.d}
            style={{
              fill: 'var(--background-secondary)',
              stroke: 'rgba(255,255,255,0.1)',
              strokeWidth: 0.5
            }}
          />
        ))}
      </g>

      {/* Layer 2: Vẽ hiệu ứng chuyến bay (đã được đơn giản hóa) */}
      <g id='flight-effects' strokeLinecap='round'>
        {processedFlights.map(flight => (
          <React.Fragment key={flight.key}>
            {/* 1. ĐƯỜNG BAY HOẠT HÌNH */}
            <motion.path
              d={flight.pathData}
              fill='none'
              stroke={goldColor}
              strokeWidth='1.5'
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 0],
                pathOffset: [0, 0, 0, 1],
                opacity: [0, 1, 1, 0]
              }}
              transition={flight.pathTransition}
            />
            {/* 2. HIỆU ỨNG SÓNG LAN TỎA TẠI ĐIỂM ĐẾN */}
            <motion.circle
              cx={flight.endCoords.x}
              cy={flight.endCoords.y}
              r={0}
              fill='none'
              stroke={goldColor}
              strokeWidth='1'
              initial={{ opacity: 0 }}
              animate={{ r: [0, 12], opacity: [0, 0.7, 0] }}
              transition={flight.ripple1Transition}
            />
            <motion.circle
              cx={flight.endCoords.x}
              cy={flight.endCoords.y}
              r={0}
              fill='none'
              stroke={goldColor}
              strokeWidth='0.8'
              initial={{ opacity: 0 }}
              animate={{ r: [0, 15], opacity: [0, 0.5, 0] }}
              transition={flight.ripple2Transition}
            />
          </React.Fragment>
        ))}
      </g>
    </svg>
  )
}

export default WorldMap