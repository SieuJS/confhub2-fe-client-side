'use client'

import React from 'react'
// IMPORT COMPONENT GIAO DIỆN CHATBOT
import ChatbotInterface from './ChatbotInterface' // Giữ lại import này
// BƯỚC 1: IMPORT 2 COMPONENT GIAO DIỆN MỚI
import ConferenceSearchInterface from './ConferenceSearchInterface'
import ConferenceDetailInterface from './ConferenceDetailInterface'

const Poster: React.FC = () => {
  const A0_WIDTH_PX = 14043
  const A0_HEIGHT_PX = 9933

  const evaluationResults = [
    { label: 'Tìm link hội nghị chính xác', value: '90%' },
    { label: 'Ngày diễn ra hội nghị', value: '80%' },
    { label: 'Địa điểm tổ chức', value: '80%' },
    { label: 'Ngày nộp bài', value: '80%' },
    { label: 'Ngày thông báo', value: '80%' },
    { label: 'Ngày camera ready', value: '80%' },
    { label: 'Ngày register', value: '80%' }
  ]

  const mainResult = evaluationResults.find(
    r => r.label === 'Tìm link hội nghị chính xác'
  )
  const otherResults = evaluationResults.filter(
    r => r.label !== 'Tìm link hội nghị chính xác'
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
            <p className='m-0 text-[125px]'>ĐẠI HỌC KHOA HỌC TỰ NHIÊN</p>
            <p className='m-0 text-[113px]'>KHOA CÔNG NGHỆ THÔNG TIN</p>
          </div>
        </div>
        <div className='flex-grow px-[60px] text-center'>
          <h1 className='mb-[63px] text-[340px] font-extrabold leading-tight'>
            GLOBAL CONFERENCE & JOURNAL HUB
          </h1>
          <h2 className='mb-[31px] text-[200px] font-bold'>
            HỆ THỐNG TÌM KIẾM KHOA HỌC TÍCH HỢP MÔ HÌNH NGÔN NGỮ LỚN
          </h2>
        </div>
        <div className='ml-[94px] flex flex-shrink-0 gap-[94px] text-[113px] leading-relaxed'>
          <div className='text-left'>
            <p className='m-0'>GIẢNG VIÊN HƯỚNG DẪN:</p>
            <ul className='m-0 list-none p-0'>
              <li>ThS. Hồ Thị Hoàng Vy</li>
              <li>PGS.TS Lê Nguyễn Hoài Nam</li>
            </ul>
          </div>
          <div className='text-left'>
            <p className='m-0'>SINH VIÊN THỰC HIỆN:</p>
            <ul className='m-0 list-none p-0'>
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

      {/* MAIN CONTENT */}
      <div className='flex flex-1 gap-[156px] p-[125px]'>
        {/* Column 1: Bối cảnh, Tóm tắt & Giải pháp (Giữ nguyên không đổi) */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[125px] shadow-sm'>
          <div className='mb-[94px]'>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              1. Bối cảnh & Mục tiêu
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Đồ án giải quyết vấn đề khó khăn và tốn thời gian của các nhà khoa
              học trong việc tìm kiếm, lựa chọn các hội nghị và tạp chí khoa học
              phù hợp.
            </p>
            <p className='mb-[94px] text-[113px] leading-relaxed'>
              Mục tiêu là xây dựng một ứng dụng web toàn diện để tự động hóa quy
              trình này, cung cấp một công cụ thông minh, thân thiện và đáng tin
              cậy.
            </p>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              2. Tóm tắt đồ án
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Ứng dụng web thông minh với khả năng thu thập dữ liệu tự động từ
              hàng ngàn nguồn thông qua{' '}
              <strong className='text-[#e67e22]'>LLM</strong>, cung cấp các tính
              năng tìm kiếm, quản lý và tương tác đa dạng.
            </p>
          </div>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              3. Giải pháp & Công nghệ
            </h3>
            <div className='mb-[94px] flex flex-1 flex-col'>
              <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
                Quy trình thu thập dữ liệu bằng LLM
              </h4>
              <ul className='m-0 mb-[78px] list-disc pl-[94px] text-[113px]'>
                <li className='mb-[31px]'>Tìm trang web bằng Google API.</li>
                <li className='mb-[31px]'>LLM (Gemini) phân loại trang chủ.</li>
                <li className='mb-[31px]'>LLM (Gemini) bóc tách thông tin.</li>
              </ul>
              <div className='flex h-[400px] w-full items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
                [SƠ ĐỒ]
              </div>
            </div>
            <div className='flex flex-1 flex-col'>
              <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
                Kiến trúc Microservices
              </h4>
              <ul className='m-0 mb-[78px] list-disc pl-[94px] text-[113px]'>
                <li className='mb-[31px]'>
                  <strong>Frontend:</strong> Next.js, TailwindCSS.
                </li>
                <li className='mb-[31px]'>
                  <strong>Backend:</strong> NestJS, BullMQ.
                </li>
                <li className='mb-[31px]'>
                  <strong>Database:</strong> PostgreSQL, MongoDB.
                </li>
              </ul>
              <div className='flex h-[400px] w-full items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
                [SƠ ĐỒ]
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Các tính năng chính (ĐÃ CẬP NHẬT) */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[125px] shadow-sm'>
          <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
            4. Các tính năng chính
          </h3>
          <div className='flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Đối với người dùng
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px] text-[113px] leading-relaxed'>
              <li className='mb-[31px]'>
                <strong>Tìm kiếm nâng cao:</strong> Theo chủ đề, thời gian, địa
                điểm, xếp hạng...
              </li>
              <li className='mb-[31px]'>
                <strong>Quản lý cá nhân:</strong> Theo dõi hội nghị, nhận thông
                báo, thêm vào lịch.
              </li>
              <li className='mb-[31px]'>
                <strong>Tương tác & Đóng góp:</strong> Đánh giá, bình luận, đề
                xuất hội nghị.
              </li>
            </ul>

            {/* BƯỚC 2: THAY THẾ PLACEHOLDER BẰNG COMPONENT GIAO DIỆN */}
            <div className='mb-[78px] flex w-full  items-center justify-center overflow-hidden rounded-[31px] border-[6px] border-dashed border-gray-400 bg-white p-[31px]'>
              {/* THAY ĐỔI Ở ĐÂY: Thêm class w-full */}
              <div className='w-full'>
                <ConferenceSearchInterface />
              </div>
            </div>
            <div className='flex w-full flex-1 items-center justify-center overflow-hidden rounded-[31px] border-[6px] border-dashed border-gray-400 bg-white p-[31px]'>
              {/* THAY ĐỔI Ở ĐÂY: Thêm class w-full */}
              <div className='w-full'>
                <ConferenceDetailInterface />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Live Chat & Kết quả đánh giá (Giữ nguyên không đổi) */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[125px] shadow-sm'>
          <div className='mb-[94px] flex flex-1 flex-col'>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              5. Chatbot Đa Tác Tử
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Điều phối câu hỏi đến các chatbot chuyên môn (tìm kiếm, hỏi
              đáp,...) để trả lời chính xác và tự nhiên.
            </p>
            <div className='flex w-full flex-1 items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 p-[31px]'>
              <ChatbotInterface />
            </div>
          </div>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              6. Kết quả đánh giá
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Hệ thống cho thấy hiệu quả vượt trội trong việc tự động hóa thu
              thập dữ liệu:
            </p>
            {mainResult && (
              <div className='mb-[62px] rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-100 p-[94px] text-center'>
                <p className='mb-[31px] text-[113px] font-semibold text-gray-700'>
                  {mainResult.label}
                </p>
                <p className='text-[280px] font-extrabold text-[#e67e22]'>
                  {mainResult.value}
                </p>
              </div>
            )}
            <div className='grid grid-cols-2 gap-[62px]'>
              {otherResults.map((result, index) => (
                <div
                  key={index}
                  className='flex flex-col items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-100 p-[62px]'
                >
                  <span className='mb-[31px] text-center text-[113px] text-gray-700'>
                    {result.label}
                  </span>
                  <span className='text-[220px] font-extrabold text-[#e67e22]'>
                    {result.value}
                  </span>
                </div>
              ))}
            </div>
            <p className='mt-[94px] text-[113px] leading-relaxed'>
              <strong className='text-[#c0392b]'>Hạn chế:</strong> Độ chính xác
              phụ thuộc vào cấu trúc website, thông tin dạng ảnh, hoặc các trang
              yêu cầu đăng nhập.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Poster
