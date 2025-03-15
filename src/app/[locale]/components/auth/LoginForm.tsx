"use client";
import React, { useState } from 'react';

interface LoginFormProps {
  onLoginSuccess?: () => void; // Callback khi đăng nhập thành công (tùy chọn)
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    // --- Gọi API đăng nhập ở đây ---
    // Thay thế dòng `setTimeout` bằng logic đăng nhập thực tế của bạn
    setTimeout(() => {
      // Giả sử đăng nhập thành công sau 1 giây
      console.log('Đăng nhập thành công!', { email, password });
      if (onLoginSuccess) {
        onLoginSuccess(); // Gọi callback thành công nếu có
      }
      // Reset form hoặc chuyển hướng người dùng nếu cần
      setEmail('');
      setPassword('');
    }, 1000);
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
              >
                Đăng nhập
              </button>
              <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/signup">
                Chưa có tài khoản? Đăng ký
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;