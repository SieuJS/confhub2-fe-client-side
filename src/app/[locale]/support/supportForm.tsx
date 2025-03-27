import React, { useState } from 'react' // Import useState
import Image from 'next/image'

const SupportForm: React.FC = () => {
  // State để quản lý trạng thái checkbox đồng ý điều khoản
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Kiểm tra lại lần nữa nếu chưa đồng ý thì không submit (dù nút đã disabled)
    if (!agreedToTerms) {
      alert('Bạn cần đồng ý với điều khoản và chính sách bảo mật để tiếp tục.')
      return
    }

    console.log('Form submitted!')
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    // Lưu ý: Giá trị của checkbox (nếu name="termsAgreement") sẽ là 'on' nếu được tích,
    // hoặc không có trong data nếu không được tích.
    console.log(data)
    // Thêm logic xử lý submit ở đây (gửi API, etc.)
  }

  return (
    <>
      {/* Phần Header với thẻ Image nền - Tăng chiều cao */}
      <section className='relative h-96 md:h-[500px] lg:h-[550px]'>
        {' '}
        {/* Tăng chiều cao ở đây */}
        <Image
          src='/bg-2.jpg' // Đã đổi thành /bg-2.jpg (đảm bảo ảnh này có trong thư mục public)
          alt='Person working on a laptop'
          layout='fill'
          objectFit='cover'
          quality={75}
          priority
          className=''
        />
        <div className='absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/80'></div>
        <div className='absolute inset-0 z-10 flex flex-col items-center px-4 pt-32 text-center'>
          <h1 className='mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl'>
            Contact Us
          </h1>
          <p className='mb-8 max-w-screen-md font-light text-gray-300 sm:text-xl'>
            We use an agile approach to test assumptions and connect with the
            needs of your audience early and often.
          </p>
        </div>
      </section>

      {/* Phần Form */}
      <div className='bg-gray-50 pb-8 dark:bg-gray-900 lg:pb-16'>
        <div
          className='relative z-20 mx-auto -mt-24 max-w-screen-md rounded-lg bg-white p-6 px-4 shadow-xl dark:bg-gray-800 sm:p-8 md:-mt-56 lg:p-10' // Điều chỉnh margin âm nếu cần sau khi tăng chiều cao header
        >
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Trường Chủ đề */}
            <div>
              <label
                htmlFor='subject'
                className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'
              >
                Chủ đề <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='subject'
                name='subject'
                className='dark:shadow-sm-light block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                placeholder='Hãy cho chúng tôi biết chúng tôi có thể giúp gì cho bạn'
                required
              />
            </div>

            {/* Trường Loại (Dropdown) */}
            <div>
              <label
                htmlFor='type'
                className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'
              >
                Loại yêu cầu <span className='text-red-500'>*</span>
              </label>
              <select
                id='type'
                name='type'
                className='dark:shadow-sm-light block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                required
                defaultValue=''
              >
                <option value='' disabled>
                  -- Chọn loại yêu cầu --
                </option>
                <option value='report'>Report</option>
                <option value='contact'>Contact</option>
              </select>
            </div>

            {/* Trường Tin nhắn */}
            <div className='sm:col-span-2'>
              <label
                htmlFor='message'
                className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400'
              >
                Nội dung tin nhắn <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='message'
                name='message'
                rows={6}
                className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                placeholder='Nhập nội dung chi tiết...'
                required
              ></textarea>
            </div>

            {/* Checkbox Đồng ý điều khoản */}
            <div className='flex items-start'>
              <div className='flex h-5 items-center'>
                <input
                  id='terms'
                  aria-describedby='terms-description'
                  name='termsAgreement' // Thêm name nếu muốn gửi giá trị 'on' khi submit
                  type='checkbox'
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  required // Trình duyệt sẽ báo lỗi nếu chưa check khi submit
                  className='focus:ring-3 h-4 w-4 rounded border border-gray-300 bg-gray-50 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label
                  htmlFor='terms'
                  className='font-light text-gray-500 dark:text-gray-300'
                >
                  Tôi đồng ý với{' '}
                  <a
                    href='#'
                    className='font-medium text-blue-600 hover:underline dark:text-blue-500'
                  >
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a
                    href='#'
                    className='font-medium text-blue-600 hover:underline dark:text-blue-500'
                  >
                    Chính sách bảo mật
                  </a>
                  .
                </label>
                {/* Mô tả thêm nếu cần */}
                {/* <p id="terms-description" className="text-xs font-light text-gray-500 dark:text-gray-400">We need your agreement to proceed.</p> */}
              </div>
            </div>

            {/* Disclaimer cũ - Có thể giữ lại hoặc xóa nếu checkbox đã đủ rõ ràng */}
            {/*
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By submitting this form you agree to our{' '}
              <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                terms and conditions
              </a>{' '}
              and our{' '}
              <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                privacy policy
              </a>{' '}
              which explains how we may collect, use and disclose your personal information including to third parties.
            </p>
             */}

            {/* Nút Submit - Thêm disabled và styling khi disabled */}
            <button
              type='submit'
              disabled={!agreedToTerms} // Vô hiệu hóa nút nếu chưa đồng ý
              className={`rounded-lg bg-blue-700 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto ${
                !agreedToTerms ? 'cursor-not-allowed opacity-50' : '' // Thêm class khi disabled
              }`}
            >
              Send message
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default SupportForm
