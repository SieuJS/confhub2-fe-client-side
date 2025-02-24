import React from 'react';
import Image from 'next/image';

interface SettingTabProps {
  // Định nghĩa props cho component nếu cần
}

const SettingTab: React.FC<SettingTabProps> = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Setting</h2>
            <p className="text-gray-500">23th Jan 2024</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white rounded-full p-2 shadow-md">
              {/* Icon email */}
              ✉️
            </button>
            <button className="bg-white rounded-full p-2 shadow-md">
              {/* Icon notification */}
              🔔
            </button>
            <div className="flex items-center">
              <Image
                src="/favicon.ico"
                alt="User Avatar"
                className="rounded-full h-8 w-8"
                width={32}
                height={32}
              /> {/* Thay /avatar.png bằng đường dẫn avatar của bạn */}
              <div className="ml-2">
                <p className="text-sm font-semibold">Tran Van A</p>
                <p className="text-xs text-gray-500">Conference manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded-md p-4">
            <p className="text-gray-500">Total users</p>
            <p className="text-2xl font-semibold">225.125k</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4">
            <p className="text-gray-500">Total conferences</p>
            <p className="text-2xl font-semibold">225.125k</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4">
            <p className="text-gray-500">Total journals</p>
            <p className="text-2xl font-semibold">225.125k</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingTab;