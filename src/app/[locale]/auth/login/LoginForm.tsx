// src/app/[locale]/auth/login/LoginForm.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { Link, useRouter as useNextIntlRouter } from '@/src/navigation' // Assuming this is next-intl's Link/useRouter
import useLoginForm from '../../../../hooks/auth/useLoginForm'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react' // Import Eye and EyeOff

// Removed axios and appConfig as Google Login is now handled by useAuthApi
// Removed useRouter from 'next/navigation' as useNextIntlRouter is used

type LoginFormProps = {
  // redirectUri is no longer needed here as Google flow is handled by useAuthApi
  // redirectUri: string
}

const LoginForm: React.FC<LoginFormProps> = (/* props: LoginFormProps */) => {
  const t = useTranslations('')
  const nextIntlRouter = useNextIntlRouter() // For navigation that preserves locale
  const [showPassword, setShowPassword] = useState(false)

  const {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleLogin, // This will now call googleSignIn from useAuthApi
    error,
    isLoading // This isLoading comes from useAuthApi via useLoginForm
  } = useLoginForm()

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // The Google login logic via @react-oauth/google and direct axios call is REMOVED.
  // It's now handled by `handleGoogleLogin` which calls `useAuthApi.googleSignIn`.
  // The backend will handle the Google OAuth flow and redirect to the /auth/callback page.

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-gray-10 px-4 py-12  sm:px-6 lg:px-8'>
      <div className='w-full max-w-xl'>
        <div className='bg-white-pure px-8 py-10 shadow-xl  sm:rounded-lg sm:px-16'>
          <div className='space-y-8'>
            <div className='space-y-2 text-center'>
              <h1 className='mx-auto max-w-fit text-xl font-bold tracking-tight sm:text-2xl md:text-3xl'>
                {t('Welcome_Global_Conference_Hub')}
              </h1>
              <p className='text-sm '>{t('Sign_in_to_your_account')}</p>
            </div>

            <div className='space-y-4'>
              <button
                type='button'
                onClick={handleGoogleLogin} // Use the handler from useLoginForm
                disabled={isLoading}
                className='flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white-pure px-4 py-2.5 text-sm font-medium shadow-sm  hover:bg-gray-10 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <svg className='h-5 w-5' viewBox='0 0 24 24'>
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                </svg>
                <span>{t('Continue_with_Google')}</span>
              </button>
            </div>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white-pure px-2 '>{t('or')}</span>
              </div>
            </div>

            <form className='space-y-4' onSubmit={handleSubmit}>
              <div>
                <label htmlFor='email' className='block text-sm font-medium '>
                  {t('Email')}
                </label>
                <div className='mt-1'>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-50 focus:outline-none focus:ring-gray-50 sm:text-sm'
                    placeholder='you@example.com'
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium '
                  >
                    {t('Password')}
                  </label>
                  <div className='text-sm'>
                    <Link
                      href='/auth/forgot-password' // Make sure this path is correct with locale if needed
                      className='hover:text-button/80 font-medium text-button'
                    >
                      {t('Forgot_Password')}
                    </Link>
                  </div>
                </div>
                <div className='mt-1'>
                  <div className='relative'>
                    <input
                      id='password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-50 focus:outline-none focus:ring-gray-50 sm:text-sm'
                      placeholder='••••••••'
                      disabled={isLoading}
                    />
                    {/* Thay thế biểu tượng mắt thủ công bằng icon từ lucide-react */}
                    {password && ( // Hiển thị nút toggle chỉ khi có mật khẩu
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-50 hover:text-gray-70 focus:outline-none focus:ring-0' // Thêm một số style cho nút
                        aria-label={
                          showPassword ? t('Hide password') : t('Show password')
                        } // Thêm aria-label cho accessibility
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}{' '}
                        {/* Sử dụng icon lucide-react */}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className='flex rounded-md bg-red-50 p-4'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      {/* SVG for error icon */}
                      <svg
                        className='h-5 w-5 text-red-400'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-red-700'>{error}</p>
                    </div>
                    {error == 'Not verified' && <div className='flex text-sm ml-3'>
                      <Link
                        href='/auth/verify-email' // Use next-intl Link
                        className='hover:text-button/80 font-medium text-button'
                      >
                        {t('Verify_Your_Email_Address')}
                      </Link>
                    </div>}
                  </div>
                  
                </div>
              )}

              <div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isLoading && isClient ? ( // isClient check to prevent hydration mismatch for spinner
                    <div className='flex items-center'>
                      {/* SVG for loading spinner */}
                      <svg
                        className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      {t('Signing_in')}
                    </div>
                  ) : (
                    t('Sign_In')
                  )}
                </button>
              </div>
            </form>

            <div className='text-center text-sm'>
              <div className='flex items-center justify-center space-x-1'>
                <span className=''>{t('Dont_have_an_account')}</span>
                <Link
                  href='/auth/register' // Use next-intl Link
                  className='hover:text-button/80 font-medium text-button'
                >
                  {t('Sign_Up_Now')}
                </Link>
              </div>
              <div className='mt-2 flex items-center justify-center space-x-1'>
                <Link
                  href='/' // Use next-intl Link
                  className='hover:text-button/80 font-medium text-button'
                >
                  {t('Back_to_Home')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-4 text-center text-xs '>
          {t(
            'By_continuing_you_agree_to_our_Terms_of_Service_and_Privacy_Policy'
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginForm
