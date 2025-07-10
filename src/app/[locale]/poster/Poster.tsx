'use client'

import React from 'react'
// IMPORT COMPONENT GIAO DIỆN CHATBOT
import ChatbotInterface from './ChatbotInterface'
// IMPORT COMPONENT GIAO DIỆN MỚI
import ConferenceSearchInterface from './ConferenceSearchInterface'
import ConferenceDetailInterface from './ConferenceDetailInterface'
// IMPORT COMPONENT BẢNG SO SÁNH
import ComparisonTable from './ComparisonTable'
// IMPORT COMPONENT SƠ ĐỒ QUY TRÌNH MỚI
import DataCollectionFlowchart from './DataCollectionFlowchart'
import SystemArchitectureDiagram from './SystemArchitectureDiagram'
import AdminServerFlowchart from './AdminServerFlowchart' // Đảm bảo đường dẫn chính xác
import ClientServerFlowchart from './ClientServerFlowchart'

const Poster: React.FC = () => {
  const A0_WIDTH_PX = 14043
  const A0_HEIGHT_PX = 9933

  const evaluationResults = [
    { label: 'Tỷ lệ tìm link hội nghị chính xác', value: '90%' },
    { label: 'Ngày diễn ra hội nghị ', value: '80%' },
    { label: 'Địa điểm tổ chức', value: '80%' },
    { label: 'Ngày nộp bài', value: '80%' },
    { label: 'Ngày thông báo ', value: '80%' },
    { label: 'Ngày camera ready ', value: '80%' },
    { label: 'Ngày register ', value: '80%' }
  ]

  const mainResult = evaluationResults.find(
    r => r.label === 'Tỷ lệ tìm link hội nghị chính xác'
  )
  const otherResults = evaluationResults.filter(
    r => r.label !== 'Tỷ lệ tìm link hội nghị chính xác'
  )

  return (
    <div
      className='relative flex flex-col overflow-hidden bg-white text-gray-800 shadow-2xl'
      style={{
        width: `${A0_WIDTH_PX}px`,
        height: `${A0_HEIGHT_PX}px`,
        fontFamily: 'Arial, sans-serif',
        transform: 'scale(0.08)',
        transformOrigin: 'top left',
        margin: 'auto'
      }}
    >
      {/* HEADER (Giữ nguyên không đổi) */}
      <header className='flex items-center justify-between bg-gray-900 px-[188px] py-[125px] font-bold text-white shadow-md'>
        <div className='flex items-center'>
          <img
            src='/hcmus_logo.png'
            alt='Logo ĐH Khoa học Tự nhiên'
            className='mr-[94px] h-[469px] w-auto'
          />
          <div>
            <p className='m-0 text-[120px]'>ĐẠI HỌC KHOA HỌC TỰ NHIÊN</p>
            <p className='m-0 text-[110px]'>KHOA CÔNG NGHỆ THÔNG TIN</p>
          </div>
        </div>
        <div className='flex-grow px-[60px] text-center'>
          <h1 className='mb-[63px] text-[320px] font-extrabold leading-tight'>
            GLOBAL CONFERENCE & JOURNAL HUB
          </h1>
          <h2 className='mb-[31px] text-[180px] font-bold'>
            HỆ THỐNG TÌM KIẾM KHOA HỌC TÍCH HỢP MÔ HÌNH NGÔN NGỮ LỚN
          </h2>
        </div>
        <div className='ml-[94px] flex flex-shrink-0 gap-[94px] text-[100px] leading-relaxed'>
          <div className='text-left'>
            <p className='m-0'>GIẢNG VIÊN HƯỚNG DẪN:</p>
            <ul className='m-0 list-none p-0'>
              <li>ThS. Hồ Thị Hoàng Vy</li>
              <li>PGS.TS Lê Nguyễn Hoài Nam</li>
            </ul>
          </div>
          <div className='text-left'>
            <p className='m-0'>SINH VIÊN THỰC HIỆN:</p>
            <ul className='m-0 list-none py-0 '>
              <li>Lê Lâm Lợi - 21120284</li>
              <li>Nguyễn Văn Siêu - 21120321</li>
              <li>Nguyễn Trọng Trí - 21120344</li>
              <li>Hoàng Thị Khôn - 21120485</li>
              <li>Nguyễn Hữu Thắng - 21120555</li>
              <li>Lê Hồ Thanh Tùng - 21120614</li>
            </ul>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - UPDATED TO 4 COLUMNS */}
      <div className='flex flex-1 gap-[78px] p-[125px]'>
        {/* Column 1: Bối cảnh, Tóm tắt & Giải pháp */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[94px] shadow-sm'>
          <div className='mb-[94px]'>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              1. Bối cảnh & Mục tiêu
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Đồ án giải quyết vấn đề khó khăn và tốn thời gian của các nhà khoa
              học trong việc tìm kiếm, lựa chọn các hội nghị phù hợp.
            </p>
            <p className='mb-[94px] text-[113px] leading-relaxed'>
              Mục tiêu là xây dựng ứng dụng web giúp tìm kiếm hiệu quả với nền
              tảng dữ liệu hội nghị khoa học đáng tin cậy cùng các tính năng tìm
              kiếm thông minh và thân thiện.
            </p>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              2. Tóm tắt đồ án
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Đồ án xây dựng một hệ thống hoàn chỉnh, áp dụng{' '}
              <strong className='text-[#e67e22]'>
                Mô hình ngôn ngữ lớn (LLM)
              </strong>{' '}
              để trích xuất dữ liệu, được xây dựng trên kiến trúc Microservices
              linh hoạt. Sản phẩm cuối cùng gồm trang web cho người dùng với các
              tính năng tìm kiếm, Chatbot thông minh và hệ thống giám sát trực
              quan cho quản trị viên.
            </p>
          </div>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              3. So sánh
            </h3>
            <ComparisonTable />
          </div>
        </div>

        {/* Column 2: Các tính năng chính */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[94px] shadow-sm'>
          <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
            4. Giải pháp & Công nghệ
          </h3>
          <div className='mb-[94px] flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Sơ đồ tương tác Admin - Server (Thu thập dữ liệu)
            </h4>

            <div className='mt-[30px] min-h-[1600px] w-full'>
              {/* <DataCollectionFlowchart /> */}
              <AdminServerFlowchart />
            </div>
          </div>

          <div className='flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Kiến trúc hệ thống
            </h4>

            {/* Tích hợp component sơ đồ kiến trúc mới */}
            <div className='flex-grow'>
              <SystemArchitectureDiagram />
            </div>
          </div>
        </div>

        {/* Column 3: Live Chat & Kết quả đánh giá */}
        {/* <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[94px] shadow-sm'>
          <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
            5. Các tính năng chính
          </h3>
          <div className='flex flex-1 flex-col'>
            <div className='mb-[78px] flex w-full  items-center justify-center overflow-hidden rounded-[31px] border-[6px] border-dashed border-gray-400 bg-white p-[31px]'>
              <div className='w-full'>
                [Sơ đồ tương tác giữa Client và Server sẽ được hiển thị ở đây]
              </div>
            </div>
            <div className='flex w-full items-center justify-center overflow-hidden rounded-[31px] border-[6px] border-dashed border-gray-400 bg-white p-[31px]'>
              <div className='w-full'>
                [Sơ đồ tương tác giữa Admin và Server sẽ được hiển thị ở đây]
              </div>
            </div>
          </div>
        </div> */}

        {/* BƯỚC 2: SỬ DỤNG COMPONENT BẢNG SO SÁNH */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[94px] shadow-sm'>
          <div className='mb-[94px] flex flex-1 flex-col'>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              6. Sơ đồ tương tác client-server
            </h3>

            <div className='flex w-full  items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 p-[31px]'>
              {/* <ChatbotInterface /> */}
              {/* [Sơ đồ tương tác giữa Client và Server sẽ được hiển thị ở đây] */}
              <ClientServerFlowchart />
            </div>
          </div>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              7. Kết quả đánh giá
            </h3>
            {/* <p className='mb-[78px] text-[113px] leading-relaxed'>
              Hệ thống cho thấy hiệu quả vượt trội trong việc tự động hóa thu
              thập dữ liệu:
            </p> */}
            {/* START: UPDATED SECTION */}
            {mainResult && (
              <div className='mb-[62px] rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-100 p-[94px] text-center'>
                <p className='mb-[31px] text-[150px] font-semibold text-gray-800'>
                  {mainResult.label}
                </p>
                <p className='text-[280px] font-extrabold text-[#e67e22]'>
                  {mainResult.value}
                </p>
              </div>
            )}

            {/* Tiêu đề cho các trường còn lại */}
            <p className='mb-[62px] text-center text-[150px] font-bold text-gray-800'>
              Tỷ lệ trích xuất các trường chính xác
            </p>

            {/* Lưới hiển thị 6 trường còn lại */}
            <div className='grid grid-cols-2 gap-[62px]'>
              {otherResults.map((result, index) => (
                <div
                  key={index}
                  className='flex flex-col items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-100 p-[62px]'
                >
                  <span className='mb-[20px] px-40 text-center text-[150px] text-gray-800'>
                    {result.label}
                  </span>
                  <span className='text-[220px] font-extrabold text-[#e67e22]'>
                    {result.value}
                  </span>
                </div>
              ))}
            </div>
            {/* END: UPDATED SECTION */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Poster
