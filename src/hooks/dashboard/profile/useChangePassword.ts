// src/hooks/dashboard/profile/useChangePassword.ts (đổi đường dẫn nếu cần)
import { appConfig } from '@/src/middleware';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify'; // Import toast library (cần cài đặt: npm install react-toastify)

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
    setError(null);    // Clear error when typing
    setMessage(null); // Clear success message when typing
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError(null);
    setMessage(null);
  };

  const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmNewPassword(e.target.value);
    setError(null);
    setMessage(null);
  };

  const handleChangePassword = useCallback(async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // --- Thêm validation cho các trường bắt buộc ---
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError('All fields are required.');
      toast.error('All fields are required.'); // Toast for user feedback
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      toast.error('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    // --- Kiểm tra định dạng mật khẩu mới ---
    // Cân nhắc thêm kiểm tra độ dài tối thiểu, có chữ hoa/thường/số/ký tự đặc biệt
    const allowRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]*$/;

    if (!allowRegex.test(newPassword)) {
      setError('New password contains invalid characters.'); // Cập nhật thông báo cho rõ ràng
      toast.error('New password contains invalid characters.');
      setIsLoading(false);
      return;
    }

    // --- Thực hiện gọi API ---
    try {
      const response = await fetch(API_CHANGE_PASSWORD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json(); // Luôn đọc response.json() để có data.message

      if (response.ok) {
        setMessage(data.message || 'Password changed successfully!'); // Fallback message
        toast.success(data.message || 'Password changed successfully!'); // Toast success
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        // Không dùng setTimeout nếu bạn muốn đóng ngay hoặc có thể đợi một chút
        // Cân nhắc cách đóng form: onClose() ngay lập tức hoặc sau khi toast biến mất
        setTimeout(() => {
            onClose(); // Đóng form sau khi hiển thị message
        }, 1500); // Đợi 1.5 giây để người dùng thấy thông báo
      } else {
        // Xử lý lỗi từ backend
        const errorMessage = data.message || 'Failed to change password.';
        setError(errorMessage);
        toast.error(errorMessage); // Toast error
      }
    } catch (err: any) {
      // console.error('Change password API error:', err); // Log lỗi chi tiết
      const unexpectedErrorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(unexpectedErrorMessage);
      toast.error(unexpectedErrorMessage); // Toast error
    } finally {
      setIsLoading(false);
    }
  }, [oldPassword, newPassword, confirmNewPassword, onClose]); // Thêm oldPassword vào dependencies

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