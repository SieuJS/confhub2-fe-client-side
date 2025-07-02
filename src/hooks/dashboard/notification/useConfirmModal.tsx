// src/hooks/dashboard/notifications/useConfirmationModal.ts
import { useState, useCallback, ReactNode } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void | Promise<void>;
}

const useConfirmationModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirmationModal = useCallback(
    (title: string, message: ReactNode, onConfirm: () => void | Promise<void>) => {
      setModalState({
        isOpen: true,
        title,
        message,
        onConfirm,
      });
    },
    []
  );

  const hideConfirmationModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalState,
    showConfirmationModal,
    hideConfirmationModal,
  };
};

export default useConfirmationModal;