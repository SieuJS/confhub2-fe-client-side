// src/components/chatbot/EmailConfirmationDialog.tsx (or appropriate path)
import React, { useState, useEffect, useRef } from 'react';
import { ConfirmSendEmailAction } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  data: ConfirmSendEmailAction | null;
  onConfirm: (confirmationId: string) => void;
  onCancel: (confirmationId: string) => void;
  onClose: () => void; // Generic close handler
}

const EmailConfirmationDialog: React.FC<EmailConfirmationDialogProps> = ({
  isOpen,
  data,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to manage the countdown timer
  useEffect(() => {
    if (isOpen && data) {
      const initialTime = Math.ceil(data.timeoutMs / 1000);
      setTimeLeft(initialTime);

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            onClose();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Cleanup timer if dialog closes or data changes
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(0); // Reset time
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, data, onClose]); // Rerun effect if isOpen or data changes

  if (!isOpen || !data) {
    return null;
  }

  const handleConfirmClick = () => {
    onConfirm(data.confirmationId);
    onClose(); // Close dialog immediately on action
  };

  const handleCancelClick = () => {
    onCancel(data.confirmationId);
    onClose(); // Close dialog immediately on action
  };

   return (
    // `p-4` cho toàn bộ overlay là tốt.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      {/* - `max-w-md` có thể giữ nguyên, hoặc `w-full max-w-sm sm:max-w-md` để nó hẹp hơn trên mobile. */}
      {/* - `p-6` -> `p-4 sm:p-6` */}
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl sm:max-w-md sm:p-6 dark:bg-gray-800">
        {/* - `text-xl` -> `text-lg sm:text-xl` */}
        {/* - `mb-4` -> `mb-3 sm:mb-4` */}
        <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl dark:text-white">
          Confirm Email Action
        </h2>
        {/* - `text-sm` là tốt. */}
        <p className="mb-3 text-sm text-gray-600 sm:mb-4 dark:text-gray-400">
          Please review the details below before confirming to send the email.
        </p>

        {/* - `space-y-3` -> `space-y-2 sm:space-y-3` */}
        <div className="space-y-2 text-sm sm:space-y-3">
          <div>
            <span className="block font-medium text-gray-700 sm:inline dark:text-gray-300">Subject:</span>
            {/* Cho phép xuống dòng nếu subject quá dài trên mobile */}
            <span className="mt-0.5 block text-gray-900 sm:ml-2 sm:mt-0 sm:inline dark:text-white">{data.subject}</span>
          </div>
          <div>
            <span className="block font-medium text-gray-700 sm:inline dark:text-gray-300">Type:</span>
            <span className="mt-0.5 block text-gray-900 sm:ml-2 sm:mt-0 sm:inline dark:text-white">
              {data.requestType === 'contact' ? 'Contact Request' : 'Report'}
            </span>
          </div>
          <div>
            <span className="block font-medium text-gray-700 sm:inline dark:text-gray-300">Message:</span>
            {/* - `p-2` -> `p-1.5 sm:p-2` */}
            <p className="mt-1 whitespace-pre-wrap rounded bg-gray-100 p-1.5 text-gray-800 sm:p-2 dark:bg-gray-700 dark:text-gray-200">
              {data.message}
            </p>
          </div>
        </div>

        {/* - `mt-6` -> `mt-4 sm:mt-6` */}
        {/* - `flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between` để các nút xếp chồng trên mobile */}
        <div className="mt-4 flex flex-col items-center space-y-3 sm:mt-6 sm:flex-row sm:space-y-0 sm:justify-between">
          <button
            onClick={handleConfirmClick}
            // - `px-4 py-2 text-sm` -> `w-full px-3 py-2 text-xs sm:w-auto sm:text-sm`
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto sm:text-sm dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            Confirm
          </button>
          {/* - `text-sm` -> `text-xs sm:text-sm` */}
          <span className="order-last pt-1 text-xs font-medium text-gray-500 sm:order-none sm:pt-0 sm:text-sm dark:text-gray-400">
            {`Time left: ${timeLeft} seconds`}
          </span>
          <button
            onClick={handleCancelClick}
            // - `px-4 py-2 text-sm` -> `w-full px-3 py-2 text-xs sm:w-auto sm:text-sm`
            className="w-full rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationDialog;