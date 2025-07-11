// src/app/[locale]/addconference/inputs/AddressInput.tsx
import React from 'react'
import clsx from 'clsx'
import { MapPin } from 'lucide-react'

interface AddressInputProps {
  address: string
  onAddressChange: (value: string) => void
  onBlur: () => void // Thêm
  isTouched: boolean // Thêm
  t: (key: string) => string
  required: boolean
  error?: string | null
}

const AddressInput: React.FC<AddressInputProps> = ({
  address,
  onAddressChange,
  onBlur,
  isTouched,
  t,
  required,
  error
}) => {
  const showError = !!error && isTouched

  return (
    <div>
      <label htmlFor='address' className='block text-sm font-medium '>
        <div className='flex items-center'>
          <MapPin className='mr-2 h-4 w-4 ' />
          {required && <span className='text-red-500'>* </span>}
          {t('Address')}:
        </div>
      </label>
      <input
        type='text'
        id='address'
        className={clsx(
          'mt-1 block w-full rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
          showError ? 'border-red-500' : 'border-gray-300'
        )}
        value={address}
        onChange={e => onAddressChange(e.target.value)}
        onBlur={onBlur} // Gắn onBlur
        title={t('Enter_the_address_of_the_conference')}
        required={required}
        aria-invalid={showError}
        aria-describedby={showError ? 'address-error' : undefined}
      />
      {showError && (
        <p id='address-error' className='mt-1 text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  )
}

export default AddressInput
