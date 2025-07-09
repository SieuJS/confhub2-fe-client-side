import React from 'react'

// Các sub-component để tái sử dụng
const Box = ({
  children,
  color = 'blue'
}: {
  children: React.ReactNode
  color?: string
}) => (
  <div
    className={`border-2 p-3 text-center bg-${color}-50 border-${color}-400 rounded-md text-sm shadow-sm`}
  >
    {children}
  </div>
)

const Diamond = ({ children }: { children: React.ReactNode }) => (
  <div className='flex h-40 w-40 rotate-45 transform items-center justify-center border-2 border-yellow-500 bg-yellow-50 shadow-sm'>
    <span className='-rotate-45 transform text-center text-sm'>{children}</span>
  </div>
)

const Arrow = ({
  direction = 'down',
  text = ''
}: {
  direction?: string
  text?: string
}) => {
  const arrowClass = {
    down: 'h-12 w-px bg-gray-400 mx-auto',
    right: 'w-12 h-px bg-gray-400 my-auto'
  }
  return (
    <div className='relative flex h-12 items-center justify-center'>
      <div
        className={
          direction === 'down'
            ? 'h-full w-px bg-gray-400'
            : 'h-px w-full bg-gray-400'
        }
      />
      {text && (
        <span className='absolute bg-white px-1 text-xs text-gray-500'>
          {text}
        </span>
      )}
      {/* Arrowhead */}
      <div
        className={`absolute ${direction === 'down' ? 'bottom-0' : 'right-0 -translate-y-1/2'} border-solid border-gray-400 ${direction === 'down' ? 'border-x-4 border-t-8 border-x-transparent' : 'border-y-4 border-l-8 border-y-transparent'}`}
      ></div>
    </div>
  )
}

const FlowchartDiagram: React.FC = () => {
  return (
    <div className='flex w-full flex-col items-center'>
      <Box color='purple'>Bắt đầu Yêu cầu</Box>
      <Arrow />
      <Box>Chuẩn bị tham số (Model chính, Prompt...)</Box>
      <Arrow text='Trước mỗi lần gọi' />
      <Box color='orange'>Kiểm tra Rate Limit</Box>
      <Arrow />

      <div className='flex items-start space-x-8'>
        {/* Main Flow */}
        <div className='flex flex-col items-center'>
          <Arrow text='OK' />
          <Box>Gọi API (Model chính)</Box>
          <Arrow />
          <div className='relative my-4'>
            <Diamond>Thành công?</Diamond>
          </div>

          <div className='flex w-full justify-between'>
            {/* Nhánh Thành Công */}
            <div className='flex w-1/2 flex-col items-center'>
              <Arrow text='Có' />
              <Box color='green'>Xử lý & Xác thực Kết quả (JSON)</Box>
              <Arrow />
              <div className='relative my-4'>
                <Diamond>Kết quả hợp lệ?</Diamond>
              </div>
              <Arrow text='Có' />
              <Box color='green'>KẾT THÚC: THÀNH CÔNG</Box>
            </div>

            {/* Nhánh Thất Bại / Không hợp lệ */}
            <div className='flex w-1/2 flex-col items-center'>
              <div className='h-12 w-px bg-gray-400' />
              <span className='-mt-8 bg-white px-1 text-xs text-red-500'>
                Không / Không hợp lệ
              </span>
            </div>
          </div>
        </div>

        {/* Fallback & Retry Flow */}
        <div className='flex flex-col items-center pt-32'>
          <div className='h-24 w-px bg-gray-400' />
          <Box color='red'>Chuyển sang Model Dự phòng (Fallback)</Box>
          <Arrow />
          <Box color='red'>Thử lại (Retry) với Exponential Backoff</Box>
          <Arrow />
          <Box color='red'>KẾT THÚC: LỖI</Box>
        </div>
      </div>
      <p className='mt-6 text-center text-xs italic text-gray-500'>
        Lưu ý: Sơ đồ được đơn giản hóa để minh họa. Nhánh &quot;Kết quả không
        hợp lệ&quot; cũng sẽ kích hoạt luồng Retry.
      </p>
    </div>
  )
}

export default FlowchartDiagram
