import React from 'react'
import {
  Users,
  Server,
  BrainCircuit,
  Share2,
  Database,
  MemoryStick,
  ArrowDown,
  ArrowUp,
  Globe,
  DatabaseZap,
  CalendarDays,
  Search,
  MousePointerClick,
  ExternalLink,
  BookmarkPlus,
  FileOutput,
  Cpu,
  // --- Các icon MỚI cho yêu cầu ---
  BookOpen, // Xem chi tiết
  BookmarkCheck, // Quản lí danh sách
  MapPin, // Mở bản đồ
  Compass, // Điều hướng trang
  MoreHorizontal, // Icon ba chấm
  Layers // Icon mới cho Lớp Dữ liệu
} from 'lucide-react'

// Component phụ: Khối chức năng chính (ĐÃ CẬP NHẬT)
const ArchBlock: React.FC<{
  title: string
  icon: React.ReactNode
  color: string
  children?: React.ReactNode
  className?: string
}> = ({ title, icon, color, children, className }) => (
  <div
    // Đã xóa bg-white để có thể nhận màu nền từ prop className
    className={`border-l-8 ${color} flex w-full flex-row items-center gap-4 rounded-xl p-2 shadow-lg ${className}`}
  >
    {/* Phần bên trái: Icon */}
    <div
      className={`flex-shrink-0 rounded-full bg-opacity-10 p-2 ${color
        .replace('border', 'bg')
        .replace('-500', '-100')
        .replace('-600', '-100')
        .replace('-700', '-100')}`}
    >
      {icon}
    </div>

    {/* Phần bên phải: Title và Children */}
    <div className='flex flex-col text-left'>
      <h3 className='text-xl font-bold'>{title}</h3>
      {children && <div className=' w-full  text-base'>{children}</div>}
    </div>
  </div>
)

// Component phụ: Mũi tên luồng (Giữ nguyên)
const FlowArrow: React.FC<{ label?: string; direction?: 'up' | 'down' }> = ({
  label,
  direction = 'down'
}) => (
  <div className='my-2 flex flex-row items-center justify-center gap-2 md:my-4'>
    {direction === 'down' ? (
      <ArrowDown className='' size={32} />
    ) : (
      <ArrowUp className='text-sky-500' size={32} />
    )}
    {label && (
      <span
        className={`text-md rounded-full px-2 py-1 font-semibold ${
          direction === 'down'
            ? 'bg-blue-100 text-blue-600'
            : 'bg-sky-100 text-sky-700'
        }`}
      >
        {label}
      </span>
    )}
  </div>
)

// Component phụ: Khối Chatbot Con (Sub-Agent) (ĐÃ CẬP NHẬT)
const SubAgentBlock: React.FC<{
  title: string
  icon: React.ReactNode
  color: string
  tools: { icon: React.ReactNode; label: string }[]
  hasBorder?: boolean // Prop mới để điều khiển viền
}> = ({ title, icon, color, tools, hasBorder = false }) => (
  <div
    // Thêm logic để chỉ hiện viền khi hasBorder={true}
    className={`flex h-full flex-col rounded-lg bg-white p-3 shadow-md ${
      hasBorder ? `border-2 ${color.replace('text', 'border')}` : ''
    }`}
  >
    <div className='mb-1 flex items-center space-x-2'>
      <div className={`rounded-full p-1 ${color.replace('text', 'bg')}-100`}>
        {icon}
      </div>
      <h4 className={`font-bold ${color}`}>{title}</h4>
    </div>
    <div className='mt-auto '>
      <p className='text-md text-center font-semibold '>Bộ công cụ:</p>
      {tools.map((tool, index) => (
        <div
          key={index}
          className='flex items-center space-x-2 rounded-md bg-white px-2 text-left'
        >
          {tool.icon}
          <span className='text-md font-medium text-gray-700'>
            {tool.label}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// Component phụ MỚI: Khối Agent Placeholder
const AgentPlaceholder: React.FC = () => (
  <div className='flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-3 shadow-inner'>
    <MoreHorizontal className='text-gray-400' size={48} />
    <p className='mt-2 text-sm font-medium text-gray-600'>Các Agent khác</p>
  </div>
)

// ========================================================================= //
// ========= COMPONENT CHÍNH CỦA SƠ ĐỒ - ĐÃ CẬP NHẬT THEO YÊU CẦU ========= //
// ========================================================================= //
const CompactChatbotDiagram: React.FC = () => {
  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col items-center bg-white p-6 font-sans lg:max-w-5xl'>
      <div className='flex w-full flex-col'>
        {/* ---- HÀNG TRÊN: LUỒNG YÊU CẦU & PHẢN HỒI ---- */}
        <div className='grid grid-cols-2 gap-x-4 md:gap-x-8'>
          {/* CỘT TRÁI: LUỒNG YÊU CẦU (ĐI XUỐNG) */}
          <div className='flex flex-col'>
            <h2 className='mb-2 text-center text-xl font-bold text-blue-600'>
              Luồng Yêu cầu
            </h2>
            <ArchBlock
              title='Người dùng'
              icon={<Users size={32} className='text-blue-500' />}
              color='border-blue-500'
              className='bg-blue-50'
            >
              <p>Gửi yêu cầu qua giao diện chat.</p>
            </ArchBlock>
            <FlowArrow label='HTTP Request' />
            <ArchBlock
              title='Backend Server'
              icon={<Server size={32} className='text-gray-600' />}
              color='border-gray-600'
              className='bg-gray-100'
            >
              <p>Xác thực & chuyển tiếp yêu cầu.</p>
            </ArchBlock>
            <FlowArrow label='Chuyển đến Host' />
            <ArchBlock
              title='Host Agent (Điều phối)'
              icon={<Share2 size={32} className='text-green-600' />}
              color='border-green-600'
              className='bg-green-50'
            >
              <p>Phân tích & chọn Agent phù hợp.</p>
            </ArchBlock>
          </div>

          {/* CỘT PHẢI: LUỒNG PHẢN HỒI (ĐI LÊN) */}
          <div className='flex flex-col justify-end'>
            <h2 className='mb-2 text-center text-xl font-bold text-sky-600'>
              Luồng Phản hồi
            </h2>
            <ArchBlock
              title='Người dùng'
              icon={<Users size={32} className='text-blue-500' />}
              color='border-blue-500'
              className='bg-blue-50'
            >
              <p>Nhận kết quả và hiển thị trên giao diện.</p>
            </ArchBlock>
            <FlowArrow label='HTTP Response' direction='up' />
            <ArchBlock
              title='Backend Server'
              icon={<Server size={32} className='text-gray-600' />}
              color='border-gray-600'
              className='bg-gray-100'
            >
              <p>Định dạng & gửi phản hồi về client.</p>
            </ArchBlock>
            <FlowArrow label='Nhận kết quả' direction='up' />
            <ArchBlock
              title='Host Agent (Tổng hợp)'
              icon={<FileOutput size={32} className='text-green-600' />}
              color='border-green-600'
              className='bg-green-50'
            >
              <p>Tổng hợp kết quả & tạo phản hồi cuối cùng.</p>
            </ArchBlock>
          </div>
        </div>

        {/* ---- MŨI TÊN CHÍNH TRUNG TÂM ---- */}
        <div className='my-4 flex items-center justify-between px-44'>
          <ArrowDown className=' text-gray-500' size={40} />
          <Cpu size={48} className='text-orange-500' />
          <ArrowUp className='text-sky-500' size={40} />
        </div>

        {/* ====================================================================== */}
        {/* ======================= BẮT ĐẦU PHẦN THAY ĐỔI ======================= */}
        {/* ====================================================================== */}

        {/* ---- LÕI XỬ LÝ AI ---- */}
        <div className='w-full rounded-2xl border-2 border-dashed border-orange-500 bg-orange-50/50 p-4'>
          <h3 className='mb-4 text-center text-xl font-bold text-orange-600'>
            Lõi Xử lý AI
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <SubAgentBlock
              title='Agent Hội nghị'
              icon={<CalendarDays size={24} className='text-cyan-600' />}
              color='text-cyan-600'
              tools={[
                {
                  icon: <Search size={16} />,
                  label: 'Tìm thông tin hội nghị'
                },
                {
                  icon: <BookmarkPlus size={16} />,
                  label: 'Theo dõi hội nghị'
                },
                {
                  icon: <BookmarkCheck size={16} />,
                  label: 'Quản lý danh sách theo dõi'
                }
              ]}
            />
            <SubAgentBlock
              title='Agent Điều hướng'
              icon={<MousePointerClick size={24} className='text-indigo-600' />}
              color='text-indigo-600'
              tools={[
                {
                  icon: <ExternalLink size={16} />,
                  label: 'Mở trang chính thức'
                },
                { icon: <MapPin size={16} />, label: 'Mở bản đồ địa điểm' },
                { icon: <Compass size={16} />, label: 'Điều hướng trang khác' }
              ]}
            />
            <AgentPlaceholder />
          </div>
        </div>

        {/* ---- MŨI TÊN KẾT NỐI AI -> DATA ---- */}
        <div className=' my-4 flex flex-row items-center justify-center gap-2'>
          <ArrowDown className='text-gray-500' size={32} />
          <ArrowUp className='text-sky-500' size={32} />
          <span className='text-md rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-600'>
            Thực thi & Truy xuất dữ liệu
          </span>
        </div>

        {/* ---- LỚP DỮ LIỆU ---- */}
        <div className='w-full rounded-2xl border-2 border-dashed border-purple-500 bg-purple-50/50 p-4'>
          <h3 className='mb-4 flex items-center justify-center gap-2 text-center text-xl font-bold text-purple-600'>
            <Layers size={24} /> Lớp Dữ liệu
          </h3>
          <div className='flex w-full flex-col gap-6 md:flex-row'>
            <ArchBlock
              title='SQL Database (PostgreSQL)'
              icon={<Database size={32} className='text-blue-700' />}
              color='border-blue-700'
              className='bg-blue-50'
            >
              <p className='font-semibold'>Dữ liệu hội nghị, người dùng...</p>
            </ArchBlock>
            <ArchBlock
              title='NoSQL Database (MongoDB)'
              icon={<MemoryStick size={32} className='text-teal-500' />}
              color='border-teal-500'
              className='bg-teal-50'
            >
              <p className='font-semibold'>Lịch sử & Ngữ cảnh hội thoại</p>
            </ArchBlock>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* ======================== KẾT THÚC PHẦN THAY ĐỔI ======================= */}
        {/* ====================================================================== */}
      </div>
    </div>
  )
}

export default CompactChatbotDiagram
