import React from 'react'

// --- CÁC COMPONENT CON TÁI SỬ DỤNG TỪ GIAI ĐOẠN 1 ---
// (Bạn có thể tách chúng ra file riêng để import, ví dụ: './FlowchartComponents')

const FlowchartBox: React.FC<{
  title: React.ReactNode
  variant?: 'process' | 'start-end' | 'input'
}> = ({ title, variant = 'process' }) => {
  const baseClasses =
    'flex flex-col w-[460px] min-h-[70px] items-center justify-center border-2 border-black py-2 px-2 text-center shadow-md bg-white rounded-lg'
  const variantClasses = {
    process: 'bg-white',
    'start-end': 'bg-gray-100 rounded-2xl border-dashed',
    input: 'bg-orange-50 border-orange-400'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <p className='text-xl font-bold'>{title}</p>
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

// --- COMPONENT MỚI DÀNH RIÊNG CHO RẼ NHÁNH ---

const DecisionBox: React.FC<{ title: string }> = ({ title }) => (
  <div className='flex h-[180px] w-[180px] items-center justify-center bg-yellow-100 p-4 shadow-md'>
    <p className='-rotate-45 text-center text-lg font-bold'>{title}</p>
  </div>
)

// --- COMPONENT CHÍNH CHO SƠ ĐỒ GIAI ĐOẠN 2 ---

const DataProcessingFlowchartPhase2: React.FC = () => {
  return (
    <div className='mx-auto my-8 flex min-h-[29.7cm] w-full max-w-[1000px] flex-col items-center bg-white p-8 font-sans shadow-lg print:my-0 print:shadow-none'>
      <h1 className='mb-12 text-center text-4xl font-bold'>
        Giai đoạn 2: Xác Định Nguồn Tin
      </h1>

      {/* Phần tuyến tính ở trên */}
      <div className='flex flex-col items-center'>
        <FlowchartBox title='Đầu vào: Kết quả Giai đoạn 1' variant='input' />
        <DownArrow label='Khối văn bản lớn tổng hợp' />
        <FlowchartBox title='Call API: Xác định link chính, link call for paper, link importantDate' />
        <DownArrow label='Danh sách các URL quan trọng do AI đề xuất' />
      </div>

      {/* Hộp quyết định rẽ nhánh */}
      <div className='relative my-4 flex h-[180px] w-[180px] rotate-45 items-center justify-center bg-yellow-200 p-2 shadow-lg'>
        <p className='-rotate-45 text-center text-lg font-bold leading-tight'>
          Kiểm tra: Link chính có khớp với link đã cào?
        </p>
      </div>

      {/* Phần rẽ nhánh */}
      <div className='grid w-full grid-cols-2 justify-items-center gap-x-8'>
        {/* Nhãn cho 2 nhánh */}
        <div className='text-2xl font-bold text-red-600'>KHÔNG KHỚP</div>
        <div className='text-2xl font-bold text-green-600'>KHỚP</div>

        {/* Mũi tên đi xuống từ mỗi nhãn */}
        <div className='text-4xl font-light text-gray-700'>↓</div>
        <div className='text-4xl font-light text-gray-700'>↓</div>

        {/* Nội dung của 2 nhánh */}
        {/* Nhánh 1: Không khớp (Vòng lặp sửa lỗi) */}
        <div className='flex flex-col items-center gap-y-0'>
          <FlowchartBox title='Cào dữ liệu lại trang chính mới' />
          <DownArrow />
          <FlowchartBox title='Call API xác định lại các link' />
        </div>

        {/* Nhánh 2: Khớp (Bước bổ sung) */}
        <div className='flex flex-col items-center gap-y-4'>
          <FlowchartBox title='Cào bổ sung CFP/IMP link (nếu cần & chưa có)' />
        </div>
      </div>

      {/* Biểu tượng hội tụ */}
      <div className='relative h-4 w-full'>
        <div className='absolute left-1/4 top-0 h-8 w-0.5 bg-gray-700'></div>
        <div className='absolute right-1/4 top-0 h-8 w-0.5 bg-gray-700'></div>
        <div className='absolute left-1/4 top-8 h-0.5 w-1/2 bg-gray-700'></div>
      </div>
      {/* Phần hội tụ */}
      <div className='mt-0 flex flex-col items-center'>
        <DownArrow />
        <FlowchartBox title='Lưu trữ các link đã xác định (Main, CFP, IMP)' />
        <DownArrow label='Bản ghi dữ liệu sạch, đáng tin cậy' />
        <FlowchartBox title='Kết thúc Giai đoạn 2' variant='start-end' />
      </div>
    </div>
  )
}

export default DataProcessingFlowchartPhase2
