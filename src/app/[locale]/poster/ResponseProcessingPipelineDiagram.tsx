import React from 'react'

const PipelineStep = ({
  num,
  title,
  description
}: {
  num: number
  title: string
  description: string
}) => (
  <div className='flex flex-col items-center text-center'>
    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-2xl font-bold text-white shadow-lg'>
      {num}
    </div>
    <h4 className='mt-2 max-w-28 font-bold text-cyan-800'>{title}</h4>
    <p className='max-w-[172px] text-xs text-gray-700'>{description}</p>
  </div>
)

const ArrowIcon = () => (
  <svg
    className='h-8 w-8 text-gray-700'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1}
      d='M17 8l4 4m0 0l-4 4m4-4H3'
    />
  </svg>
)

const ResponseProcessingPipelineDiagram: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center space-y-4'>
      <div className='rounded-lg border bg-gray-100 p-2 text-center'>
        <p className='font-semibold'>Đầu vào: Phản hồi thô từ Gemini</p>
        <p className='text-xs italic text-gray-700'>
          Nội dung có thể chứa ```json, lỗi cú pháp...
        </p>
      </div>

      <div className='flex flex-wrap items-center justify-center gap-x-0 '>
        <PipelineStep
          num={1}
          title='Kiểm tra Lỗi An toàn'
          description='Đảm bảo model không bị chặn (safety block).'
        />
        <ArrowIcon />
        <PipelineStep
          num={2}
          title='Trích xuất Văn bản'
          description='Lấy nội dung text chính từ phản hồi.'
        />
        <ArrowIcon />
        <PipelineStep
          num={3}
          title='Dọn dẹp Dữ liệu'
          description='Loại bỏ các ký tự thừa như ```json, dấu phẩy cuối.'
        />
        <ArrowIcon />
        <PipelineStep
          num={4}
          title='Xác thực & Parse JSON'
          description='Chuyển chuỗi thành đối tượng JSON. Nếu lỗi, sẽ Retry.'
        />
      </div>

      <div className='mt-6 rounded-lg border border-green-400 bg-green-100 p-3 text-center'>
        <p className='font-semibold text-green-800'>
          Đầu ra: Đối tượng JSON sạch, sẵn sàng sử dụng
        </p>
      </div>
    </div>
  )
}

export default ResponseProcessingPipelineDiagram
