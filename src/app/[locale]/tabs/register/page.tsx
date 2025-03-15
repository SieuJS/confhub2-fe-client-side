"use client";

import { useTranslations } from 'next-intl';
import { Header } from '../../components/utils/Header';
import Footer from '../../components/utils/Footer';
import RegisterForm from '../../components/auth/RegisterForm';

export default function Register ({ locale }: { locale: string }) {
  const t = useTranslations('');
  const handleSignUpSuccess = () => {
    alert('Đăng ký thành công!');
    // Chuyển hướng người dùng đến trang dashboard hoặc trang khác
    // Ví dụ: history.push('/dashboard'); (nếu bạn đang dùng React Router)
  };
  return (
    <>
      <RegisterForm onSignUpSuccess={handleSignUpSuccess}/>
    </>
  )
}