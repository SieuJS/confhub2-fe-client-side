// src/app/[locale]/addconference/inputs/AddressInput.tsx
import React from 'react';
import clsx from 'clsx';
import { MapPin } from 'lucide-react'; // Import icon

interface AddressInputProps {
  address: string;
  onAddressChange: (value: string) => void;
  t: (key: string) => string;
  required: boolean;
  error?: string | null;
}

const AddressInput: React.FC<AddressInputProps> = ({
  address,
  onAddressChange,
  t,
  required,
  error,
}) => {
  return (
    <div>
      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
        <div className="flex items-center"> {/* Flex container cho icon và label text */}
          <MapPin className="h-4 w-4 mr-2 text-gray-500" /> {/* Icon */}
          {t('Address')}:
        </div>
      </label>
      <input
        type="text"
        id="address"
        className={clsx(
          'p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500',
          error ? 'border-red-500' : 'border-gray-300'
        )}
        value={address}
        onChange={e => onAddressChange(e.target.value)}
        title={t('Enter_the_address_of_the_conference')}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? 'address-error' : undefined}
      />
      {error && (
        <p id="address-error" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default AddressInput;