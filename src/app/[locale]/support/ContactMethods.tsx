import React from 'react'

const ContactMethods: React.FC = () => {
  // SVG Paths (ví dụ từ Heroicons Outline)
  const envelopePath =
    'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75'
  const phonePath =
    'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z'
  // Icon trong ảnh gốc hơi khác, đây là path của Lifebuoy từ Heroicons
  const supportPath =
    'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
  // Nếu muốn icon giống hệt ảnh gốc (trông giống icon settings/target), bạn cần tìm path khác.
  // Ví dụ path gần giống (Target/Crosshair):
  // const supportPath = "M15 12a3 3 0 11-6 0 3 3 0 016 0z M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z M12 5v1m0 10v1m-7-6h1m10 0h1";

  return (
    <section className='bg-white py-8 dark:bg-gray-900 lg:py-16'>
      <div className='mx-auto max-w-screen-xl px-4'>
        <div className='grid grid-cols-1 gap-8 text-center md:grid-cols-3'>
          {/* Email Us */}
          <div className='flex flex-col items-center'>
            <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5} // hoặc 2 tùy vào style bạn muốn
                stroke='currentColor'
                className='h-6 w-6 text-gray-600 dark:text-gray-400' // Màu sắc được kế thừa từ text color
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d={envelopePath}
                />
              </svg>
            </div>
            <h3 className='mb-2 text-xl font-bold dark:text-white'>
              Email us:
            </h3>
            <p className='mb-3 px-4 text-sm text-gray-500 dark:text-gray-400'>
              Email us for general queries, including marketing and partnership
              opportunities.
            </p>
            <a
              href='mailto:hello@flowbite.com'
              className='font-medium text-blue-600 hover:underline dark:text-blue-500'
            >
              hello@flowbite.com
            </a>
          </div>

          {/* Call Us */}
          <div className='flex flex-col items-center'>
            <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6 text-gray-600 dark:text-gray-400'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d={phonePath}
                />
              </svg>
            </div>
            <h3 className='mb-2 text-xl font-bold dark:text-white'>Call us:</h3>
            <p className='mb-3 px-4 text-sm text-gray-500 dark:text-gray-400'>
              Call us to speak to a member of our team. We are always happy to
              help.
            </p>
            <a
              href='tel:+16467865060'
              className='font-medium text-blue-600 hover:underline dark:text-blue-500'
            >
              +1 (646) 786-5060
            </a>
          </div>

          {/* Support */}
          <div className='flex flex-col items-center'>
            <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6 text-gray-600 dark:text-gray-400'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d={supportPath}
                />
              </svg>
            </div>
            <h3 className='mb-2 text-xl font-bold dark:text-white'>Support</h3>
            <p className='mb-3 px-4 text-sm text-gray-500 dark:text-gray-400'>
              Email us for general queries, including marketing and partnership
              opportunities. {/* Xem xét đổi text này */}
            </p>
            <a
              href='/support-center'
              className='inline-block rounded-lg border border-blue-600 bg-transparent px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-700'
            >
              Support center
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactMethods
