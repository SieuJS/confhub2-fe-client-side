import React from 'react'
import {
  Users,
  Server,
  Share2,
  Database,
  MemoryStick,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Search,
  MousePointerClick,
  ExternalLink,
  BookmarkPlus,
  FileOutput,
  Cpu,
  BookmarkCheck,
  MapPin,
  Compass,
  MoreHorizontal,
  Layers
} from 'lucide-react'

// ========================================================================= //
// ========= CÁC COMPONENT PHỤ ĐÃ ĐƯỢC TĂNG KÍCH THƯỚC CHO POSTER ========= //
// ========================================================================= //

// --- COMPONENT ArchBlock ĐÃ ĐƯỢC CẬP NHẬT ---
const ArchBlock: React.FC<{
  title: string
  icon: React.ReactNode
  color: string
  children?: React.ReactNode
  className?: string
}> = ({ title, icon, color, children, className }) => (
  <div
    // ĐÃ BỎ class "w-full" ở đây để có thể tùy chỉnh chiều rộng từ bên ngoài
    // THAY ĐỔI: p-6 -> p-10 để tăng khoảng đệm bên trong, phù hợp với font chữ lớn
    className={`border-l-[12px] ${color} flex flex-row items-center gap-8 rounded-2xl p-10 shadow-xl ${className}`}
  >
    <div
      // THAY ĐỔI: p-4 -> p-6 để icon có nhiều không gian hơn
      className={`flex-shrink-0 rounded-full p-6 ${color
        .replace('border', 'bg')
        .replace('-500', '-100')
        .replace('-600', '-100')
        .replace('-700', '-100')}`}
    >
      {icon}
    </div>
    <div className='flex flex-col text-left'>
      <h3 className='text-9xl font-bold'>{title}</h3>
      {children && <div className='mt-1 w-full text-3xl'>{children}</div>}
    </div>
  </div>
)

// --- COMPONENT FlowArrow ĐÃ ĐƯỢC CẬP NHẬT ---
// Label sẽ được hiển thị bên ngoài mũi tên
const FlowArrow: React.FC<{ label?: string; direction?: 'up' | 'down' }> = ({
  label,
  direction = 'down'
}) => {
  const labelSpan = label && (
    <span
      className={`rounded-full px-6 py-3 text-8xl font-semibold ${
        direction === 'down'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-sky-100 text-sky-700'
      }`}
    >
      {label}
    </span>
  )

  return (
    // THAY ĐỔI: my-6 -> my-8 để tăng khoảng cách dọc giữa các khối
    <div className='my-8 flex flex-row items-center justify-center gap-4'>
      {/* Nếu là mũi tên đi xuống (bên trái), hiển thị label trước */}
      {direction === 'down' && labelSpan}

      {direction === 'down' ? (
        <ArrowDown size={120} strokeWidth={2.5} />
      ) : (
        <ArrowUp className='text-sky-500' size={120} strokeWidth={2.5} />
      )}

      {/* Nếu là mũi tên đi lên (bên phải), hiển thị label sau */}
      {direction === 'up' && labelSpan}
    </div>
  )
}

