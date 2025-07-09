import React from 'react'

// Icons SVG từ Heroicons (https://heroicons.com/)
const MagnifyingGlassIcon = () => (
  <svg
    className='h-16 w-16 text-blue-500'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    ></path>
  </svg>
)

const CogIcon = () => (
  <svg
    className='h-16 w-16 text-green-500'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    ></path>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    ></path>
  </svg>
)

const DocumentTextIcon = () => (
  <svg
    className='h-16 w-16 text-purple-500'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    ></path>
  </svg>
)

const ArrowRight = () => (
  <svg
    className='mx-4 hidden h-12 w-12 text-gray-400 md:block'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      d='M13 7l5 5m0 0l-5 5m5-5H6'
    ></path>
  </svg>
)

const AgentCard = ({
  icon,
  title,
  description,
  input,
  output
}: {
  icon: React.ReactNode
  title: string
  description: string
  input: string
  output: string
}) => (
  <div className='flex min-w-[200px] flex-1 flex-col items-center rounded-xl border bg-white p-4 shadow-lg'>
    {icon}
    <h4 className='mt-2 text-center text-lg font-bold text-gray-800'>
      {title}
    </h4>
    <p className='mb-3 text-center text-xs text-gray-500'>{description}</p>
    <div className='w-full space-y-1 text-left text-xs'>
      <p>
        <span className='font-bold'>Đầu vào:</span> {input}
      </p>
      <p>
        <span className='font-bold'>Đầu ra:</span> {output}
      </p>
    </div>
  </div>
)

const MultiAgentPipelineDiagram: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0'>
      <AgentCard
        icon={<MagnifyingGlassIcon />}
        title='Tác nhân Tìm kiếm'
        description='Tìm nguồn tin cậy'
        input='Tên hội nghị'
        output='Các URL tin cậy'
      />
      <ArrowRight />
      <AgentCard
        icon={<CogIcon />}
        title='Tác nhân Trích xuất'
        description='Điền vào biểu mẫu'
        input='Nội dung trang web'
        output='Dữ liệu JSON có cấu trúc'
      />
      <ArrowRight />
      <AgentCard
        icon={<DocumentTextIcon />}
        title='Tác nhân Biên tập'
        description='Viết và định dạng tài liệu'
        input='Nội dung trang web'
        output='Tóm tắt & CFP Markdown'
      />
    </div>
  )
}

export default MultiAgentPipelineDiagram
