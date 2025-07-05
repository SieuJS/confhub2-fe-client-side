'use client'

import { appConfig } from '@/src/middleware'
import React, { useEffect, useRef } from 'react'

interface MapPosterProps {
  location: string
}

const MapPoster: React.FC<MapPosterProps> = ({ location }) => {
  const MapPosterRef = useRef<HTMLDivElement>(null)
  const API_KEY = appConfig.NEXT_PUBLIC_GOOGLE_MAP_API_KEY

  useEffect(() => {
    if (!location || !MapPosterRef.current) return

    const encodedLocation = encodeURIComponent(location)
    const iframe = document.createElement('iframe')
    iframe.width = '100%'
    // --- THAY ĐỔI Ở ĐÂY ---
    // Thay đổi chiều cao thành 100% để lấp đầy thẻ chứa nó
    iframe.height = '100%'
    // --- KẾT THÚC THAY ĐỔI ---
    iframe.style.border = '0'
    iframe.loading = 'lazy'
    iframe.allowFullscreen = true
    iframe.referrerPolicy = 'no-referrer-when-downgrade'
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodedLocation}`

    const currentMapPosterRef = MapPosterRef.current
    currentMapPosterRef.innerHTML = ''
    currentMapPosterRef.appendChild(iframe)

    return () => {
      if (currentMapPosterRef && currentMapPosterRef.contains(iframe)) {
        currentMapPosterRef.removeChild(iframe)
      }
    }
  }, [location, API_KEY]) // Thêm API_KEY vào dependency array để đảm bảo an toàn

  return (
    // Sửa đổi các thẻ div này để chúng chiếm toàn bộ không gian có sẵn
    <div ref={MapPosterRef} className='h-full w-full' />
  )
}

export default MapPoster
