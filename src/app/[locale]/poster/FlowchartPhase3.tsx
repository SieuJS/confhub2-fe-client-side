import React from 'react'

// --- CÁC COMPONENT CON TÁI SỬ DỤNG ---
// (Giả sử bạn đã tách chúng ra file riêng để import)

const FlowchartBox: React.FC<{
  title: React.ReactNode
  variant?: 'process' | 'start-end' | 'input' | 'api-call'
}> = ({ title, variant = 'process' }) => {
  const baseClasses =
    'flex flex-col w-[500px] min-h-[70px] items-center justify-center border-2 border-black p-2 text-center shadow-md bg-white rounded-lg'
  const variantClasses = {
    process: 'bg-white',
    'start-end': 'bg-gray-100 rounded-2xl border-dashed',
    input: 'bg-orange-50 border-orange-400',
    'api-call': 'bg-purple-100 border-purple-500' // Màu mới cho API call
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <p className='text-3xl font-bold'>{title}</p>
    </div>
  )
}

const DownArrow: React.FC<{ label?: string }> = ({ label }) => (
  <div className='my-2 flex flex-col items-center py-2'>
    {label && (
      <span className='z-10 rounded-full bg-blue-100 px-4 py-1.5 text-base font-semibold text-blue-700'>
        {label}
      </span>
    )}
    <div className='text-4xl font-light text-gray-700'>↓</div>
  </div>
)

// --- COMPONENT CHÍNH CHO SƠ ĐỒ GIAI ĐOẠN 3 ---

const DataProcessingFlowchartPhase3: React.FC = () => {
  return (
    <div className='mx-auto my-8 flex min-h-[29.7cm] w-full max-w-[1200px] flex-col items-center bg-white p-8 font-sans shadow-lg print:my-0 print:shadow-none'>
      <h1 className='mb-12 text-center text-4xl font-bold'>
        Giai đoạn 3: Trích Xuất Thông Tin Song Song
      </h1>

      {/* Phần tuyến tính ở trên */}
      <div className='flex flex-col items-center'>
        <FlowchartBox title='Đầu vào: Kết quả Giai đoạn 2' variant='input' />
        <DownArrow label='Nội dung văn bản sạch từ các link Main, CFP, IMP' />
        <FlowchartBox title='Tổng hợp toàn bộ văn bản từ các trang đã xác định' />
      </div>

      {/* Biểu tượng phân nhánh */}
      <div className='relative my-4 h-16 w-full'>
        <div className='absolute left-1/2 top-0 h-8 w-0.5 bg-gray-700'></div>
        <div className='absolute left-1/4 top-8 h-0.5 w-1/2 bg-gray-700'></div>
        <div className='absolute left-1/4 top-16 h-8 w-0.5 -translate-y-full bg-gray-700'></div>
        <div className='absolute right-1/4 top-16 h-8 w-0.5 -translate-y-full bg-gray-700'></div>
      </div>

      {/* Phần xử lý song song */}
      <div className='grid w-full grid-cols-2 justify-items-center gap-x-8'>
        {/* Nhánh 1: Trích xuất ngày tháng */}
        <div className='flex flex-col items-center gap-y-4'>
          <FlowchartBox
            title='Call API Gemini: Trích xuất ngày quan trọng, địa điểm'
            variant='api-call'
          />
          <DownArrow label='Dữ liệu JSON về ngày, địa điểm' />
        </div>

        {/* Nhánh 2: Trích xuất thông tin CFP */}
        <div className='flex flex-col items-center gap-y-4'>
          <FlowchartBox
            title='Call API Gemini: Trích xuất thông tin Call for Paper'
            variant='api-call'
          />
          <DownArrow label='Dữ liệu JSON về chủ đề, yêu cầu' />
        </div>
      </div>

      {/* Biểu tượng hội tụ */}
      <div className='relative h-0 w-full'>
        <div className='absolute left-1/4 top-0 h-8 w-0.5 bg-gray-700'></div>
        <div className='absolute right-1/4 top-0 h-8 w-0.5 bg-gray-700'></div>
        <div className='absolute left-1/4 top-8 h-0.5 w-1/2 bg-gray-700'></div>
      </div>
      {/* Phần hội tụ */}
      <div className='mt-4 flex flex-col items-center'>
        <DownArrow />
        <FlowchartBox title='Tổng hợp và Chuẩn hóa dữ liệu' />
        <DownArrow label='Một bản ghi duy nhất, sạch, nhất quán' />
        <FlowchartBox title='Ghi dữ liệu' />
        <DownArrow />
        <FlowchartBox title='Kết thúc tác vụ' variant='start-end' />
      </div>
    </div>
  )
}

export default DataProcessingFlowchartPhase3
