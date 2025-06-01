// src/app/[locale]/chatbot/PersonalizationConfirmationModal.tsx
import React from 'react';
import Modal from './Modal'; // Assuming Modal handles the basic shell, overlay, and centering
import { useTranslations } from 'next-intl';
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { Link } from '@/src/navigation';

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
        IconComponent: UserCheck,
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-100',
        message: t('Personalization_Benefit_Privacy_Popup_Message'),
        confirmText: t('Enable_Feature_Button') || "Enable Feature",
        confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600',
        cancelText: t('Cancel_Button') || "Cancel",
      };
    } else if (type === 'missingInfo') {
      return {
        title: t('Personalization_Warning_Missing_Info_Title') || "Missing Profile Information",
        IconComponent: AlertTriangle,
        iconColor: 'text-yellow-600',
        iconBgColor: 'bg-yellow-100',
        message: t('Personalization_Warning_Missing_Info_Message', { fields: missingFieldsText || t('Default_Missing_Fields_Placeholder') || 'required fields' }),
        additionalMessage: t('Personalization_Warning_Missing_Info_Enable_Anyway'),
        confirmText: t('Enable_Anyway_Button') || "Enable Anyway",
        confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600',
        cancelText: t('Update_Profile_Button') || "Update Profile",
      };
    }
    return null;
  };

  const content = getModalContent();
  if (!content) return null;

  const { IconComponent, iconColor, iconBgColor } = content;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg" // e.g., max-w-md or max-w-lg
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0 px-4 py-3 sm:px-6">
          {/* Nút "Cancel" hoặc "Update Profile" (Secondary) */}
          {type === 'missingInfo' ? (
            <Link href={{ pathname: '/dashboard', query: { tab: 'profile' } }} passHref legacyBehavior>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {content.cancelText}
              </button>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {content.cancelText}
            </button>
          )}

          {/* Nút "Enable Anyway" hoặc "Enable" (Primary) */}
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${content.confirmButtonClass}`}
          >
            {content.confirmText}
          </button>
        </div>
      }
    >
      {/* Main content area */}
      {/* Giảm padding trên và dưới (py-4 thay vì p-6), giữ padding ngang (px-6) */}
      <div className="px-6 py-4 text-center">
        {/* Icon with background - giảm kích thước và margin */}
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor} mb-3`}>
          {/* Giảm kích thước icon */}
          <IconComponent size={28} className={iconColor} aria-hidden="true" />
        </div>

        {/* Title - giảm margin dưới */}
        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2"> {/* Giảm text-xl thành text-lg, leading-7 thành leading-6 */}
          {content.title}
        </h3>

        {/* Message - giảm margin trên nếu có additionalMessage */}
        <div className="text-sm text-gray-600">
          <p className="whitespace-pre-line leading-relaxed">
            {content.message}
          </p>
          {content.additionalMessage && (
            <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-500"> {/* Giảm mt-3 thành mt-2 */}
              {content.additionalMessage}
            </p>
          )}
        </div>

        {/* Privacy Section for 'enableBenefit' - giảm margin trên và padding */}
        {type === 'enableBenefit' && (
          <div className="mt-4 text-left text-xs text-gray-600 p-3 bg-slate-50 rounded-lg border border-slate-200"> {/* Giảm mt-6 thành mt-4, p-4 thành p-3 */}
            <div className="flex items-start space-x-2"> {/* Giảm space-x-3 thành space-x-2 */}
              <ShieldCheck size={28} className="text-green-600 flex-shrink-0 mt-0.5" /> {/* Giảm size 32 thành 28 */}
              <div>
                <h4 className="font-semibold text-sm text-slate-800 mb-0.5"> {/* Giảm mb-1 thành mb-0.5 */}
                  {t('Personalization_Privacy_Subheading') || "Your Privacy Matters"}
                </h4>
                <p className="leading-relaxed">
                  {t('Personalization_Privacy_Detail') || "We are committed to protecting your data. The information used for personalization is processed securely and is not shared with third parties. You can disable this feature at any time."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PersonalizationConfirmationModal;