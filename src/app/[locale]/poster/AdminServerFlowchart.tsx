// src/components/AdminServerFlowchart.tsx
import React from 'react'
import {
  Users,
  Search,
  HardDrive,
  Code,
  FileText,
  List,
  Database,
  ArrowRight // Import icon mũi tên từ Lucide
} from 'lucide-react' // Import các icon từ lucide-react

const AdminServerFlowchart: React.FC = () => {
  const steps = [
    {
      actor: 'Admin',
      icon: <Users size={144} strokeWidth={1.5} />, // Sử dụng icon Users từ Lucide, điều chỉnh kích thước và độ dày nét
      title: '1. Tiếp nhận yêu cầu',
      description: 'Hệ thống tiếp nhận danh sách hội nghị.',
      bgColor: 'bg-blue-500', // Màu nền đậm hơn cho icon
      textColor: 'text-white' // Màu chữ trắng cho icon
    },
    {
      actor: 'Server',
      icon: <Search size={144} strokeWidth={1.5} />, // Sử dụng icon Search từ Lucide
      title: '2. Google Search API',
      description: 'Tìm kiếm các link liên quan.',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    },
    {
      actor: 'Server',
      icon: <HardDrive size={144} strokeWidth={1.5} />, // Sử dụng icon HardDrive từ Lucide (tương tự máy tính)
      title: '3. Playwright cào dữ liệu',
      description: 'Truy cập và thu thập dữ liệu thô từ các link.',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white'
    },
    {
      actor: 'Server',
      icon: <Code size={144} strokeWidth={1.5} />, // Sử dụng icon Code từ Lucide (tương tự terminal/code)
      title: '4. LLM xác định link chính',
      description: 'Gọi API (LLM) để xác định link chính.',
      bgColor: 'bg-indigo-500',
      textColor: 'text-white'
    },
    {
      actor: 'Server',
      icon: <FileText size={144} strokeWidth={1.5} />, // Sử dụng icon FileText từ Lucide (tương tự tài liệu)
      title: '5. LLM rút trích thông tin',
      description: 'Gọi API rút trích các thông tin quan trọng.',
      bgColor: 'bg-purple-500',
      textColor: 'text-white'
    },
    {
      actor: 'Server',
      icon: <List size={144} strokeWidth={1.5} />, // Sử dụng icon List từ Lucide (tương tự danh sách/tổ chức)
      title: '6. Tổng hợp & Xử lý ',
      description: 'Tổng hợp kết quả, kiểm tra và làm sạch dữ liệu.',
      bgColor: 'bg-teal-500',
      textColor: 'text-white'
    },
    {
      actor: 'Server',
      icon: <Database size={144} strokeWidth={1.5} />, // Sử dụng icon Database từ Lucide
      title: '7. Lưu Database',
      description: 'Lưu thông tin vào cơ sở dữ liệu.',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    }
  ]

  return (
    <div className='w-full overflow-x-auto bg-white p-10 font-sans'>
      <div
        className='relative flex items-center'
        // Đặt chiều cao đủ lớn và chiều rộng tối thiểu để chứa tất cả các bước
        style={{ minWidth: '4000px', height: '1600px' }}
      >
        {/* Trục thời gian chính */}
        <div className='absolute left-0 top-1/2 z-0 h-4 w-full -translate-y-1/2 bg-gray-700'></div>{' '}
        {/* Tăng độ dày và đổi màu đậm hơn */}
        {/* Mũi tên ở cuối trục */}
        <div className='absolute right-0 top-1/2 z-0 h-0 w-0 -translate-y-1/2 border-y-[1.5rem] border-y-transparent border-l-[2.5rem] border-l-gray-700'></div>{' '}
        {/* Tăng kích thước và đổi màu đậm hơn */}
        {/* Wrapper cho các bước */}
        <div className='relative z-10 flex w-full justify-around'>
          {steps.map((step, index) => (
            <div
              key={index}
              // Container cho mỗi bước, dùng để định vị các thành phần con
              className='relative flex h-24 flex-col items-center'
            >
              {/* Điểm chấm trên trục thời gian */}
              <div className='absolute top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-6 border-gray-700 bg-white'></div>{' '}
              {/* Tăng độ dày viền và đổi màu đậm hơn */}
              {/* Đường nối dọc */}
              <div
                className={`absolute w-2 bg-gray-700 ${
                  index % 2 === 0 ? 'bottom-full h-16' : 'top-full h-16'
                }`}
              ></div>{' '}
              {/* Tăng độ dày và đổi màu đậm hơn */}
              {/* Nội dung của bước (icon và text) */}
              <div
                className={`absolute w-max ${
                  index % 2 === 0 ? 'bottom-full mb-24' : 'top-full mt-24'
                }`}
              >
                <div className='flex flex-col items-center gap-6'>
                  {/* Icon hình tròn */}
                  <div
                    className={`flex h-72 w-72 items-center justify-center rounded-full ${step.bgColor}`}
                  >
                    <div className={`${step.textColor}`}>{step.icon}</div>
                  </div>
                  {/* Tên bước - Giữ nguyên kích thước chữ theo yêu cầu */}
                  <h4 className='w-[60rem] text-center text-9xl font-bold text-gray-700'>
                    {step.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminServerFlowchart