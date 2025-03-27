"use client";

import { useTranslations } from 'next-intl';
import RegisterForm from './RegisterForm';

export default function Register () {
  const t = useTranslations('');
  return (
    <>
      <RegisterForm />
    </>
  )
}