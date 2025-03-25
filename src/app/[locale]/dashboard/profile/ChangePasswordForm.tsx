// src/components/ChangePasswordForm.tsx
"use client"
import React, { useState } from 'react';
import Button from '../../utils/Button'; // Assuming you have a Button component
import { useChangePassword } from '../../../../hooks/dashboard/profile/useChangePassword';


interface ChangePasswordFormProps {
  userId: string;
  onClose: () => void; // Callback to close the form
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ userId, onClose }) => {
  const {
    currentPassword,
    newPassword,
    confirmNewPassword,
    error,
    message,
    isLoading,
    step,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmNewPasswordChange,
    handleConfirmCurrentPassword,
    handleChangePassword,
  } = useChangePassword(userId, onClose); // Pass userId and onClose


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>

        {/* Step 1: Confirm Current Password */}
        {step === 'confirm' && (
          <>
            <label htmlFor="currentPassword" className="block text-sm font-medium">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              className="mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500"
            />
             {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <div className="mt-4 flex justify-end space-x-4">
               <Button
                variant="secondary"
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
                onClick={onClose}
                disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCurrentPassword}
                disabled={isLoading}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                 {isLoading ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Change Password */}
        {step === 'change' && (
          <>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={handleConfirmNewPasswordChange}
                className="mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            {message && <p className="mt-2 text-sm text-green-500">{message}</p>}
            <div className="mt-4 flex justify-end space-x-4">

              <Button
                variant="secondary"
                onClick={onClose}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
                disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={isLoading}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </>
        )}


      </div>
    </div>
  );
};

export default ChangePasswordForm;