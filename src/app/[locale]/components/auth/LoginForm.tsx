// LoginForm.tsx
'use client'
import React, { useState } from 'react'
import { Link } from '@/src/navigation'
import { useRouter, usePathname } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'

interface LoginFormProps {
  // No onLoginSuccess needed
}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [password, setPassword] = useState('')
  const [emailInput, setEmailInput] = useState('') // Separate state for input field
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Use useLocalStorage for loginStatus and user object
  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  )
  const [user, setUser] = useLocalStorage<{
    firstname: string
    lastname: string
    email: string
  } | null>('user', null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!emailInput || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailInput, password }) // Use emailInput
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Đăng nhập thành công!', data)

        // Use the setter functions from useLocalStorage
        setLoginStatus('Logined')
        setUser({
          firstname: data.user.firstName,
          lastname: data.user.lastName,
          email: data.user.email
        })

        const localePrefix = pathname.split('/')[1]
        const pathWithLocale = `/${localePrefix}`
        router.push(pathWithLocale)
      } else {
        setError(data.message || 'Đăng nhập không thành công.')
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error)
      setError('Đã xảy ra lỗi khi đăng nhập.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='mt-4 bg-white px-8 py-6 text-left shadow-lg'>
        <h3 className='text-center text-2xl font-bold'>Đăng nhập</h3>
        <form onSubmit={handleSubmit}>
          <div className='mt-4'>
            <div>
              <label
                className='mb-2 block text-sm font-bold text-gray-700'
                htmlFor='email'
              >
                Email
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
                id='email'
                type='email'
                placeholder='Email'
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)} // Update emailInput
              />
            </div>
            <div className='mt-4'>
              <label
                className='mb-2 block text-sm font-bold text-gray-700'
                htmlFor='password'
              >
                Mật khẩu
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
                id='password'
                type='password'
                placeholder='Mật khẩu'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className='mt-2 text-sm italic text-red-500'>{error}</p>
            )}
            <div className='mt-8 flex items-center justify-between'>
              <button
                className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              <Link
                href='/tabs/register'
                className='inline-block align-baseline text-sm font-bold text-blue-500 hover:text-blue-800'
              >
                Chưa có tài khoản? Đăng ký
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
