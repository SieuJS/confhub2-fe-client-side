// Poster.tsx

'use client'

import React from 'react'

const Poster: React.FC = () => {
  // Kích thước A0 ngang ở độ phân giải cao (~300 DPI)
  const A0_WIDTH_PX = 14043
  const A0_HEIGHT_PX = 9933

  return (
    <div
      className='relative flex flex-col overflow-hidden bg-white text-gray-800 shadow-2xl'
      style={{
        width: `${A0_WIDTH_PX}px`,
        height: `${A0_HEIGHT_PX}px`,
        fontFamily: 'Arial, sans-serif',
        // Scale nhỏ lại để xem trên màn hình. Bỏ transform này khi chuẩn bị file in
        transform: 'scale(0.08)', // Thu nhỏ còn 8%
        transformOrigin: 'top left',
        margin: 'auto'
      }}
    >
      {/* HEADER: Chiều cao của header sẽ tự động dựa trên nội dung */}
      <header className='flex items-center justify-between bg-[#0056b3] px-[188px] py-[125px] font-bold text-white shadow-md'>
        {/* Left Section: Logo & School Info */}
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

        {/* Center Section: Title */}
        <div className='flex-grow px-[60px] text-center'>
          <h1 className='mb-[63px] text-[340px] font-extrabold leading-tight'>
            GLOBAL CONFERENCE & JOURNAL HUB
          </h1>
          <h2 className='mb-[31px] text-[200px] font-bold'>
            HỆ THỐNG TÌM KIẾM KHOA HỌC TÍCH HỢP MÔ HÌNH NGÔN NGỮ LỚN
          </h2>
        </div>

        {/* Right Section: Team Info - ĐÃ ĐƯỢC TÁCH THÀNH 2 CỘT */}
        <div className='ml-[94px] flex flex-shrink-0 gap-[94px] text-[113px] leading-relaxed'>
          {/* Cột 1: Giảng viên hướng dẫn */}
          <div className='text-left'>
            <p className='m-0'>GIẢNG VIÊN HƯỚNG DẪN:</p>
            <ul className='m-0 list-none p-0'>
              <li>ThS. Hồ Thị Hoàng Vy</li>
              <li>PGS.TS Lê Nguyễn Hoài Nam</li>
            </ul>
          </div>

          {/* Cột 2: Sinh viên thực hiện */}
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

      {/* MAIN CONTENT - `flex-1` sẽ làm cho khu vực này chiếm hết không gian dọc còn lại */}
      <div className='flex flex-1 gap-[156px] p-[125px]'>
        {/* Column 1: Introduction & Problem */}
        <div className='flex flex-1 flex-col justify-between rounded-[47px] border-[3px] border-gray-200 p-[125px] shadow-sm'>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              1. Bối cảnh & Mục tiêu
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Đồ án giải quyết vấn đề khó khăn và tốn thời gian của các nhà khoa
              học trong việc tìm kiếm, lựa chọn các hội nghị và tạp chí khoa học
              phù hợp.
            </p>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Mục tiêu là xây dựng một ứng dụng web toàn diện Global Conference
              & Journal Hub để tự động hóa quy trình này, cung cấp một công cụ
              thông minh, thân thiện và đáng tin cậy cho cộng đồng nghiên cứu.
            </p>
          </div>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              2. Tóm tắt đồ án
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Ứng dụng web thông minh với khả năng thu thập dữ liệu tự động từ
              hàng ngàn nguồn thông qua{' '}
              <strong className='text-[#e67e22]'>LLM</strong> và cung cấp các
              tính năng tìm kiếm, quản lý, tương tác đa dạng.
            </p>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Điểm nổi bật: Tích hợp{' '}
              <strong className='text-[#e67e22]'>LLM (Gemini)</strong> để tự
              động hóa việc bóc tách thông tin phức tạp.
            </p>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Kế thừa/Sử dụng lại: Google Custom Search API, mô hình Gemini, các
              thư viện/framework (Next.js, NestJS, RabbitMQ...).
            </p>
          </div>
        </div>

        {/* Column 2: Solution & Architecture */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[125px] shadow-sm'>
          <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
            3. Giải pháp & Công nghệ cốt lõi
          </h3>
          <p className='mb-[78px] text-[113px] leading-relaxed'>
            Hệ thống được xây dựng dựa trên các giải pháp công nghệ hiện đại:
          </p>

          {/* Section cho sơ đồ 1 */}
          <div className='mb-[94px] flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Quy trình thu thập dữ liệu tự động bằng LLM
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                Sử dụng Google Custom Search API để tìm trang web tiềm năng.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                LLM (Gemini) phân loại và xác định trang chủ hội nghị.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                LLM (Gemini) tự động bóc tách thông tin chi tiết (tên, thời
                gian, địa điểm, chủ đề...).
              </li>
            </ul>
            <div className='flex w-full flex-1 items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
              [SƠ ĐỒ QUY TRÌNH THU THẬP DỮ LIỆU BẰNG LLM]
            </div>
          </div>

          {/* Section cho sơ đồ 2 */}
          <div className='flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Kiến trúc Microservices
            </h4>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Thiết kế linh hoạt, dễ bảo trì và mở rộng, bao gồm:
            </p>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Frontend:</strong> Next.js, TailwindCSS (người dùng &
                quản trị).
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Backend:</strong> Node.js (NestJS), chia dịch vụ, giao
                tiếp qua RabbitMQ.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Cơ sở dữ liệu:</strong> PostgreSQL (dữ liệu cấu trúc),
                MongoDB (dữ liệu linh hoạt).
              </li>
            </ul>
            <div className='flex w-full flex-1 items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
              [SƠ ĐỒ KIẾN TRÚC MICROSERVICES]
            </div>
          </div>
        </div>

        {/* Column 3: Key Features */}
        <div className='flex flex-1 flex-col rounded-[47px] border-[3px] border-gray-200 p-[125px] shadow-sm'>
          <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
            4. Các tính năng chính
          </h3>

          {/* Section cho ảnh 1 */}
          <div className='mb-[94px] flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Đối với người dùng
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Tìm kiếm nâng cao:</strong> Theo chủ đề, thời gian, địa
                điểm, xếp hạng...
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Quản lý cá nhân:</strong> Theo dõi hội nghị, nhận thông
                báo, thêm vào lịch.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Tương tác & Đóng góp:</strong> Đánh giá, bình luận, đề
                xuất hội nghị.
              </li>
            </ul>
            <div className='flex w-full flex-1 items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
              [ẢNH GIAO DIỆN NGƯỜI DÙNG]
            </div>
          </div>

          {/* Section cho ảnh 2 */}
          <div className='mb-[94px] flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Tính năng thông minh
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Chatbot Đa Tác Tử:</strong> Điều phối câu hỏi đến các
                chatbot chuyên môn để truy vấn CSDL và trả lời chính xác.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Trực quan hóa dữ liệu:</strong> Công cụ vẽ biểu đồ tùy
                chỉnh để phân tích, so sánh xu hướng hội nghị.
              </li>
            </ul>
            <div className='flex w-full flex-1 items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
              [ẢNH GIAO DIỆN CHATBOT & BIỂU ĐỒ]
            </div>
          </div>

          {/* New Section: Đối với Quản trị viên */}
          <div className='flex flex-1 flex-col'>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Đối với Quản trị viên
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Quản lý toàn diện:</strong> Kiểm duyệt, thêm/sửa/xóa
                thông tin hội nghị và người dùng.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Giám sát hệ thống:</strong> Theo dõi hiệu quả quá trình
                thu thập dữ liệu qua biểu đồ.
              </li>
            </ul>
            <div className='flex w-full flex-1 items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
              [ẢNH GIAO DIỆN QUẢN TRỊ]
            </div>
          </div>
        </div>

        {/* Column 4: Results & Learnings */}
        <div className='flex flex-1 flex-col justify-between rounded-[47px] border-[3px] border-gray-200 p-[125px] shadow-sm'>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              5. Kết quả đánh giá
            </h3>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Hệ thống được đánh giá trên bộ dữ liệu 921 hội nghị (Core2023) và
              cho kết quả tích cực:
            </p>
            <p className='mb-[78px] text-center text-[113px] leading-relaxed'>
              <span className='block text-[250px] font-bold text-[#e67e22]'>
                93.6%
              </span>
              Độ chính xác trong việc tìm đúng link hội nghị.
            </p>
            <p className='mb-[78px] text-center text-[113px] leading-relaxed'>
              <span className='block text-[250px] font-bold text-[#e67e22]'>
                88%
              </span>
              Độ chính xác trong việc trích xuất thông tin (từ các link đúng).
            </p>
            <div className='mb-[94px] flex h-[1094px] w-full items-center justify-center rounded-[31px] border-[6px] border-dashed border-gray-400 bg-gray-200 text-[125px] font-bold text-gray-600'>
              [BIỂU ĐỒ ĐÁNH GIÁ KẾT QUẢ]
            </div>
            <p className='mb-[78px] text-[113px] leading-relaxed'>
              Hạn chế chính: Cấu trúc web phức tạp, thông tin trong ảnh, yêu cầu
              đăng nhập.
            </p>
          </div>
          <div>
            <h3 className='mb-[94px] border-b-[16px] border-[#0056b3] pb-[47px] text-[188px] font-bold text-[#0056b3]'>
              6. Tự đánh giá & Bài học
            </h3>
            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Điểm làm tốt:
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                Vận dụng thành công LLM giải quyết vấn đề thực tế.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                Kiến trúc Microservices linh hoạt, có khả năng mở rộng.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                Giao diện thân thiện, đa dạng tính năng.
              </li>
            </ul>

            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Khó khăn & Khắc phục:
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Xử lý dữ liệu phi cấu trúc:</strong> Tối ưu prompt
                engineering, kiểm duyệt bán tự động.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                <strong>Giao tiếp giữa microservices:</strong> Sử dụng RabbitMQ
                hiệu quả, thiết kế API rõ ràng.
              </li>
            </ul>

            <h4 className='mb-[78px] text-[125px] font-bold text-[#2980b9]'>
              Bài học rút ra:
            </h4>
            <ul className='m-0 mb-[78px] list-disc pl-[94px]'>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                Tầm quan trọng của thiết kế kiến trúc.
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                Khả năng thích nghi & học hỏi công nghệ mới (LLM,
                Microservices).
              </li>
              <li className='mb-[31px] text-[113px] leading-relaxed'>
                Kỹ năng làm việc nhóm & quản lý dự án hiệu quả.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Poster
