import React from 'react';
import Image from 'next/image'; // Import Image từ next/image

interface ProfileTabProps {
  // Bạn có thể định nghĩa props nếu cần
}

const ProfileTab: React.FC<ProfileTabProps> = () => {
  // Dữ liệu profile mẫu (đã chỉnh sửa cho hội nghị và thông tin liên hệ)
  const profileData = {
    name: 'Nguyễn Văn A',
    username: 'nguyenvana',
    bio: 'Một người yêu thích công nghệ và hội nghị web.',
    avatarUrl: '/s1.png', // URL ảnh, có thể là local hoặc remote
    conferenceCount: 50, // Đổi từ postsCount thành conferenceCount
    followingConferenceCount: 25, // Đổi từ following thành followingConferenceCount
    email: 'nguyenvana@example.com',
    phone: '123-456-7890',
    location: 'Hà Nội, Việt Nam',
  };

  // SVG path cho icon email
  const emailIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
</svg>

  );

  // SVG path cho icon điện thoại
  const phoneIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clip-rule="evenodd" />
</svg>

  );


  // SVG path cho icon địa điểm
  const locationIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
</svg>

  );


  return (
      <div className="max-w-5xl mx-auto bg-background overflow-hidden py-4">
        {/* Phần Header Profile */}
        <div className="px-6 py-4">
          <div className="flex items-start"> {/* Đổi items-center thành items-start để align top */}
            <div className="relative h-24 w-24 rounded-full border-2 border-blue-500 overflow-hidden">
              <Image // Sử dụng component Image từ next/image
                src={profileData.avatarUrl}
                alt={`Avatar của ${profileData.name}`}
                fill // Để ảnh lấp đầy container
                style={{ objectFit: 'cover' }} // Để đảm bảo ảnh không bị méo và cover container
                sizes="(max-width: 768px) 100vw, 25vw" // Tùy chỉnh sizes cho responsive (ví dụ)
              />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold ">{profileData.name}</h2>
              <p className=" text-gray-600">@{profileData.username}</p>
              <p className="mt-2 ">{profileData.bio}</p>

              {/* Thông tin liên hệ */}
              <div className="mt-3 space-y-1">
                <div className='flex items-center gap-2'>
                  {emailIcon}
                  <a href={`mailto:${profileData.email}`} className="text-blue-500 hover:underline">
                    {profileData.email}
                  </a>
                </div>
                <div className='flex items-center gap-2'>
                  {phoneIcon}
                  <span>{profileData.phone}</span>
                </div>
                <div className='flex items-center gap-2'>
                  {locationIcon}
                  <span>{profileData.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần Stats Profile - Đã chỉnh sửa */}
        <div className="bg-background-secondary px-6 py-4 border-t border-gray-200">
          <div className="flex justify-around">
            <div>
              <p className="font-semibold ">{profileData.conferenceCount}</p>
              <p className=" text-sm">Hội nghị</p> {/* Đổi label */}
            </div>
            {/* Đã xóa phần "Người theo dõi" */}
            <div>
              <p className="font-semibold ">{profileData.followingConferenceCount}</p>
              <p className=" text-sm">Hội nghị đang theo dõi</p> {/* Đổi label */}
            </div>
          </div>
        </div>

        {/* Phần Hội nghị gần đây - Đã chỉnh sửa tiêu đề và placeholder */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold  mb-4">Hội nghị gần đây</h3> {/* Đổi tiêu đề */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder cho các hội nghị */}
            <div className="bg-background rounded-lg shadow-md p-4">
              <h4 className="font-semibold ">Hội nghị công nghệ A</h4> {/* Đổi placeholder */}
              <p className=" text-sm">Mô tả ngắn gọn hội nghị A...</p> {/* Đổi placeholder */}
            </div>
            <div className="bg-background rounded-lg shadow-md p-4">
              <h4 className="font-semibold ">Hội nghị web toàn cầu</h4> {/* Đổi placeholder */}
              <p className=" text-sm">Mô tả ngắn gọn hội nghị web...</p> {/* Đổi placeholder */}
            </div>
            <div className="bg-background rounded-lg shadow-md p-4">
              <h4 className="font-semibold ">Hội nghị AI và tương lai</h4> {/* Đổi placeholder */}
              <p className=" text-sm">Mô tả ngắn gọn hội nghị AI...</p> {/* Đổi placeholder */}
            </div>
            {/* ... Thêm các hội nghị khác ... */}
          </div>
        </div>

        {/* Phần Action (ví dụ: Chỉnh sửa Profile, ...) - Placeholder */}
        <div className="px-6 py-4 bg-background-secondary border-t border-gray-200 text-right">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Chỉnh sửa Profile
          </button>
          
        </div>
      </div>
  );
};

export default ProfileTab;