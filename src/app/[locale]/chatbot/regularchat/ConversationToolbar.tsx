// src/app/[locale]/chatbot/ConversationToolbar.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Pencil, Pin, PinOff, Trash2, Eraser } from 'lucide-react';
// --- IMPORT STORE MỚI HOẶC HOOKS TỪ STOREHOOKS ---
import {
    useActiveConversationState, // Cho activeConversationId
    useConversationListState,   // Cho conversationList
    useConversationActions      // Cho các actions
} from '@/src/app/[locale]/chatbot/stores/storeHooks'; // Điều chỉnh path tới storeHooks.ts
import { useTranslations } from 'next-intl';
// useShallow không cần thiết ở đây vì các hook trong storeHooks đã sử dụng nó

const ConversationToolbar: React.FC = () => {
  const t = useTranslations();

  // --- Lấy state và actions từ các store đã tách ---
  const { activeConversationId } = useActiveConversationState();
  const { conversationList } = useConversationListState();
  const {
    renameConversation,
    pinConversation,
    clearConversation,
    deleteConversation,
  } = useConversationActions();

  // --- State cục bộ cho UI của toolbar ---
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState('');

  // --- Tính toán activeConversation metadata ---
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversationList.find(conv => conv.id === activeConversationId);
  }, [activeConversationId, conversationList]);

  const prevActiveConversationIdRef = useRef(activeConversationId);

  // --- Đồng bộ state cục bộ với activeConversation từ store ---
  useEffect(() => {
    if (activeConversation) {
      if (!isEditingTitle) {
        setNewTitleInput(activeConversation.title);
      }
    } else {
      setNewTitleInput(t('New_Chat'));
    }

    if (activeConversationId !== prevActiveConversationIdRef.current) {
      setIsEditingTitle(false); // Reset editing khi conversation thay đổi
    }
    prevActiveConversationIdRef.current = activeConversationId;
  }, [activeConversation, activeConversationId, isEditingTitle, t]);


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
    if (
      window.confirm(
        t('Confirm_Clear_Conversation', { title: activeConversation.title })
      )
    ) {
      clearConversation(activeConversationId);
    }
  }, [activeConversationId, activeConversation, clearConversation, t]);

  const handleDelete = useCallback(() => {
    if (!activeConversationId || !activeConversation) return;
    if (
      window.confirm(
        t('Confirm_Delete_Conversation', { title: activeConversation.title })
      )
    ) {
      // deleteConversation action từ conversationStore sẽ emit event.
      // MainLayout sẽ theo dõi activeConversationId. Nếu nó bị set về null
      // (do _onSocketConversationDeleted xử lý), MainLayout sẽ điều hướng.
      deleteConversation(activeConversationId);
    }
  }, [activeConversationId, activeConversation, deleteConversation, t]);


   if (!activeConversationId || !activeConversation) {
    // Thanh toolbar trống khi không có active conversation
    return (
      <div className='flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 py-2 shadow-sm sm:h-14 sm:px-4 dark:border-gray-700 dark:bg-gray-800'>
        {/* Có thể để trống hoặc một placeholder rất nhỏ */}
      </div>
    );
  }


  const currentTitle = activeConversation.title;
  const isPinned = activeConversation.isPinned;

  return (
    // - `h-14` -> `h-12 sm:h-14`
    // - `px-4 py-2` -> `px-2 py-1.5 sm:px-4 sm:py-2`
    <div className='flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 py-1.5 shadow-sm sm:h-14 sm:px-4 sm:py-2 dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex min-w-0 items-center'>
        {isEditingTitle ? (
          <input
            type='text'
            value={newTitleInput}
            onChange={e => setNewTitleInput(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { /* ... */ }}
            // - `text-sm` -> `text-xs sm:text-sm`
            // - `px-2 py-1` -> `px-1.5 py-0.5 sm:px-2 sm:py-1`
            className='mr-1.5 rounded-md border border-gray-300 px-1.5 py-0.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:mr-2 sm:px-2 sm:py-1 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            autoFocus
          />
        ) : (
          <h2
            // - `text-base` -> `text-sm sm:text-base`
            className='truncate text-sm font-semibold text-gray-800 sm:text-base dark:text-gray-100'
            title={currentTitle}
            onDoubleClick={() => {
                setNewTitleInput(currentTitle); // Đảm bảo input được khởi tạo đúng trước khi edit
                setIsEditingTitle(true);
            }}
           >
            {currentTitle}
          </h2>
        )}
      </div>

      {/* - `space-x-2` -> `space-x-1 sm:space-x-1.5` (giảm khoảng cách giữa các nút) */}
      <div className='flex items-center space-x-1 sm:space-x-1.5'>
        {/* Các nút: giảm padding và kích thước icon */}
        {/* Ví dụ cho nút Rename/Save */}
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
    </div>
  );
};

export default ConversationToolbar;