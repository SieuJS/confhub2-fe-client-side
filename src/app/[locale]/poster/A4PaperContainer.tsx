import React from 'react'

interface A4PaperContainerProps {
  children: React.ReactNode
  title: string
}

const A4PaperContainer: React.FC<A4PaperContainerProps> = ({
  children,
  title
}) => {
  return (
    <div className='bg-gray-200 p-8 font-sans'>
      {/* Container mô phỏng giấy A4 */}
      <div
        className='mx-auto max-w-4xl bg-white p-10 shadow-2xl'
        style={{ aspectRatio: '210 / 297' }}
      >
        <h2 className='mb-8 border-b pb-4 text-center text-2xl font-bold text-gray-800'>
          {title}
        </h2>
        <div className='flex-grow'>{children}</div>
      </div>
    </div>
  )
}

export default A4PaperContainer
