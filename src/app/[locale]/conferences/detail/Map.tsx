// Map.tsx
'use client'

import React, { useEffect, useRef } from 'react'

// WARNING: Do not embed API keys directly in code or publish in source code without restricting API keys to be used by only the IP addresses, referrer URLs, and mobile apps that need them.
const API_KEY = 'AIzaSyBg-9FAVGjxNmG_8UkmssL4MJ34iOSyTCE' // Thay thế bằng API Key của bạn

interface MapProps {
  location: string
}

const Map: React.FC<MapProps> = ({ location }) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!location || !mapRef.current) return

    const encodedLocation = encodeURIComponent(location)
    const iframe = document.createElement('iframe')
    iframe.width = '100%'
    iframe.height = '450'
    iframe.style.border = '0'
    iframe.loading = 'lazy'
    iframe.allowFullscreen = true
    iframe.referrerPolicy = 'no-referrer-when-downgrade'
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodedLocation}`

    mapRef.current.innerHTML = '' // Clear previous content
    mapRef.current.appendChild(iframe)
  }, [location])

  return (
    <div className=''>
      <div ref={mapRef} className='map-container' />
    </div>
  )
}

export default Map
