import React from 'react'
import Image from 'next/image' // Import Image từ next/image

interface ProfileTabProps {
  // Bạn có thể định nghĩa props nếu cần
}

const ProfileTab: React.FC<ProfileTabProps> = () => {
  // Dữ liệu profile mẫu (đã chỉnh sửa cho hội nghị và thông tin liên hệ)
  const profileData = {
    name: 'Nguyễn Văn A',
    bio: 'Một người yêu thích công nghệ và hội nghị web.',
    email: 'nguyenvana@example.com'
  }

  // SVG path cho icon email
  const emailIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      className='size-6'
    >
      <path d='M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z' />
      <path d='M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z' />
    </svg>
  )

  return (
    <div className='mx-auto max-w-5xl overflow-hidden bg-background py-4'>
      {/* Phần Header Profile */}
      <div className='px-6 py-4'>
        <div className='flex items-start'>
          {' '}
          {/* Đổi items-center thành items-start để align top */}
          <div className='relative h-24 w-24 overflow-hidden rounded-full border-2 border-blue-500'>
            <Image // Sử dụng component Image từ next/image
              src={'/s1.png'} // Đường dẫn ảnh
              alt={`Avatar của ${profileData.name}`}
              fill // Để ảnh lấp đầy container
              style={{ objectFit: 'cover' }} // Để đảm bảo ảnh không bị méo và cover container
              sizes='(max-width: 768px) 100vw, 25vw' // Tùy chỉnh sizes cho responsive (ví dụ)
            />
          </div>
          <div className='ml-4'>
            <h2 className='text-2xl font-semibold '>{profileData.name}</h2>

            <p className='mt-2 '>{profileData.bio}</p>

            {/* Thông tin liên hệ */}
            <div className='mt-3 space-y-1'>
              <div className='flex items-center gap-2'>
                {emailIcon}
                <a
                  href={`mailto:${profileData.email}`}
                  className='text-blue-500 hover:underline'
                >
                  {profileData.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần Action (ví dụ: Chỉnh sửa Profile, ...) - Placeholder */}
      <div className='border-t border-gray-200 bg-background px-6 py-4 text-right'>
        <button className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'>
          Chỉnh sửa Profile
        </button>
      </div>
    </div>
  )
}

export default ProfileTab
