'use client'

import { Link } from '@/src/navigation';
import React, { useState } from 'react';

interface RegisterFormProps {
  // No props needed
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false); // <<< State mới

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setShowVerificationMessage(false); // Reset message khi submit lại

    // --- Validation cơ bản (giữ nguyên) ---
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }
    if (password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    // Có thể thêm validation email format ở đây nữa

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstname,
          lastName: lastname,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 201) { // <<< Backend trả về 201 khi cần verify
        console.log('Registration pending verification:', data.message);

        // --- KHÔNG ĐĂNG NHẬP ---
        // await signIn({ email, password }); // <<< Xóa dòng này

        // --- Hiển thị thông báo cần xác thực ---
        setShowVerificationMessage(true); // <<< Hiển thị thông báo

        // Xóa form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

      } else {
        // Xử lý các lỗi khác từ backend (400, 409, 500)
        setError(data.message || `Registration failed (Status: ${response.status})`);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Phần JSX ---
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <div className="bg-white px-8 py-10 shadow-xl sm:rounded-lg sm:px-16">

          {/* Hiển thị thông báo xác thực hoặc form đăng ký */}
          {showVerificationMessage ? (
             <div className="space-y-4 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19h18M9 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2"></path></svg>
                <h2 className="text-2xl font-semibold text-gray-800">Registration Successful!</h2>
                <p className="text-gray-600">
                  Thank you for registering. Please check your email inbox (and spam folder) for a verification link to activate your account.
                </p>
                 <p className="text-sm text-gray-500">
                    If you don't receive the email within a few minutes, please contact support.
                 </p>
                <div className="pt-4">
                    <Link href="/auth/login" className="font-medium text-button hover:text-button/80">
                      Go to Login Page
                    </Link>
                </div>
             </div>
          ) : (
            // Form đăng ký (như cũ)
            <div className="space-y-8">
                <div className="space-y-2 text-center">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl mx-auto max-w-fit">Welcome Global Conference Hub</h1>
                <p className="text-sm text-gray-600">Create your account</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Các input fields (First Name, Last Name, Email, Password, Confirm Password) - Giữ nguyên */}
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">First Name</label>
                         <div className="mt-1">
                             <input id="firstname" name="firstname" type="text" required value={firstname} onChange={(e) => setFirstName(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm" placeholder="First name" />
                         </div>
                     </div>
                     <div>
                         <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Last Name</label>
                         <div className="mt-1">
                             <input id="lastname" name="lastname" type="text" required value={lastname} onChange={(e) => setLastName(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm" placeholder="Last name" />
                         </div>
                     </div>
                 </div>
                 <div>
                     <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                     <div className="mt-1">
                         <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm" placeholder="you@example.com" />
                     </div>
                 </div>
                 <div>
                     <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                     <div className="mt-1">
                         <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm" placeholder="••••••••" />
                     </div>
                 </div>
                 <div>
                     <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                     <div className="mt-1">
                         <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm" placeholder="••••••••" />
                     </div>
                 </div>
                {/* Hiển thị lỗi (như cũ) */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                    {/* SVG và text lỗi */}
                     <div className="flex">
                         <div className="flex-shrink-0">
                             <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                         </div>
                         <div className="ml-3">
                             <p className="text-sm text-red-700">{error}</p>
                         </div>
                     </div>
                    </div>
                )}
                {/* Nút Submit (như cũ) */}
                <div>
                    <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-button/90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2">
                    {isLoading ? (
                        <div className="flex items-center">
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Creating account...
                        </div>
                    ) : ( 'Create account' )}
                    </button>
                </div>
                </form>

                {/* Link đăng nhập (như cũ) */}
                <div className="text-center text-sm">
                <div className="flex items-center justify-center space-x-1">
                    <span className="text-gray-600">Already have an account?</span>
                    <Link href="/auth/login" className="font-medium text-button hover:text-button/80">
                    Sign In
                    </Link>
                </div>
                </div>
            </div>
          )}

        </div>

        {/* Link Terms & Privacy (như cũ) */}
        {!showVerificationMessage && ( // Chỉ hiển thị khi chưa có thông báo xác thực
             <div className="mt-4 text-center text-xs text-gray-500">
                 By continuing, you agree to our{' '}
                 <Link href="/terms" className="text-button hover:text-button/80">Terms of Service</Link>{' '}
                 and{' '}
                 <Link href="/privacy" className="text-button hover:text-button/80">Privacy Policy</Link>
             </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;