// app/[locale]/auth/verify-email/VerifyEmailForm.tsx
'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import {
  useSearchParams //
} from 'next/navigation'
import { Link } from '@/src/navigation' // <<< Import Link của next-intl
import { appConfig } from '@/src/middleware'
import { useTranslations } from 'next-intl'

interface VerifyEmailFormProps {
  // Có thể thêm props nếu cần, ví dụ: t cho i18n
  // t: (key: string) => string;
}

const VerifyEmailForm: React.FC<VerifyEmailFormProps> = () => {
  // Nhận t nếu bạn dùng i18n
  const t = useTranslations('')
  const searchParams = useSearchParams()
  // const router = useRouter(); // <<< Không cần router.push nữa
  // const pathname = usePathname(); // <<< Không cần pathname nữa nếu chỉ dùng Link

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {}, [searchParams])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null) // Reset success message on new submit attempt

    if (!code) {
      setError(t('verifyEmail.error.missingFields')) // Nên dùng t('verifyEmail.error.missingFields')
      return
    }
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError(t('verifyEmail.error.invalidCodeFormat'))
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // Thêm token vào header
          },
          body: JSON.stringify({ code })
        }
      )

      const data = await response.json()

      if (response.ok) {
        // Status 200
        // Chỉ cần set message thành công, không cần redirect tự động nữa
        setSuccessMessage(data.message || t('verifyEmail.success.message'))
        setCode('') // Xóa code khỏi input
        // --- BỎ PHẦN TỰ ĐỘNG CHUYỂN HƯỚNG ---
        // setTimeout(() => {
        //     const localePrefix = pathname.split('/')[1];
        //     const pathWithLocale = `/${localePrefix}/auth/login`;
        //     router.push(pathWithLocale);
        // }, 3000);
        // --- KẾT THÚC BỎ ---
      } else {
        // Lỗi từ backend (400, 404, 500)
        setError(data.message || t('verifyEmail.error.backendFailed'))
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError(t('verifyEmail.error.network'))
    } finally {
      setIsLoading(false)
    }
  }

  // ---- CÁC THAY ĐỔI TRONG JSX ----
  return (
    <div className='space-y-6'>
      {' '}
      {/* Đổi form thành div hoặc giữ form nhưng không submit nếu đã thành công */}
      {/* Thông báo thành công */}
      {successMessage && (
        <div className='rounded-md bg-green-50 p-4'>
          <div className='flex'>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Thông báo lỗi */}
      {error && !successMessage && (
        <div className='rounded-md bg-red-50 p-4'>
          {/* ... icon lỗi ... */}
          <div className='ml-3'>
            <p className='text-sm text-red-700'>{error}</p>
          </div>
        </div>
      )}
      {/* Chỉ hiển thị form nhập liệu KHI CHƯA thành công */}
      {!successMessage && (
        <form className='space-y-6' onSubmit={handleSubmit}>
          {/* Input Email */}

          {/* Input Verification Code */}
          <div>
            <label
              htmlFor='code'
              className='block text-sm font-medium text-gray-700'
            >
              {t('verifyEmail.codeLabel')}
            </label>
            <div className='mt-1'>
              <input
                id='code'
                name='code'
                type='text'
                inputMode='numeric'
                maxLength={6}
                required
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm'
                placeholder={t('verifyEmail.codePlaceholder')}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type='submit'
              disabled={isLoading} // Không cần disable khi thành công nữa vì nút này sẽ bị ẩn
              className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 disabled:opacity-50'
            >
              {isLoading
                ? t('verifyEmail.verifying')
                : t('verifyEmail.submitButton')}
            </button>
          </div>

          {/* Link phụ */}
          <div className='text-center text-sm'>
            <span className='text-gray-600'>
              {t('verifyEmail.noCode')} {/* Nên dùng t('verifyEmail.noCode') */}{' '}
            </span>
            {/* Có thể thêm link gửi lại code nếu cần */}
            <Link
              href='/'
              className='hover:text-button/80 font-medium text-button'
            >
              {t('verifyEmail.resendLink')}
            </Link>{' '}
            {/* Thêm khoảng trắng nếu cần */}
            <span className='text-gray-600'>{t('common.or')} </span>{' '}
            {/* Nên dùng t('common.or') */} {/* Thêm khoảng trắng nếu cần */}
            <Link
              href='/auth/login'
              className='hover:text-button/80 font-medium text-button'
            >
              {t('verifyEmail.backToLogin')}
            </Link>
          </div>
        </form>
      )}
      {/* ---- HIỂN THỊ NÚT QUAY VỀ LOGIN KHI THÀNH CÔNG ---- */}
      {successMessage && (
        <div className='mt-6'>
          {' '}
          {/* Thêm khoảng cách trên nếu cần */}
          <Link
            href='/auth/login' // Quan trọng: Dùng đường dẫn không có locale, Link của next-intl sẽ tự xử lý
            className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
          >
            {t('verifyEmail.returnToHomeButton')}
          </Link>
        </div>
      )}
      {/* ---- KẾT THÚC NÚT QUAY VỀ ---- */}
    </div>
  )
}

export default VerifyEmailForm
