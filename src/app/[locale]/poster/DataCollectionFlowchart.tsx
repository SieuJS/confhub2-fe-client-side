// src/components/DataCollectionFlowchart.tsx

import React from 'react'
import {
  FaInbox,
  FaCodeBranch,
  FaSearch,
  FaFilter,
  FaRobot,
  FaBrain,
  FaCheckCircle,
  FaDatabase,
  FaLink,
  FaArrowDown,
  FaLongArrowAltRight,
  FaLongArrowAltDown
} from 'react-icons/fa'

// Helper components để tái sử dụng và làm code sạch hơn
const FlowBlock = ({
  icon,
  title,
  // children,
  className = ''
}: {
  icon: React.ReactNode
  title: string
  // children: React.ReactNode
  className?: string
}) => (
  <div
    // TĂNG KÍCH THƯỚC: Tăng padding, border và bo tròn
    className={`flex w-full flex-col items-center rounded-3xl border-8 p-12 text-center shadow-lg ${className}`}
  >
    {/* TĂNG KÍCH THƯỚC: Tăng cỡ icon */}
    <div className='mb-4 text-[120px]'>{icon}</div>
    {/* TĂNG KÍCH THƯỚC: Tăng cỡ tiêu đề */}
    <h4 className='mb-4 text-7xl font-bold'>{title}</h4>
    {/* TĂNG KÍCH THƯỚC: Tăng cỡ nội dung và line-height */}
    {/* <p className='text-5xl leading-tight'>{children}</p> */}
  </div>
)

const FlowArrow = () => (
  // TĂNG KÍCH THƯỚC: Tăng cỡ mũi tên và khoảng cách
  <FaLongArrowAltDown className='my-12 text-[160px] text-gray-400' />
)

const DataCollectionFlowchart: React.FC = () => {
  return (
    // TĂNG KÍCH THƯỚC: Tăng padding cho container chính
    <div className='flex h-full w-full flex-col items-center justify-start rounded-[40px] bg-gray-100 p-24'>
      {/* GỘP MỤC 1 VÀ 2 */}
      <FlowBlock
        icon={<FaCodeBranch className='text-blue-600' />}
        title='1. Tiếp nhận yêu cầu & Tạo luồng tác vụ xử lý phù hợp'
        className='border-blue-500 bg-blue-50'
      >
        {/* Tiếp nhận yêu cầu, tạo tác vụ xử lý. Kiểm tra xem đã có đủ 3 link quan
        trọng (chính, CFP, ngày) để phân luồng hay chưa. */}
      </FlowBlock>

      {/* TĂNG KÍCH THƯỚC: Tăng khoảng cách, cỡ chữ và độ dày border */}
      <div className='my-12 flex w-full items-center justify-center'>
        <div className='flex-1 border-t-8 border-dashed border-gray-400'></div>
        {/* <div className='mx-8 text-6xl font-bold text-gray-500'>
          (KHÔNG / CÓ)
        </div> */}
        {/* <div className='flex-1 border-t-8 border-dashed border-gray-400'></div> */}
      </div>

      <div className='flex w-full items-start justify-between gap-12'>
        {/* LUỒNG THU THẬP MỚI */}
        <div className='flex flex-1 flex-col items-center rounded-3xl border-8 border-dashed border-orange-500 bg-orange-50 p-12'>
          {/* TĂNG KÍCH THƯỚC */}
          <h3 className='mb-8 text-8xl font-bold text-orange-600'>
            Luồng Thu Thập Mới
          </h3>
          <FlowBlock
            icon={
              <div className='flex gap-6'>
                <FaSearch /> <FaFilter /> <FaRobot />
              </div>
            }
            // Cập nhật đánh số phụ
            title='Tìm kiếm & Thu Thập'
            className='border-orange-400 bg-white'
          >
            {/* Dùng Google API tìm, lọc và cào dữ liệu thô từ các trang web tiềm
            năng. */}
          </FlowBlock>
          <FlowArrow />
          <FlowBlock
            icon={<FaBrain className='text-purple-600' />}
            title='LLM Xác định Links'
            className='border-purple-500 bg-purple-50'
          >
            {/* Gọi LLM lần 1 để tìm các link quan trọng. Cào lại nếu cần. */}
          </FlowBlock>
          <FlowArrow />
          <FlowBlock
            icon={<FaBrain className='text-purple-600' />}
            title='LLM Trích xuất thông tin'
            className='border-purple-500 bg-purple-50'
          >
            {/* Gọi LLM song song để bóc tách dữ liệu có cấu trúc và nội dung dài. */}
          </FlowBlock>
        </div>

        {/* LUỒNG CẬP NHẬT */}
        <div className='flex flex-1 flex-col items-center rounded-3xl border-8 border-dashed border-green-500 bg-green-50 p-12'>
          {/* TĂNG KÍCH THƯỚC */}
          <h3 className='mb-8 text-8xl font-bold text-green-600'>
            Luồng Cập Nhật
          </h3>
          <FlowBlock
            icon={
              <div className='flex gap-6'>
                <FaLink /> <FaRobot />
              </div>
            }
            title='Thu thập thông tin trực tiếp từ Link đã có'
            className='border-green-400 bg-white'
          >
            {/* Bỏ qua tìm kiếm, truy cập và cào dữ liệu từ 3 link đã cung cấp. */}
          </FlowBlock>
          <FlowArrow />
          <FlowBlock
            icon={<FaBrain className='text-green-600' />}
            title='LLM Trích xuất thông tin'
            className='border-green-400 bg-white'
          >
            {/* Gọi LLM song song để bóc tách dữ liệu có cấu trúc và nội dung dài. */}
          </FlowBlock>
          {/* TĂNG KÍCH THƯỚC */}
          {/* <div className='my-16 flex w-full flex-col items-center'>
            <FaLongArrowAltDown className='text-[160px] text-gray-400' />
            <p className='mt-4 text-5xl font-semibold text-gray-500'>
              Tái sử dụng
            </p>
            <FaLongArrowAltRight className='text-[160px] text-gray-400' />
          </div>
          <p className='text-5xl italic text-gray-600'>
            (Chuyển đến GĐ 3 để trích xuất thông tin)
          </p> */}
        </div>
      </div>

      <FlowArrow />

      {/* GỘP MỤC 4 VÀ 5 */}
      <FlowBlock
        icon={
          // Kết hợp icon để thể hiện cả 2 bước
          <div className='flex items-center gap-6'>
            <FaCheckCircle className='text-teal-600' />
            <FaLongArrowAltRight className='text-gray-400' />
            <FaDatabase className='text-indigo-600' />
          </div>
        }
        // Cập nhật đánh số và tiêu đề
        title='2. Hợp nhất kết quả, kiểm tra, làm sạch, chuẩn hóa và lưu vào cơ sở dữ liệu.'
        className='border-teal-500 bg-teal-50'
      >
        {/* Hợp nhất kết quả, kiểm tra, làm sạch, chuẩn hóa và lưu bộ dữ liệu cuối
        cùng vào cơ sở dữ liệu. */}
      </FlowBlock>
    </div>
  )
}

export default DataCollectionFlowchart
