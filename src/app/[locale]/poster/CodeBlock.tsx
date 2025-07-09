import React from 'react'

interface CodeBlockProps {
  title: string
  children: React.ReactNode
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, children }) => {
  return (
    <div className='my-2 w-full overflow-hidden rounded-lg bg-[#2d3748] shadow-xl'>
      {/* Header with macOS-like dots and title */}
      <div className='flex items-center border-b border-gray-600 bg-gray-700 px-4 py-2'>
        <div className='flex space-x-1.5'>
          <div className='h-3 w-3 rounded-full bg-red-500'></div>
          <div className='h-3 w-3 rounded-full bg-yellow-500'></div>
          <div className='h-3 w-3 rounded-full bg-green-500'></div>
        </div>
        <span className='flex-grow select-none text-center font-mono text-xs text-gray-400'>
          {title}
        </span>
      </div>
      {/* Code Area */}
      <div className='p-4 text-left text-sm'>
        <pre>
          <code className='whitespace-pre-wrap break-words font-mono text-white'>
            {children}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
