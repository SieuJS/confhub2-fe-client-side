import React from 'react'
import {
  CubeTransparentIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  CircleStackIcon,
  BoltIcon,
  PlusIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

// Card component để hiển thị từng thành phần
const InfoCard = ({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) => (
  <div
    className={`flex items-center gap-4 border-2 p-4 border-${color}-300 bg-${color}-50 rounded-xl shadow-md`}
  >
    {/* 2. Thêm `flex-shrink-0` để icon không bị co lại khi không đủ chỗ */}
    <div className={`h-14 w-14 flex-shrink-0 text-${color}-600`}>{icon}</div>

    {/* 3. Nhóm title và description vào một thẻ div */}
    <div>
      {/* 4. Bỏ `mt-2` không cần thiết nữa */}
      <h4 className={`text-xl font-bold text-${color}-800`}>{title}</h4>
      <p className={`text-base text-${color}-700`}>{description}</p>
    </div>
  </div>
)

const ApiIllustrationDiagram: React.FC = () => {
  return (
    <div className='flex h-full flex-col items-center justify-between font-sans'>
      {/* --- PHẦN 1: CÁC NGUYÊN LIỆU --- */}
      <div className='w-full'>
        <h3 className='mb-3 text-center text-xl font-bold text-gray-700'>
          1. Nguyên Liệu Cấu Thành Yêu Cầu
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <InfoCard
            icon={<Cog6ToothIcon />}
            title='System Instruction'
            description='Đặt ra quy tắc & vai trò cho AI.'
            color='blue'
          />
          <InfoCard
            icon={<ClipboardDocumentListIcon />}
            title='Few-shot Examples'
            description='Dạy AI cách trả lời đúng định dạng.'
            color='purple'
          />
          <InfoCard
            icon={<DocumentTextIcon />}
            title='Main Prompt'
            description='Nhiệm vụ & dữ liệu cần xử lý.'
            color='green'
          />
          <InfoCard
            icon={<CubeTransparentIcon />}
            title='Generation Config'
            description='Tinh chỉnh sự sáng tạo, độ dài...'
            color='orange'
          />
        </div>
      </div>

      <ArrowDownIcon className='my-4 h-10 w-10 text-gray-400' />

      {/* --- PHẦN 2: LẮP RÁP & THỰC THI --- */}
      <div className='flex w-full flex-col items-center'>
        <h3 className='mb-3 text-center text-xl font-bold text-gray-700'>
          2. Lắp Ráp & Gửi Đi
        </h3>
        <div className='flex w-full items-center justify-around'>
          <div className='flex flex-col items-center'>
            <div className='rounded-xl bg-gray-700 p-4 shadow-lg'>
              <CubeTransparentIcon className='h-16 w-16 text-white' />
            </div>
            <p className='mt-2 text-lg font-semibold'>Gói Yêu Cầu (params)</p>
          </div>
          <ArrowDownIcon className='h-12 w-12 rotate-[-90deg] text-gray-400' />
          <div className='flex flex-col items-center'>
            <CloudArrowUpIcon className='h-20 w-20 text-sky-500' />
            <p className='mt-2 text-lg font-semibold'>Gọi API Gemini</p>
          </div>
          <ArrowDownIcon className='h-12 w-12 rotate-[-90deg] text-gray-400' />
          <div className='flex flex-col items-center'>
            <CodeBracketIcon className='h-20 w-20 text-emerald-600' />
            <p className='mt-2 text-lg font-semibold'>Kết quả JSON</p>
          </div>
        </div>
      </div>

      <ArrowDownIcon className='my-4 h-10 w-10 text-gray-400' />

      {/* --- PHẦN 3: TỐI ƯU HÓA --- */}
      <div className='w-full'>
        <h3 className='mb-3 text-center text-xl font-bold text-gray-700'>
          3. Tối ưu hóa với Context Caching
        </h3>
        <div className='flex items-center justify-between rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 p-4'>
          <div className='flex items-center'>
            <CircleStackIcon className='h-12 w-12 text-teal-600' />
            <div className='ml-4'>
              <h4 className='text-xl font-bold text-teal-800'>Lưu Ngữ Cảnh</h4>
              <p className='text-lg text-teal-700'>
                System Instruction & Few-shots được cache lại sau lần gọi đầu.
              </p>
            </div>
          </div>
          <div className='flex items-center text-green-600'>
            <BoltIcon className='h-10 w-10' />
            <div className='ml-2'>
              <p className='font-bold'>Nhanh hơn</p>
              <p className='font-bold'>Rẻ hơn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiIllustrationDiagram
