// ./components/SystemArchitectureDiagram.tsx

import React from 'react'
// Import file SVG như một component React
import SystemDiagram from '../../../../public/system-architecture.svg'

const SystemArchitectureDiagram = () => {
  return (
    <div
      className='flex h-full w-full flex-col items-center justify-center rounded-[31px] bg-gray-100 p-8'
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <SystemDiagram className='h-full w-full' />
    </div>
  )
}

export default SystemArchitectureDiagram
