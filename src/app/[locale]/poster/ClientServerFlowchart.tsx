// src/components/ClientServerFlowcharge.tsx
import React from 'react'
// Import các icon cần thiết từ thư viện react-icons
import {
  HiMagnifyingGlass,
  HiOutlineQueueList,
  HiArrowPath,
  HiServer,
  HiArrowsRightLeft,
  HiOutlineInboxArrowDown,
  HiCircleStack,
  HiOutlineBookmarkSquare,
  HiGlobeAlt,
  HiArrowLongRight,
  HiArrowLongLeft
} from 'react-icons/hi2'

// --- CÁC COMPONENT HELPER ---

/**
 * Hộp hành động với icon và text xếp HÀNG NGANG.
 * Giờ đây nó sẽ nhận màu nền và màu chữ từ className.
 */
const ActionBox = ({
  children,
  icon,
  className = ''
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) => (
  <div
    // Thay đổi: Tăng padding từ p-4 lên p-6
    // Giữ flex và items-center để căn giữa theo chiều dọc
    className={`flex w-full items-center rounded-lg p-6 shadow-lg ${className}`}
  >
    {/* Icon được căn trái */}
    {icon && <div className='text-[200px] pl-8'>{icon}</div>} {/* Thêm pl-8 để tạo padding trái cho icon */}
    {/* Text được căn giữa trong không gian còn lại */}
    <span className='flex-grow text-8xl font-semibold text-center'>{children}</span>
  </div>
)

/**
 * Mũi tên luồng, icon to hơn và màu sắc nhẹ nhàng hơn.
 * Thay đổi: Thêm prop 'color' để tùy chỉnh màu sắc.
 */
const FlowArrow = ({
  direction,
  y,
  color = 'text-slate-500' // Màu mặc định
}: {
  direction: 'right' | 'left'
  y: string
  color?: string // Prop màu là tùy chọn
}) => {
  const Icon = direction === 'right' ? HiArrowLongRight : HiArrowLongLeft

  return (
    <div
      className='absolute left-0 flex w-full -translate-y-1/2 transform justify-center'
      style={{ top: y }}
    >
      {/* Thay đổi: Sử dụng prop 'color' để áp dụng màu cho mũi tên */}
      <Icon className={`text-[200px] ${color}`} />
    </div>
  )
}

// --- COMPONENT CHÍNH ---
const ClientServerFlowchart: React.FC = () => {
  // BỘ MÀU 1: Dành cho nền của các cột chính (màu nhạt)
  const columnColors = {
    fe: 'bg-blue-100',
    be: 'bg-teal-100',
    db: 'bg-amber-100',
    crawl: 'bg-indigo-200'
  }

  // BỘ MÀU 2: Dành cho các hộp hành động bên trong (màu đậm, chữ trắng)
  const boxColors = {
    fe: 'bg-blue-500 text-white',
    be: 'bg-teal-500 text-white',
    db: 'bg-amber-500 text-white',
    crawl: 'bg-indigo-500 text-white'
  }

  return (
    <div className='w-full rounded-lg bg-white font-sans'>
      {/* Thay đổi: Tăng khoảng trống giữa các cột từ gap-6 lên gap-8 */}
      <div className='grid grid-cols-[1fr_200px_1fr_200px_1fr] gap-8'>
        {/* CỘT 1: FE */}
        {/* ĐIỀU CHỈNH: Giảm chiều cao tổng thể của cột */}
        <div className='flex h-[1600px] flex-col'>
          <div
            className={`flex h-full flex-col justify-between rounded-xl p-6 ${columnColors.fe}`}
          >
            {/* Thay đổi: Tăng kích thước tiêu đề */}
            <h3 className='mb-4 text-center text-8xl font-bold text-blue-900'>
              Frontend (FE)
            </h3>
            {/* ĐIỀU CHỈNH: Giảm chiều cao các khối ActionBox */}
            <ActionBox
              icon={<HiMagnifyingGlass />}
              className={`h-80 ${boxColors.fe}`}
            >
              Gửi yêu cầu tìm kiếm
            </ActionBox>
            <ActionBox
              icon={<HiOutlineQueueList />}
              className={`h-[700px] ${boxColors.fe}`}
            >
              Hiển thị kết quả
            </ActionBox>
            <ActionBox
              icon={<HiArrowPath />}
              className={`h-80 ${boxColors.fe}`}
            >
              Gửi yêu cầu update
            </ActionBox>
          </div>
        </div>

        {/* KHOẢNG TRỐNG 1 */}
        <div className='relative h-full'>
          {/* THAY ĐỔI: Thêm prop 'color' để tô màu khác cho 4 mũi tên này */}
          {/* ĐIỀU CHỈNH: Điều chỉnh lại vị trí mũi tên */}
          <FlowArrow direction='right' y='18%' color='text-sky-500' />
          <FlowArrow direction='left' y='40%' color='text-sky-500' />
          <FlowArrow direction='right' y='90%' />
          <FlowArrow direction='left' y='65%' />
        </div>

        {/* CỘT 2: BE */}
        {/* ĐIỀU CHỈNH: Giảm chiều cao tổng thể của cột */}
        <div className='flex h-[1600px] flex-col'>
          <div
            className={`flex h-full flex-col justify-between rounded-xl p-6 ${columnColors.be}`}
          >
            {/* Thay đổi: Tăng kích thước tiêu đề */}
            <h3 className='mb-4 text-center text-8xl font-bold text-teal-900'>
              Backend (BE)
            </h3>
            {/* ĐIỀU CHỈNH: Giảm chiều cao các khối ActionBox */}
            <ActionBox
              icon={<HiArrowsRightLeft />}
              className={`h-80 ${boxColors.be}`}
            >
              Gửi yêu cầu cho DB
            </ActionBox>
            <ActionBox icon={<HiServer />} className={`h-72 ${boxColors.be}`}>
              Trả kết quả về FE
            </ActionBox>
            <ActionBox
              icon={<HiOutlineInboxArrowDown />}
              className={`h-[450px] ${boxColors.be}`}
            >
              Nhận kết quả <br/>cào dữ liệu
            </ActionBox>
            <ActionBox
              icon={<HiArrowsRightLeft />}
              className={`h-[300px] ${boxColors.be}`}
            >
              Gửi yêu cầu cho Server Crawl
            </ActionBox>
          </div>
        </div>

        {/* KHOẢNG TRỐNG 2 */}
        <div className='relative h-full'>
          {/* THAY ĐỔI: 5 mũi tên này sẽ giữ màu mặc định (text-slate-500) */}
          {/* ĐIỀU CHỈNH: Điều chỉnh lại vị trí mũi tên */}
          <FlowArrow direction='right' y='18%' color='text-sky-500' />
          <FlowArrow direction='left' y='40%' color='text-sky-500' />
          <FlowArrow direction='right' y='90%' />
          <FlowArrow direction='left' y='72%' />
          <FlowArrow direction='right' y='55%' />
        </div>

        {/* CỘT 3: DB & Server Crawl */}
        <div className='flex flex-col'>
          <div className='flex h-full flex-col justify-between gap-4'>
            <div
              className={`flex flex-col gap-8 rounded-xl p-4 ${columnColors.db}`}
            >
              {/* Thay đổi: Tăng kích thước tiêu đề */}
              <h3 className='text-center text-8xl font-bold text-amber-900'>
                Database (DB)
              </h3>
              {/* ĐIỀU CHỈNH: Giảm chiều cao các khối ActionBox */}
              <ActionBox
                icon={<HiCircleStack />}
                className={`h-[550px] ${boxColors.db}`}
              >
                Truy vấn
              </ActionBox>
              <ActionBox
                icon={<HiOutlineBookmarkSquare />}
                className={`h-72 ${boxColors.db}`}
              >
                Lưu kết quả
              </ActionBox>
            </div>
            <div className={`rounded-xl p-6 ${columnColors.crawl}`}>
              {/* Thay đổi: Tăng kích thước tiêu đề */}
              <h3 className='mb-4 text-center text-8xl font-bold text-indigo-1000'>
                Backend (Server Crawl)
              </h3>
              {/* ĐIỀU CHỈNH: Giảm chiều cao khối ActionBox */}
              <ActionBox
                icon={<HiGlobeAlt />}
                className={`h-[375px] ${boxColors.crawl}`}
              >
                Cào dữ liệu
              </ActionBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientServerFlowchart