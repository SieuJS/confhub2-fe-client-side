// src/app/[locale]/chatbot/PersonalizationConfirmationModal.tsx
import React from 'react';
import Modal from './Modal'; // Điều chỉnh đường dẫn nếu cần
import { useTranslations } from 'next-intl';
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react'; // Icons

interface PersonalizationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'enableBenefit' | 'missingInfo';
  missingFieldsText?: string; // Only for 'missingInfo' type
}

const PersonalizationConfirmationModal: React.FC<PersonalizationConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  missingFieldsText,
}) => {
  const t = useTranslations();

  const getModalContent = () => {
    if (type === 'enableBenefit') {
      return {
        title: t('Personalization_Benefit_Privacy_Popup_Title'),
        icon: <UserCheck size={48} className="text-blue-500 mb-4" />,
        message: t('Personalization_Benefit_Privacy_Popup_Message'),
        confirmText: t('Enable_Feature_Button') || "Enable", // Provide fallback
        cancelText: t('Cancel_Button') || "Cancel",
      };
    } else if (type === 'missingInfo') {
      return {
        title: t('Personalization_Warning_Missing_Info_Title') || "Missing Profile Information",
        icon: <AlertTriangle size={48} className="text-yellow-500 mb-4" />,
        message: t('Personalization_Warning_Missing_Info_Message', { fields: missingFieldsText || '' }),
        additionalMessage: t('Personalization_Warning_Missing_Info_Enable_Anyway'),
        confirmText: t('Enable_Anyway_Button') || "Enable Anyway",
        cancelText: t('Update_Profile_Button') || "Update Profile", // Or just "Cancel"
      };
    }
    return null; // Should not happen
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {content.cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose(); // Close modal after confirm
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {content.confirmText}
          </button>
        </>
      }
    >
      <div className="text-center">
        {content.icon}
        <p className="mb-4 whitespace-pre-line">{content.message}</p>
        {content.additionalMessage && (
          <p className="mt-2 text-gray-600 whitespace-pre-line">{content.additionalMessage}</p>
        )}
        {type === 'enableBenefit' && (
            <div className="mt-6 text-left text-xs text-gray-500 p-3 bg-gray-5 rounded-md">
                <div className="flex items-start space-x-2">
                    <ShieldCheck size={28} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-gray-700">{t('Personalization_Privacy_Subheading') || "Your Privacy Matters"}</h4>
                        <p>{t('Personalization_Privacy_Detail') || "We are committed to protecting your data. The information used for personalization is processed securely and is not shared with third parties. You can disable this feature at any time."}</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default PersonalizationConfirmationModal;