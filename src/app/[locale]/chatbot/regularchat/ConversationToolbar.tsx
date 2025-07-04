// src/app/[locale]/chatbot/regularchat/ConversationToolbar.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Pencil, Pin, PinOff, Trash2, Eraser } from 'lucide-react';
import {
    useActiveConversationState,
    useConversationListState,
    useConversationActions
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
import { useTranslations } from 'next-intl';

import Modal from '@/src/app/[locale]/chatbot/Modal';
import Button from '../../utils/Button';

const ConversationToolbar: React.FC = () => {
  const t = useTranslations();

  const { activeConversationId } = useActiveConversationState();
  const { conversationList } = useConversationListState();
  const {
    renameConversation,
    pinConversation,
    clearConversation,
    deleteConversation,
  } = useConversationActions();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversationList.find(conv => conv.id === activeConversationId);
  }, [activeConversationId, conversationList]);

  const prevActiveConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    if (activeConversation) {
      if (!isEditingTitle) {
        setNewTitleInput(activeConversation.title);
      }
    } else {
      setNewTitleInput(t('New_Chat'));
    }

    if (activeConversationId !== prevActiveConversationIdRef.current) {
      setIsEditingTitle(false);
    }
    prevActiveConversationIdRef.current = activeConversationId;
  }, [activeConversation, activeConversationId, isEditingTitle, t]);

  const showConfirmModal = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmModalTitle(title);
      setConfirmModalMessage(message);
      setConfirmAction(() => onConfirm);
      setIsConfirmModalOpen(true);
    },
    []
  );

  const handleConfirmAction = useCallback(() => {
    if (confirmAction) {
      confirmAction();
    }
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  }, [confirmAction]);

  const handleCancelConfirm = useCallback(() => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  }, []);


  const handleRename = useCallback(() => {
    if (!activeConversationId || !activeConversation || newTitleInput.trim() === '' || newTitleInput.trim() === activeConversation.title) {
      setIsEditingTitle(false);
      if (activeConversation) setNewTitleInput(activeConversation.title);
      return;
    }
    renameConversation(activeConversationId, newTitleInput.trim());
    setIsEditingTitle(false);
  }, [activeConversationId, newTitleInput, renameConversation, activeConversation]);

  const handleTogglePin = useCallback(() => {
    if (!activeConversationId || !activeConversation) return;
    pinConversation(activeConversationId, !activeConversation.isPinned);
  }, [activeConversationId, activeConversation, pinConversation]);

  const handleClear = useCallback(() => {
    if (!activeConversationId || !activeConversation) return;
    showConfirmModal(
      t('Confirm_Clear_Conversation_Title'),
      t('Confirm_Clear_Conversation', { title: activeConversation.title }),
      () => {
        clearConversation(activeConversationId);
      }
    );
  }, [activeConversationId, activeConversation, clearConversation, t, showConfirmModal]);

  const handleDelete = useCallback(() => {
    if (!activeConversationId || !activeConversation) return;
    showConfirmModal(
      t('Confirm_Delete_Conversation_Title'),
      t('Confirm_Delete_Conversation', { title: activeConversation.title }),
      () => {
        deleteConversation(activeConversationId);
      }
    );
  }, [activeConversationId, activeConversation, deleteConversation, t, showConfirmModal]);


   if (!activeConversationId || !activeConversation) {
    return (
      <div className='flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 py-2 shadow-sm sm:h-14 sm:px-4 dark:border-gray-700 dark:bg-gray-800'>
      </div>
    );
  }


  const currentTitle = activeConversation.title;
  const isPinned = activeConversation.isPinned;

  return (
    <div className='flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 py-1.5 shadow-sm sm:h-14 sm:px-4 sm:py-2 dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex min-w-0 items-center'>
        {isEditingTitle ? (
          <input
            type='text'
            value={newTitleInput}
            onChange={e => setNewTitleInput(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleRename();
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setIsEditingTitle(false);
                setNewTitleInput(currentTitle);
                e.currentTarget.blur();
              }
            }}
            className='mr-1.5 rounded-md border border-gray-300 px-1.5 py-0.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:mr-2 sm:px-2 sm:py-1 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            autoFocus
          />
        ) : (
          <h2
            className='truncate text-sm font-semibold text-gray-800 sm:text-base dark:text-gray-100'
            title={currentTitle}
            onDoubleClick={() => {
                setNewTitleInput(currentTitle);
                setIsEditingTitle(true);
            }}
           >
            {currentTitle}
          </h2>
        )}
      </div>

      <div className='flex items-center space-x-1 sm:space-x-1.5'>
        <button
          onClick={() => {
            if (isEditingTitle) {
              handleRename();
            } else {
              setNewTitleInput(currentTitle);
              setIsEditingTitle(true);
            }
          }}
          className='rounded-md p-1.5  hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500  dark:hover:bg-gray-700 dark:hover:text-gray-200'
          title={isEditingTitle ? t('Save_Title') : t('Rename_Conversation')}
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={handleTogglePin}
          className={`rounded-md p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-1.5 dark:hover:bg-gray-700 ${isPinned
            ? 'text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
            : 'text-gray-600 dark:text-gray-300 dark:hover:text-gray-200'
            }`}
          title={isPinned ? t('Unpin_Conversation') : t('Pin_Conversation')}
        >
          {isPinned ? <PinOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Pin size={16} className="sm:w-[18px] sm:h-[18px]" />}
        </button>

        <button
          onClick={handleClear}
          className='rounded-md p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:p-1.5 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200'
          title={t('Clear_Messages')}
        >
          <Eraser size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <button
          onClick={handleDelete}
          className='rounded-md p-1 text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:p-1.5 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-red-300'
          title={t('Delete_Conversation')}
        >
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      {/* Modal xác nhận */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelConfirm}
        title={confirmModalTitle}
        // THAY ĐỔI QUAN TRỌNG Ở ĐÂY: Thêm div bọc và các lớp flexbox
        footer={
          <div className='flex justify-end space-x-2'> {/* space-x-2 để các nút sát nhau */}
            <Button variant='secondary' onClick={handleCancelConfirm} className="px-3 py-1.5 text-sm"> {/* Điều chỉnh padding và text-size */}
              {t('Common_Cancel')}
            </Button>
            <Button variant='danger' onClick={handleConfirmAction} className="px-3 py-1.5 text-sm"> {/* Điều chỉnh padding và text-size */}
              {t('Common_Confirm')}
            </Button>
          </div>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">{confirmModalMessage}</p> {/* Thêm màu chữ */}
      </Modal>
    </div>
  );
};

export default ConversationToolbar;