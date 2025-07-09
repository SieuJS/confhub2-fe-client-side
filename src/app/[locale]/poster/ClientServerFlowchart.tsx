// src/components/ClientServerFlowchart.tsx
import React from 'react'

// Component Icon Mũi tên đã được cập nhật thành mũi tên chỉ xuống
const ArrowIcon = () => (
  <svg
    // Giảm kích thước một chút cho phù hợp với layout cột
    className='h-40 w-40 flex-shrink-0 text-gray-800'
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}
  >
    {/* Thay đổi path data để vẽ mũi tên xuống */}
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19 14l-7 7m0 0l-7-7m7 7V3'
    />
  </svg>
)

// Component cho một bước trong sơ đồ
interface FlowStepProps {
  icon: React.ReactNode
  title: string
  description: string
  bgColor: string
  textColor: string
}

const FlowStep: React.FC<FlowStepProps> = ({
  icon,
  title,
  description,
  bgColor,
  textColor
}) => (
  <div
    className={`flex w-full flex-row items-center justify-start gap-10 rounded-3xl p-8 shadow-lg ${bgColor}`}
  >
    <div
      className={`flex-shrink-0 rounded-full p-10 ${textColor} bg-white bg-opacity-50`}
    >
      {icon}
    </div>

    <div className='flex flex-col items-start'>
      <h4 className={`text-left text-9xl font-bold ${textColor}`}>{title}</h4>
      <p className={`mt-2 text-left text-8xl ${textColor} opacity-90`}>
        {description}
      </p>
    </div>
  </div>
)

const ClientServerFlowchart: React.FC = () => {
  const steps = [
    {
      actor: 'Client',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-40 w-40'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
          />
        </svg>
      ),
      title: 'Tiếp nhận yêu cầu',
      description: 'Client nhập tên hội nghị và tên viết tắt vào hệ thống.',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    {
      actor: 'Server',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-40 w-40'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      ),
      title: 'Google Search',
      description: 'Sử dụng tên được cung cấp để tìm kiếm các link liên quan.',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    {
      actor: 'Server',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-40 w-40'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
          />
        </svg>
      ),
      title: 'Cào dữ liệu',
      description:
        'Dùng Playwright để truy cập và cào dữ liệu thô từ các link tìm được.',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    }
    // {
    //   actor: 'Server',
    //   icon: (
    //     <svg
    //       xmlns='http://www.w3.org/2000/svg'
    //       className='h-40 w-40'
    //       fill='none'
    //       viewBox='0 0 24 24'
    //       stroke='currentColor'
    //     >
    //       <path
    //         strokeLinecap='round'
    //         strokeLinejoin='round'
    //         strokeWidth={2}
    //         d='M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    //       />
    //     </svg>
    //   ),
    //   title: 'Xác định link chính',
    //   description: 'Gọi API (LLM) để phân tích và xác định link chính.',
    //   bgColor: 'bg-indigo-100',
    //   textColor: 'text-indigo-800'
    // },
    // {
    //   actor: 'Server',
    //   icon: (
    //     <svg
    //       xmlns='http://www.w3.org/2000/svg'
    //       className='h-40 w-40'
    //       fill='none'
    //       viewBox='0 0 24 24'
    //       stroke='currentColor'
    //     >
    //       <path
    //         strokeLinecap='round'
    //         strokeLinejoin='round'
    //         strokeWidth={2}
    //         d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    //       />
    //     </svg>
    //   ),
    //   title: 'Trích xuất thông tin',
    //   description: 'Trích xuất các thông tin quan trọng (ngày, địa điểm,...).',
    //   bgColor: 'bg-purple-100',
    //   textColor: 'text-purple-800'
    // },
    // {
    //   actor: 'Server',
    //   icon: (
    //     <svg
    //       xmlns='http://www.w3.org/2000/svg'
    //       className='h-40 w-40'
    //       fill='none'
    //       viewBox='0 0 24 24'
    //       stroke='currentColor'
    //     >
    //       <path
    //         strokeLinecap='round'
    //         strokeLinejoin='round'
    //         strokeWidth={2}
    //         d='M4 6h16M4 12h16m-7 6h7'
    //       />
    //     </svg>
    //   ),
    //   title: 'Hợp nhất & Làm sạch',
    //   description: 'Hợp nhất kết quả, kiểm tra và làm sạch dữ liệu.',
    //   bgColor: 'bg-teal-100',
    //   textColor: 'text-teal-800'
    // },
    // {
    //   actor: 'Server',
    //   icon: (
    //     <svg
    //       xmlns='http://www.w3.org/2000/svg'
    //       className='h-40 w-40'
    //       fill='none'
    //       viewBox='0 0 24 24'
    //       stroke='currentColor'
    //     >
    //       <path
    //         strokeLinecap='round'
    //         strokeLinejoin='round'
    //         strokeWidth={2}
    //         d='M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7a8 8 0 0116 0'
    //       />
    //     </svg>
    //   ),
    //   title: 'Lưu Database',
    //   description: 'Lưu thông tin đã được chuẩn hóa vào cơ sở dữ liệu.',
    //   bgColor: 'bg-green-100',
    //   textColor: 'text-green-800'
    // }
  ]

  return (
    <div className='flex w-full flex-col items-center justify-center rounded-2xl bg-white p-10 font-sans'>
      <h3 className='mb-12 text-center  text-8xl font-bold text-gray-700'>
        Sơ đồ tương tác Client - Server (Thu thập dữ liệu)
      </h3>
      {/* Thay đổi layout thành cột và dùng gap-y */}
      <div className='flex flex-col items-center justify-center gap-y-8'>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <FlowStep
              icon={step.icon}
              title={step.title}
              description={step.description}
              bgColor={step.bgColor}
              textColor={step.textColor}
            />
            {/* Mũi tên sẽ hiển thị giữa các step */}
            {index < steps.length - 1 && <ArrowIcon />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default ClientServerFlowchart
