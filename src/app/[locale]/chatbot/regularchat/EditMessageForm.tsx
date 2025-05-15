// src/app/[locale]/chatbot/regularchat/EditMessageForm.tsx
import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface EditMessageFormProps {
  editedText: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const EditMessageForm: React.FC<EditMessageFormProps> = ({
  editedText,
  textareaRef,
  onChange,
  onKeyDown,
}) => {
  return (
    <div className="flex flex-col w-full">
      <TextareaAutosize
        ref={textareaRef}
        value={editedText}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`
          w-full resize-none overflow-y-auto rounded-md border p-2 text-sm
          bg-white dark:bg-gray-600 text-gray-900 dark:text-white
          border-blue-500 ring-1 ring-blue-500 focus:border-blue-500 focus:ring-blue-500
        `}
        minRows={1}
        maxRows={5}
      />
    </div>
  );
};

export default EditMessageForm;