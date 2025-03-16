"use client";
import React, { useState } from 'react';
import { Link } from '@/src/navigation';
import { useRouter, usePathname } from 'next/navigation';

interface LoginFormProps {
  // Không cần onLoginSuccess nữa, vì chuyển hướng trực tiếp trong component
}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    setIsLoading(true); // Bắt đầu loading
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/signin', { // Use relative URL for client-side
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Đăng nhập thành công
        console.log('Đăng nhập thành công!', data);

        // --- LƯU TRẠNG THÁI ĐĂNG NHẬP VÀO LOCALSTORAGE ---
        if (typeof window !== 'undefined') {
          localStorage.setItem('loginStatus', "Logined"); // Lưu thông tin người dùng (hoặc token) vào localStorage
          localStorage.setItem('firstname', data.user.firstName);
          localStorage.setItem('lastname', data.user.lastName);

          // --- Prepend Locale Prefix ---
          const localePrefix = pathname.split('/')[1]; // Extract locale prefix (e.g., "en")
          const pathWithLocale = `/${localePrefix}`; // Construct path with locale

          router.push(pathWithLocale); // Use path with locale for internal navigation
        } else {
          console.error("Error in signin");
        }
      } else {
        // Xử lý lỗi đăng nhập
        setError(data.message || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập.');
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false); // Kết thúc loading, bất kể thành công hay thất bại
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Đăng nhập</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
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
            {error && <p className="text-red-500 text-sm italic mt-2">{error}</p>}
            <div className="flex items-center justify-between mt-8">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={isLoading} // Vô hiệu hóa nút khi đang tải
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              <Link href="/tabs/register" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Chưa có tài khoản? Đăng ký
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;