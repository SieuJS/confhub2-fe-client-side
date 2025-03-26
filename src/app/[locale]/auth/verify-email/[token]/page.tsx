'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Để lấy token từ URL
import { Link } from '@/src/navigation'; // Link component của bạn

enum VerificationStatus {
  Verifying = 'verifying',
  Success = 'success',
  Error = 'error',
  Invalid = 'invalid', // Thêm trạng thái invalid/expired
}

const VerifyEmailPage: React.FC = () => {
  const params = useParams();
  const token = params?.token as string | undefined; // Lấy token từ URL
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.Verifying);
  const [message, setMessage] = useState<string>('Verifying your email address...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus(VerificationStatus.Error);
        setMessage('Verification token not found in URL.');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/verify-email/${token}`, {
          method: 'GET', // Hoặc POST nếu backend dùng POST
        });

        const data = await response.json();

        if (response.ok) { // Status 200
          setStatus(VerificationStatus.Success);
          setMessage(data.message || 'Email verified successfully! You can now log in.');
        } else {
           // Phân biệt lỗi cụ thể nếu có thể
           if (response.status === 400 && data.message?.includes('already verified')) {
              setStatus(VerificationStatus.Success); // Coi như thành công nếu đã verify rồi
              setMessage(data.message || 'Email has already been verified.');
           } else if (response.status === 400 && data.message?.includes('expired')) {
               setStatus(VerificationStatus.Invalid);
               setMessage(data.message || 'Verification link has expired. Please try registering again or request a new link.');
           } else { // Các lỗi 400 khác (invalid token), 500
               setStatus(VerificationStatus.Error);
               setMessage(data.message || `Verification failed (Status: ${response.status}). Please try again or contact support.`);
           }
        }
      } catch (error) {
        console.error('Verification API error:', error);
        setStatus(VerificationStatus.Error);
        setMessage('An error occurred while trying to verify your email. Please check your connection and try again.');
      }
    };

    verifyToken();
  }, [token]); // Chạy lại khi token thay đổi (dù thường chỉ chạy 1 lần)

  const renderContent = () => {
    switch (status) {
      case VerificationStatus.Verifying:
        return (
          <>
            <svg className="animate-spin mx-auto h-12 w-12 text-button" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">{message}</p>
          </>
        );
      case VerificationStatus.Success:
        return (
          <>
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">Email Verified!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6">
              <Link href="/auth/login" className="inline-block rounded-md bg-button px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-button/90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2">
                Go to Login
              </Link>
            </div>
          </>
        );
      case VerificationStatus.Invalid: // Cho token hết hạn/không hợp lệ
      case VerificationStatus.Error:
        return (
           <>
             <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <h2 className="mt-4 text-2xl font-semibold text-gray-800">Verification Failed</h2>
             <p className="mt-2 text-gray-600">{message}</p>
             {status === VerificationStatus.Invalid && (
                  <div className="mt-6">
                     {/* Option: Cung cấp link để đăng ký lại */}
                      <Link href="/auth/register" className="font-medium text-button hover:text-button/80">
                         Register again
                      </Link>
                  </div>
              )}
             {status === VerificationStatus.Error && (
                  <div className="mt-6 text-sm text-gray-500">
                       Please contact support if the problem persists.
                  </div>
              )}
           </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-lg bg-white p-8 text-center shadow-xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;