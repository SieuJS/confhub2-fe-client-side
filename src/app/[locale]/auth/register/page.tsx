"use client";

import { useTranslations } from 'next-intl';
import RegisterForm from './RegisterForm';

export default function Register ({ locale }: { locale: string }) {
  const t = useTranslations('');
  return (
    <>
      <RegisterForm />
    </>
  )
}