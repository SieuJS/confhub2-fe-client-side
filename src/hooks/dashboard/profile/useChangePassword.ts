// src/hooks/useChangePassword.ts (Đã cập nhật)
import { appConfig } from '@/src/middleware';
import { useState, useCallback } from 'react';

const API_CHANGE_PASSWORD_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/change-password`;

export const useChangePassword = (userId: string, onClose: () => void) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
    setError(null);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError(null);
  };

  const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmNewPassword(e.target.value);
    setError(null);
  };

  const handleChangePassword = useCallback(async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_CHANGE_PASSWORD_ENDPOINT, { // Gọi API change-password
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
        },
        body: JSON.stringify({ oldPassword, newPassword }), // Gửi id, newPassword, confirmNewPassword
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          onClose(); // Đóng form
        }, 3000);
      } else {
        setError(data.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, newPassword, confirmNewPassword, onClose]);

  return {
    oldPassword,
    newPassword,
    confirmNewPassword,
    error,
    message,
    isLoading,
    handleOldPasswordChange,
    handleNewPasswordChange,
    handleConfirmNewPasswordChange,
    handleChangePassword,
  };
};