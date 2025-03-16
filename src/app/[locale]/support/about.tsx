'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

const About = () => {
  const t = useTranslations('')

  return (
    <>
      <div className='min-h-screen bg-[--background] '>
        {/* Hero Section */}
        <section className='relative bg-gradient-to-r from-[--primary] to-[--secondary] py-20 text-[--button-text]'>
          {/* Removed the absolute positioning and opacity as it was causing issues with the theme colors.  A solid gradient is often better. */}
          <div className='container relative z-10 mx-auto px-4'>
            <div className='text-center'>
              <h1 className='mb-4 text-4xl  md:text-6xl'>Về HCMUS</h1>
              <p className='mx-auto max-w-3xl text-xl leading-relaxed md:text-2xl'>
                Nền tảng tổng hợp thông tin hội nghị và tạp chí khoa học toàn
                diện.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className='px-4 py-16 md:px-8'>
          <div className='container mx-auto'>
            <div className='grid items-center gap-12 md:grid-cols-2'>
              <div>
                <h2 className='mb-6 text-3xl font-bold text-[--primary] md:text-4xl'>
                  Sứ Mệnh Của Chúng Tôi
                </h2>
                <p className='text-lg leading-relaxed text-[--text-secondary]'>
                  HCMUS được xây dựng với mục tiêu giúp các nhà nghiên cứu, học
                  giả và sinh viên dễ dàng tìm kiếm và tiếp cận các sự kiện và
                  ấn phẩm khoa học phù hợp với lĩnh vực của mình. Chúng tôi tin
                  rằng việc kết nối cộng đồng nghiên cứu là chìa khóa cho sự
                  phát triển của khoa học.
                </p>
              </div>
              {/* Image Placeholder */}
              <div className='relative overflow-hidden rounded-lg shadow-lg'>
                <Image
                  src='/bg-2.jpg' // Replace!
                  alt='Researchers Collaborating'
                  width={600}
                  height={400}
                  className='h-full w-full object-cover'
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features/Services Section */}
        <section className='bg-[--background-secondary] px-4 py-16 md:px-8'>
          <div className='container mx-auto'>
            <h2 className='mb-8 text-center text-3xl font-bold text-[--primary] md:text-4xl'>
              Chúng Tôi Cung Cấp
            </h2>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {/* Feature 1: Comprehensive Data */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5'
                    />
                  </svg>
                  Dữ Liệu Toàn Diện
                </div>
                <p className='text-[--text-secondary]'>
                  Tổng hợp thông tin từ nhiều lĩnh vực khoa học, bao gồm khoa
                  học tự nhiên, khoa học xã hội, kỹ thuật, y học và các lĩnh vực
                  liên ngành.
                </p>
              </div>

              {/* Feature 2: Daily Updates */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'
                    />
                  </svg>
                  Cập Nhật Hàng Ngày
                </div>
                <p className='text-[--text-secondary]'>
                  Thông tin được cập nhật hàng ngày và tự động tổng hợp từ các
                  nguồn chính thức, đảm bảo tính mới nhất và chính xác.
                </p>
              </div>

              {/* Feature 3: Free Access */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z'
                    />
                  </svg>
                  Truy Cập Miễn Phí
                </div>
                <p className='text-[--text-secondary]'>
                  Các tính năng cơ bản hoàn toàn miễn phí. Tính năng nâng cao có
                  thể yêu cầu tài khoản (có thể có các gói thành viên trong
                  tương lai).
                </p>
              </div>

              {/* Feature 4: User Accounts */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
                    />
                  </svg>
                  Tài Khoản và Lợi Ích
                </div>
                <p className='text-[--text-secondary]'>
                  Đăng ký tài khoản để đăng tải thông tin, lưu hội nghị, nhận
                  thông báo, sử dụng chatbot tư vấn và nhiều lợi ích khác.
                </p>
              </div>

              {/* Feature 5: Smart Search */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
                    />
                  </svg>
                  Tìm Kiếm và Lọc Thông Minh
                </div>
                <p className='text-[--text-secondary]'>
                  Dễ dàng tìm kiếm hội nghị/tạp chí theo tên, từ khóa, lĩnh vực,
                  thời gian, địa điểm và nhiều tiêu chí khác.
                </p>
              </div>

              {/* Feature 6: AI Chatbot */}
              <div className='bg-bachground rounded-lg p-6 shadow-md'>
                <div className='mb-3 text-2xl font-semibold text-[--secondary]'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='mr-2 inline-block h-8 w-8'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                    />
                  </svg>
                  Chatbot AI Hỗ Trợ
                </div>
                <p className='text-[--text-secondary]'>
                  Chatbot tư vấn thông tin hội nghị/tạp chí, hỗ trợ upload file
                  và gợi ý hội nghị phù hợp với bài báo của bạn.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About
