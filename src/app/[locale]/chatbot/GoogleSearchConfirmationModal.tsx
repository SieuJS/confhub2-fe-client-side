// src/app/[locale]/chatbot/GoogleSearchConfirmationModal.tsx
import React from 'react';
import Modal from './Modal';
import { useTranslations } from 'next-intl';
import { SearchCheck, Info } from 'lucide-react'; // Sử dụng SearchCheck hoặc Info

interface GoogleSearchConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const GoogleSearchConfirmationModal: React.FC<GoogleSearchConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Google_Search_Confirmation_Modal_Title')}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('Cancel_Button')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              // onClose(); // onConfirm từ RightPanel sẽ tự đóng modal
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('Enable_Feature_Button')}
          </button>
        </>
      }
    >
      <div className="text-center">
        <SearchCheck size={48} className="text-blue-500 mb-4 mx-auto" />
        <p className="mb-4 whitespace-pre-line">
          {t('Google_Search_Confirmation_Modal_Message')}
        </p>
        <div className="mt-6 text-left text-xs text-gray-500 p-3 bg-gray-5 rounded-md">
          <div className="flex items-start space-x-2">
            <Info size={28} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-700">{t('Google_Search_Privacy_Subheading')}</h4>
              <p>{t('Google_Search_Privacy_Detail')}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GoogleSearchConfirmationModal;