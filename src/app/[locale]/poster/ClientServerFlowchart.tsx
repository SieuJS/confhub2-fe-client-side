// src/components/ClientServerFlowcharge.tsx
import React from 'react'
// ĐÃ THÊM: Import các icon cần thiết từ thư viện react-icons
import {
  HiMagnifyingGlass,
  HiOutlineQueueList,
  HiArrowPath,
  HiServer,
  HiArrowsRightLeft,
  HiOutlineInboxArrowDown,
  HiCircleStack,
  HiOutlineBookmarkSquare,
  HiGlobeAlt
} from 'react-icons/hi2'

// --- CÁC COMPONENT HELPER ĐÃ ĐƯỢC CẬP NHẬT ---

// ĐÃ THAY ĐỔI: Hộp hành động giờ đây có thể nhận một 'icon' prop
const ActionBox = ({
  children,
  icon,
  className = ''
}: {
  children: React.ReactNode
  icon?: React.ReactNode // Prop icon là tùy chọn
  className?: string
}) => (
  <div
    className={`flex w-full items-center justify-center rounded-md border-2 border-gray-700 p-4 text-center ${className}`}
  >
    {/* Bố cục bên trong để xếp icon và chữ theo chiều dọc */}
    <div className='flex flex-col items-center justify-center gap-4'>
      {icon && <div className='text-6xl text-gray-700'>{icon}</div>}
      <span className='text-5xl font-semibold text-gray-800'>{children}</span>
    </div>
  </div>
)

// ĐÃ THAY ĐỔI: Mũi tên có đầu to và rộng hơn
const FlowArrow = ({
  x1,
  y1,
  x2,
  y2
}: {
  x1: string
  y1: string
  x2: string
  y2: string
}) => (
  <svg
    className='absolute left-0 top-0 h-full w-full'
    style={{ pointerEvents: 'none' }}
  >
    <defs>
      <marker
        id='arrowhead-chunky'
        markerWidth='12'
        markerHeight='12'
        refX='12'
        refY='6'
        orient='auto'
      >
        <polygon points='0 0, 12 6, 0 12' fill='#374151' />
      </marker>
    </defs>
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke='#374151'
      strokeWidth='4'
      markerEnd='url(#arrowhead-chunky)' // Sử dụng marker mới
    />
  </svg>
)

// --- COMPONENT CHÍNH ĐÃ ĐƯỢC THIẾT KẾ LẠI THEO YÊU CẦU ---
const ClientServerFlowchart: React.FC = () => {
  const colors = {
    fe: 'bg-blue-200',
    be: 'bg-green-200',
    db: 'bg-orange-200',
    crawl: 'bg-purple-200'
  }

  return (
    <div className='w-full rounded-lg bg-white p-8 font-sans'>
      <div className='grid grid-cols-[1fr_150px_1fr_150px_1fr] gap-4'>
        {/* CỘT 1: FE */}
        <div className='flex h-[1200px] flex-col'>
          <div className='flex h-full flex-col justify-between rounded-md border-2 border-gray-700 bg-white p-6'>
            <h3 className='mb-4 text-center text-5xl font-bold'>FE</h3>
            <ActionBox
              icon={<HiMagnifyingGlass />}
              className={`h-32 ${colors.fe}`}
            >
              Gửi yêu cầu tìm kiếm
            </ActionBox>
            <ActionBox
              icon={<HiOutlineQueueList />}
              className={`h-[600px] ${colors.fe}`}
            >
              Hiển thị kết quả
            </ActionBox>
            <ActionBox icon={<HiArrowPath />} className={`h-40 ${colors.fe}`}>
              Gửi yêu cầu update
            </ActionBox>
          </div>
        </div>

        {/* KHOẢNG TRỐNG 1 */}
        <div className='relative h-full'>
          <FlowArrow x1='0%' y1='15%' x2='100%' y2='15%' />
          <FlowArrow x1='100%' y1='32%' x2='0%' y2='32%' />
          <FlowArrow x1='0%' y1='88%' x2='100%' y2='88%' />
          <FlowArrow x1='100%' y1='60%' x2='0%' y2='60%' />
        </div>

        {/* CỘT 2: BE */}
        <div className='flex h-[1200px] flex-col'>
          <div className='flex h-full flex-col justify-between rounded-md border-2 border-gray-700 bg-white p-6'>
            <h3 className='mb-4 text-center text-5xl font-bold'>BE</h3>
            <ActionBox
              icon={<HiArrowsRightLeft />}
              className={`h-32 ${colors.be}`}
            >
              Nhận, gửi YC cho DB
            </ActionBox>
            <ActionBox icon={<HiServer />} className={`h-32 ${colors.be}`}>
              Nhận kết quả từ DB, trả FE
            </ActionBox>
            <ActionBox
              icon={<HiOutlineInboxArrowDown />}
              className={`h-[420px] ${colors.be}`}
            >
              Nhận KQ crawl
            </ActionBox>
            <ActionBox
              icon={<HiArrowsRightLeft />}
              className={`h-40 ${colors.be}`}
            >
              Nhận, gửi YC cho Server Crawl
            </ActionBox>
          </div>
        </div>

        {/* KHOẢNG TRỐNG 2 */}
        <div className='relative h-full'>
          <FlowArrow x1='0%' y1='15%' x2='100%' y2='15%' />
          <FlowArrow x1='100%' y1='32%' x2='0%' y2='32%' />
          <FlowArrow x1='0%' y1='88%' x2='100%' y2='88%' />
          <FlowArrow x1='100%' y1='70%' x2='0%' y2='70%' />
          <FlowArrow x1='0%' y1='50%' x2='100%' y2='50%' />
        </div>

        {/* CỘT 3: DB & Server Crawl */}
        <div className='flex flex-col'>
          <div className='flex h-full flex-col justify-between gap-8'>
            <div className='flex flex-col gap-8 rounded-md border-2 border-gray-700 bg-white p-6'>
              <h3 className='mb-12 text-center text-5xl font-bold'>DB</h3>
              <ActionBox
                icon={<HiCircleStack />}
                className={`h-[320px] ${colors.db}`}
              >
                Truy vấn DB
              </ActionBox>
              <ActionBox
                icon={<HiOutlineBookmarkSquare />}
                className={`h-32 ${colors.db}`}
              >
                Lưu DB
              </ActionBox>
            </div>
            <div className='rounded-md border-2 border-gray-700 bg-white p-4'>
              <h3 className='mb-4 text-center text-5xl font-bold'>
                Server Crawl
              </h3>
              <ActionBox
                icon={<HiGlobeAlt />}
                className={`h-96 ${colors.crawl}`}
              >
                Crawl DL
              </ActionBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientServerFlowchart
