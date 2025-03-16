"use client";

import { Link } from '@/src/navigation';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface RegisterFormProps {
  // Không cần onSignUpSuccess nữa, vì chuyển hướng trực tiếp trong component
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const router = useRouter(); // Khởi tạo router
  const pathname = usePathname();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true); // Bắt đầu loading
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/signup', { // Use absolute URL for server-side
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Đăng ký thành công
        console.log('Đăng ký thành công!', data);

        if (typeof window !== 'undefined') {

          // --- Prepend Locale Prefix ---
          const localePrefix = pathname.split('/')[1]; // Extract locale prefix (e.g., "en")
          const pathWithLocale = `/${localePrefix}`; // Construct path with locale

          router.push(pathWithLocale); // Use path with locale for internal navigation
        } else {
          console.error("Error in signin");
        }

        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        // Xử lý lỗi đăng ký
        setError(data.message || 'Đăng ký không thành công. Vui lòng kiểm tra thông tin.');
      }
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error);
      setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false); // Kết thúc loading, bất kể thành công hay thất bại
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Đăng ký tài khoản</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstname">
                Tên
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="firstname"
                type="text"
                placeholder="Tên"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastname">
                Họ
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="lastname"
                type="text"
                placeholder="Họ"
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Mật khẩu
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm italic mt-2">{error}</p>}
            <div className="flex items-center justify-between mt-8">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={isLoading} // Vô hiệu hóa nút khi đang tải
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
              <Link href="/tabs/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;