const SubAgentBlock: React.FC<{
  title: string
  icon: React.ReactNode
  color: string
  tools: { icon: React.ReactNode; label: string }[]
}> = ({ title, icon, color, tools }) => (
  // THAY ĐỔI: p-5 -> p-8 để tăng khoảng đệm bên trong
  <div className={`flex h-full flex-col rounded-2xl bg-white p-8 shadow-lg`}>
    {/* THAY ĐỔI: mb-3 -> mb-6 để tạo thêm khoảng cách dưới tiêu đề */}
    <div className='mb-6 flex items-center space-x-3'>
      <div className={`rounded-full p-2 ${color.replace('text', 'bg')}-100`}>
        {icon}
      </div>
      <h4 className={`text-8xl font-bold ${color}`}>{title}</h4>
    </div>
    {/* THAY ĐỔI: gap-3 -> gap-4 */}
    <div className='mt-auto flex flex-col gap-4 pt-3'>
      <p className=' text-8xl font-semibold text-gray-600'>Bộ công cụ:</p>
      {tools.map((tool, index) => (
        <div
          key={index}
          // THAY ĐỔI: px-3 py-2 -> p-3 để đồng nhất và thoáng hơn
          className='flex items-center space-x-3 rounded-lg bg-white p-3'
        >
          {tool.icon}
          <span className='text-8xl font-medium text-gray-800'>
            {tool.label}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const AgentPlaceholder: React.FC = () => (
  // THAY ĐỔI: p-5 -> p-8 để đồng bộ với SubAgentBlock
  <div className='flex h-full flex-col items-center justify-center rounded-2xl border-4 border-dashed border-gray-300 bg-white p-8 shadow-inner'>
    <MoreHorizontal className='text-gray-400' size={120} />
    <p className='mt-4 text-8xl font-medium text-gray-600'>Các Agent khác</p>
  </div>
)

// ========================================================================= //
// ========= COMPONENT CHÍNH - ĐÃ CẬP NHẬT ĐỂ CĂN GIỮA ARCHBLOCK ========= //
// ========================================================================= //
const ChatbotDiagramForPoster: React.FC = () => {
  return (
    // THAY ĐỔI: p-8 -> p-16 để tạo một viền trắng lớn xung quanh toàn bộ sơ đồ
    <div className='mx-auto flex w-full max-w-full flex-col items-center bg-white p-16 font-sans'>
      <div className='flex w-full flex-col'>
        {/* ---- KHỐI TƯƠNG TÁC NGƯỜI DÙNG - HỆ THỐNG (ĐÃ GỘP) ---- */}
        <div className='flex flex-col'>
          {/* THAY ĐỔI: mb-8 -> mb-12 để tiêu đề cách xa nội dung hơn */}
          <h2 className='mb-12 text-center text-9xl font-bold text-blue-600'>
            Luồng Tương tác Chính
          </h2>

          {/* 1. NGƯỜI DÙNG - ĐÃ CĂN GIỮA VÀ TÙY CHỈNH KÍCH THƯỚC */}
          <div className='flex justify-center'>
            <ArchBlock
              title='Người dùng'
              icon={<Users size={120} className='text-blue-500' />}
              color='border-blue-500'
              className='w-[1200px] bg-blue-50'
            />
          </div>

          {/* MŨI TÊN 2 CHIỀU: User <-> Backend */}
          {/* THAY ĐỔI: my-8 -> my-12 để tăng khoảng cách dọc */}
          <div className='my-12 flex  items-center justify-center '>
            <div className='flex items-center gap-4  '>
              <span className='rounded-full bg-blue-100 px-6 py-3 text-8xl font-semibold text-blue-700'>
                Gửi yêu cầu
              </span>
              <ArrowDown size={120} strokeWidth={2.5} />
            </div>
            <div className='flex items-center gap-4 '>
              <ArrowUp className='text-sky-500' size={120} strokeWidth={2.5} />
              <span className='rounded-full bg-sky-100 px-6 py-3 text-8xl font-semibold text-sky-700'>
                Nhận phản hồi
              </span>
            </div>
          </div>

          {/* 2. BACKEND SERVER - ĐÃ CĂN GIỮA VÀ TÙY CHỈNH KÍCH THƯỚC */}
          <div className='flex justify-center'>
            <ArchBlock
              title='Backend Server'
              icon={<Server size={120} className='text-gray-600' />}
              color='border-gray-600'
              className='w-[1600px] bg-gray-100'
            />
          </div>

          {/* MŨI TÊN 2 CHIỀU: Backend <-> Host Agent */}
          {/* THAY ĐỔI: my-8 -> my-12 để tăng khoảng cách dọc */}
          <div className='my-12 flex items-center justify-center'>
            <div className='flex items-center gap-4'>
              <span className='rounded-full bg-blue-100 px-6 py-3 text-8xl font-semibold text-blue-700'>
                Xác thực & chuyển tiếp
              </span>
              <ArrowDown size={120} strokeWidth={2.5} />
            </div>
            <div className='flex items-center gap-4'>
              <ArrowUp className='text-sky-500' size={120} strokeWidth={2.5} />
              <span className='rounded-full bg-sky-100 px-6 py-3 text-8xl font-semibold text-sky-700'>
                Tổng hợp & trả kết quả
              </span>
            </div>
          </div>

          {/* 3. HOST AGENT - ĐÃ CĂN GIỮA VÀ TÙY CHỈNH KÍCH THƯỚC */}
          <div className='flex justify-center'>
            <ArchBlock
              title='Host Agent (Điều phối & Tổng hợp)'
              icon={
                <div className='flex items-center gap-4'>
                  <Share2 size={120} className='text-green-600' />
                </div>
              }
              color='border-green-600'
              className='w-[2500px] bg-green-50'
            />
          </div>
        </div>

        {/* ---- MŨI TÊN CHÍNH TRUNG TÂM - ĐÃ CẬP NHẬT ---- */}
        {/* THAY ĐỔI: my-8 -> my-12 để tăng khoảng cách dọc */}
        <div className='my-12 flex items-center justify-center '>
          <FlowArrow label='Chọn Agent phù hợp' direction='down' />
          <FlowArrow label='Trả kết quả' direction='up' />
        </div>

        {/* ---- LÕI XỬ LÝ AI - ĐÃ CẬP NHẬT ---- */}
        {/* THAY ĐỔI: p-8 -> p-12 để tăng khoảng đệm cho cả khối */}
        <div className='w-full rounded-3xl border-4 border-dashed border-orange-500 bg-orange-50/50 p-12'>
          {/* THAY ĐỔI: mb-8 -> mb-12 */}
          <h3 className='mb-12 flex items-center justify-center gap-6 text-center text-9xl font-bold text-orange-600'>
            <Cpu size={120} className='text-orange-500' />
            Lõi Xử lý AI
          </h3>
          <div className='grid grid-cols-3 gap-8'>
            <SubAgentBlock
              title='Agent Hội nghị'
              icon={<CalendarDays size={72} className='text-cyan-600' />}
              color='text-cyan-600'
              tools={[
                { icon: <Search size={72} />, label: 'Tìm thông tin hội nghị' },
                {
                  icon: <BookmarkPlus size={72} />,
                  label: 'Theo dõi hội nghị'
                },
                {
                  icon: <BookmarkCheck size={72} />,
                  label: 'Quản lý danh sách'
                }
              ]}
            />
            <SubAgentBlock
              title='Agent Điều hướng'
              icon={<MousePointerClick size={72} className='text-indigo-600' />}
              color='text-indigo-600'
              tools={[
                {
                  icon: <ExternalLink size={72} />,
                  label: 'Mở trang chính thức'
                },
                { icon: <MapPin size={72} />, label: 'Mở bản đồ địa điểm' },
                { icon: <Compass size={72} />, label: 'Điều hướng trang' }
              ]}
            />
            <AgentPlaceholder />
          </div>
        </div>

        {/* ---- MŨI TÊN KẾT NỐI AI -> DATA ---- */}
        {/* THAY ĐỔI: my-8 -> my-12 */}
        <div className='my-12 flex flex-row items-center justify-center gap-4'>
          <ArrowDown size={120} strokeWidth={2.5} />
          <ArrowUp className='text-sky-500' size={120} strokeWidth={2.5} />
          <span className='rounded-full bg-blue-100 px-6 py-3 text-8xl font-semibold text-blue-700'>
            Thực thi & Truy xuất dữ liệu
          </span>
        </div>

        {/* ---- LỚP DỮ LIỆU ---- */}
        {/* THAY ĐỔI: p-8 -> p-12 */}
        <div className='w-full rounded-3xl border-4 border-dashed border-purple-500 bg-purple-50/50 p-12'>
          {/* THAY ĐỔI: mb-8 -> mb-12 */}
          <h3 className='mb-12 flex items-center justify-center gap-4 text-center text-9xl font-bold text-purple-600'>
            <Layers size={120} /> Lớp Dữ liệu
          </h3>
          <div className='flex w-full flex-row gap-8'>
            {/* Dùng flex-1 để 2 block này tự chia đều không gian */}
            <ArchBlock
              title='SQL Database (PostgreSQL)'
              icon={<Database size={120} className='text-blue-700' />}
              color='border-blue-700'
              className='flex-1 bg-blue-50'
            />
            <ArchBlock
              title='NoSQL Database (MongoDB)'
              icon={<MemoryStick size={120} className='text-teal-500' />}
              color='border-teal-500'
              className='flex-1 bg-teal-50'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotDiagramForPoster
