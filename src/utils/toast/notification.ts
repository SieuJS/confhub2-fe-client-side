// src/utils/toast/notification.ts

import { toast, ToastOptions } from 'react-toastify';

/**
 * Các tùy chọn mặc định cho tất cả các toast.
 * Bạn có thể tùy chỉnh thêm tại đây nếu muốn.
 * Các tùy chọn này sẽ ghi đè lên cấu hình trong ToastContainer nếu cần.
 */
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000, // 3 giây
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored', // Sử dụng theme 'colored' để có màu sắc theo loại thông báo
};

/**
 * Hiển thị thông báo thành công.
 * @param message - Nội dung thông báo.
 * @param options - Tùy chọn riêng cho thông báo này.
 */
const success = (message: string, options: ToastOptions = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

/**
 * Hiển thị thông báo lỗi.
 * @param message - Nội dung thông báo.
 * @param options - Tùy chọn riêng cho thông báo này.
 */
const error = (message: string, options: ToastOptions = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};

/**
 * Hiển thị thông báo thông tin.
 * @param message - Nội dung thông báo.
 * @param options - Tùy chọn riêng cho thông báo này.
 */
const info = (message: string, options: ToastOptions = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

/**
 * Hiển thị thông báo cảnh báo.
 * @param message - Nội dung thông báo.
 * @param options - Tùy chọn riêng cho thông báo này.
 */
const warning = (message: string, options: ToastOptions = {}) => {
  toast.warn(message, { ...defaultOptions, ...options });
};

// Gom tất cả các hàm vào một object để dễ dàng import và sử dụng
export const notification = {
  success,
  error,
  info,
  warning,
};