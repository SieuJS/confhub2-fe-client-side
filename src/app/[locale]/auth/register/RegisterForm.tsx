'use client'

import { Link } from '@/src/navigation'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface RegisterFormProps {
  // Không cần onSignUpSuccess nữa, vì chuyển hướng trực tiếp trong component
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [firstname, setFirstName] = useState('')
  const [lastname, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Thêm trạng thái loading
  const router = useRouter() // Khởi tạo router
  const pathname = usePathname()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và mật khẩu xác nhận không khớp.')
      return
    }

    setIsLoading(true) // Bắt đầu loading
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/signup', {
        // Use absolute URL for server-side
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password
        })
      })

      const data = await response.json()

      if (response.status === 201) {
        // Đăng ký thành công
        console.log('Đăng ký thành công!', data)

        if (typeof window !== 'undefined') {
          // --- Prepend Locale Prefix ---
          const localePrefix = pathname.split('/')[1] // Extract locale prefix (e.g., "en")
          const pathWithLocale = `/${localePrefix}` // Construct path with locale

          router.push(pathWithLocale) // Use path with locale for internal navigation
        } else {
          console.error('Error in signin')
        }

        // Reset form
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        // Xử lý lỗi đăng ký
        setError(
          data.message ||
            'Đăng ký không thành công. Vui lòng kiểm tra thông tin.'
        )
      }
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error)
      setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false) // Kết thúc loading, bất kể thành công hay thất bại
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='mt-4 bg-white px-8 py-6 text-left shadow-lg'>
        <h3 className='text-center text-2xl font-bold'>Đăng ký tài khoản</h3>
        <form onSubmit={handleSubmit}>
          <div className='mt-4'>
            <div>
              <label
                className='mb-2 block text-sm font-bold text-gray-700'
                htmlFor='firstname'
              >
                Tên
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
                id='firstname'
                type='text'
                placeholder='Tên'
                value={firstname}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label
                className='mb-2 block text-sm font-bold text-gray-700'
                htmlFor='lastname'
              >
                Họ
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
                id='lastname'
                type='text'
                placeholder='Họ'
                value={lastname}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <div className='mt-4'>
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
                value={email}
                onChange={e => setEmail(e.target.value)}
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
            <div className='mt-4'>
              <label
                className='mb-2 block text-sm font-bold text-gray-700'
                htmlFor='confirmPassword'
              >
                Xác nhận mật khẩu
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
                id='confirmPassword'
                type='password'
                placeholder='Xác nhận mật khẩu'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className='mt-2 text-sm italic text-red-500'>{error}</p>
            )}
            <div className='mt-8 flex items-center justify-between'>
              <button
                className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'
                type='submit'
                disabled={isLoading} // Vô hiệu hóa nút khi đang tải
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
              <Link
                href='/auth/login'
                className='inline-block align-baseline text-sm font-bold text-blue-500 hover:text-blue-800'
              >
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
