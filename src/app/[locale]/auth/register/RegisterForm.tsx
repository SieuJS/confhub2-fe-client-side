// src/app/[locale]/auth/register/RegisterForm.tsx
'use client'

import { Link, useRouter } from '@/src/navigation'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'
// import { login } from '@/src/hooks/auth/useAuthApi' // DO NOT IMPORT THIS UTILITY ANYMORE
// No direct import of useAuthApi here unless you want to immediately log in,
// which is generally not done if email verification is pending.

interface RegisterFormProps {
  // No props needed
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const t = useTranslations('')
  const router = useRouter() // next-intl router

  const [firstname, setFirstName] = useState('')
  const [lastname, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [dob, setDob] = useState('')
  const [error, setError] = useState('') // Local form error
  const [isLoading, setIsLoading] = useState(false) // Local loading state for submission

  const isOldEnough = (dateString: string): boolean => {
    if (!dateString) return false;
    try {
      const today = new Date();
      const birthDate = new Date(dateString);
      const cutoffDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      return birthDate <= cutoffDate;
    } catch (e) {
      console.error('Error parsing date:', e);
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('') // Clear previous local errors

    // --- Validation ---
    if (!firstname || !lastname || !email || !password || !confirmPassword || !dob) {
      setError(t('Error_Fill_All_Fields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('Error_Password_Mismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('Error_Password_Too_Short'));
      return;
    }
    const allowRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]*$/;

    if (!allowRegex.test(password)) {
      setError(t('Error_Invalid_Password_Format'));
      return;
    }

    if (!isOldEnough(dob)) {
      setError(t('Error_Age_Requirement'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('Error_Invalid_Email_Format'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstname,
            lastName: lastname,
            email: email,
            password: password,
            dob: dob
          })
        }
      );

      const data = await response.json();

      if (response.status === 201) { // Successfully created, awaiting verification
        console.log('Registration pending verification:', data.message);
        localStorage.setItem('token', data.token);

        // Redirect to a page informing the user to check their email.
        // Pass email as query param if the verification page needs it to display a message.
        router.push({
          pathname: '/auth/verify-email', // Ensure this route exists and is handled correctly
          query: { email: email, message: data.message || 'Please check your email to verify your account.' }
        });
        // DO NOT LOG THE USER IN HERE. They need to verify first.
        // The old `login(data)` was incorrect for this flow.
      } else if (response.ok && data.user && data.token) {
        // Scenario: Backend registers AND logs in the user immediately (e.g., no email verification)
        // In this case, you would use useAuthApi to process the login.
        // This requires `useAuthApi` to be imported and used.
        // For now, assuming verification is the primary flow for 201.
        // If you need immediate login after signup, you'd call something like:
        // authApi.processTokenFromOAuth(data.token); // or a dedicated processSignupResponse
        console.warn("Signup returned OK with user data, but not 201. This flow needs clarification.");
        setError(data.message || t('Error_Registration_Unexpected_Response'));
      } else {
        setError(data.message || t('Error_Registration_Failed_Status', { status: response.status }));
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(t('Error_Registration_Generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-10 px-4 py-12  sm:px-6 lg:px-8'>
      <div className='w-full max-w-xl'>
        <div className='bg-white-pure px-8 py-10 shadow-xl  sm:rounded-lg sm:px-16'>
          <div className='space-y-8'>
            <div className='space-y-2 text-center'>
              <h1 className='mx-auto max-w-fit text-xl font-bold tracking-tight sm:text-2xl md:text-3xl'>
                {t('Welcome_Global_Conference_Hub')}
              </h1>
              <p className='text-sm '>{t('Create_your_account')}</p>
            </div>

            <form className='space-y-4' onSubmit={handleSubmit}>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='firstname' className='block text-sm font-medium '>{t('First_Name')} <span className='text-red-500'>*</span></label>
                  <div className='mt-1'>
                    <input id='firstname' name='firstname' type='text' required value={firstname} onChange={e => setFirstName(e.target.value)} className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm' placeholder={t('First_Name')} disabled={isLoading}/>
                  </div>
                </div>
                <div>
                  <label htmlFor='lastname' className='block text-sm font-medium '>{t('Last_Name')} <span className='text-red-500'>*</span></label>
                  <div className='mt-1'>
                    <input id='lastname' name='lastname' type='text' required value={lastname} onChange={e => setLastName(e.target.value)} className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm' placeholder={t('Last_Name')} disabled={isLoading}/>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor='dob' className='block text-sm font-medium '>{t('Date_of_Birth')} <span className='text-red-500'>*</span></label>
                <div className='mt-1'>
                  <input id='dob' name='dob' type='date' required value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm' disabled={isLoading}/>
                </div>
              </div>
              <div>
                <label htmlFor='email' className='block text-sm font-medium '>{t('Email')} <span className='text-red-500'>*</span></label>
                <div className='mt-1'>
                  <input id='email' name='email' type='email' autoComplete='email' required value={email} onChange={e => setEmail(e.target.value)} className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm' placeholder='you@example.com' disabled={isLoading}/>
                </div>
              </div>
              <div>
                <label htmlFor='password' className='block text-sm font-medium '>{t('Password')} <span className='text-red-500'>*</span></label>
                <div className='mt-1'>
                  <div className='relative'>
                    <input id='password' name='password' type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm' placeholder='••••••••' disabled={isLoading}/>
                    {password && 
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-2 top-1/2 -translate-y-1/2 text-xl'
                      >
                        <span className="relative inline-block w-6 text-xl leading-none">
                          👁️
                          {showPassword && (
                            <span className="absolute left-0 top-1/2 h-[2px] w-[28px] -translate-y-1/2 -rotate-45 bg-black"></span>
                          )}
                        </span>
                      </button>
                    }
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor='confirmPassword' className='block text-sm font-medium '>{t('Confirm_Password')} <span className='text-red-500'>*</span></label>
                <div className='mt-1'>
                  <div className='relative'>
                    <input id='confirmPassword' name='confirmPassword' type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm' placeholder='••••••••' disabled={isLoading} />
                    {confirmPassword && 
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-2 top-1/2 -translate-y-1/2 text-xl'
                      >
                        <span className="relative inline-block w-6 text-xl leading-none">
                          👁️
                          {showConfirmPassword && (
                            <span className="absolute left-0 top-1/2 h-[2px] w-[28px] -translate-y-1/2 -rotate-45 bg-black"></span>
                          )}
                        </span>
                    </button>
                  }
                  </div>
                </div>
              </div>

              {error && (
                <div className='rounded-md bg-red-50 p-4'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'><path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' /></svg>
                    </div>
                    <div className='ml-3'><p className='text-sm text-red-700'>{error}</p></div>
                  </div>
                </div>
              )}
              <div>
                <button type='submit' disabled={isLoading} className='hover:bg-button/90 flex w-full justify-center rounded-md border border-transparent bg-button px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                  {isLoading ? (
                    <div className='flex items-center'>
                      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg>
                      {t('Creating_account')}
                    </div>
                  ) : (
                    t('Create_account')
                  )}
                </button>
              </div>
            </form>

            <div className='text-center text-sm'>
              <div className='flex items-center justify-center space-x-1'>
                <span className=''>{t('Already_have_an_account')}</span>
                <Link href='/auth/login' className='hover:text-button/80 font-medium text-button'>{t('Sign_In')}</Link>
              </div>
              <div className='flex items-center justify-center space-x-1 mt-2'>
                <Link href='/' className='hover:text-button/80 font-medium text-button'>{t('Back_to_Home')}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-4 text-center text-xs '>{t('By_continuing_you_agree_to_our_Terms_of_Service_and_Privacy_Policy')}</div>
      </div>
    </div>
  )
}

export default RegisterForm