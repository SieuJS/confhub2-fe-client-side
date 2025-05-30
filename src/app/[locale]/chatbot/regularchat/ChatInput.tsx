// src/app/[locale]/chatbot/chat/regularchat/ChatInput.tsx
import React, { useRef, useEffect, useCallback } from 'react'; // Bỏ useState nếu không dùng inputValue nội bộ
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../../utils/Button';
import { GrSend } from 'react-icons/gr';
// BsCheckLg không cần nữa nếu ChatInput không xử lý edit
import { Paperclip, X as LucideX } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,application/pdf,text/csv";
const MAX_FILE_SIZE_MB = 10;
const MAX_TOTAL_FILES = 5;

interface ChatInputProps {
  inputValue: string; // Prop mới: giá trị input từ component cha
  onInputChange: (value: string) => void; // Prop mới: callback khi input thay đổi
  onSendFilesAndMessage: (message: string, files: File[]) => void;
  onRegisterFillFunction: (fillFunc: (text: string) => void) => void;
  disabled?: boolean;
  // isEditing và initialEditText không cần nữa
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue, // Sử dụng prop này
  onInputChange, // Sử dụng prop này
  onSendFilesAndMessage,
  onRegisterFillFunction,
  disabled = false,
}) => {
  const t = useTranslations();

  // const [inputValue, setInputValue] = useState<string>(''); // Bỏ state nội bộ
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]); // Giữ lại state cho files
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fillFunc = (text: string) => {
      if (!disabled) {
        onInputChange(text); // Cập nhật state ở cha
        setTimeout(() =>
          inputRef.current?.dispatchEvent(new Event('input', { bubbles: true })),
          0
        );
        inputRef.current?.focus();
      }
    };
    if (onRegisterFillFunction) {
      onRegisterFillFunction(fillFunc);
    }
  }, [onRegisterFillFunction, disabled, onInputChange]);

  // useEffect cho isEditing và initialEditText có thể được xóa hoàn toàn
  // useEffect(() => {
  //   if (isEditing) {
  //     setInputValue(initialEditText); // Không còn setInputValue nội bộ
  //     setSelectedFiles([]);
  //     inputRef.current?.focus();
  //   }
  // }, [isEditing, initialEditText]);


  const handleInputChangeInternal = useCallback( // Đổi tên để tránh nhầm lẫn
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!disabled) {
        onInputChange(e.target.value); // Gọi callback của cha
      }
    },
    [disabled, onInputChange]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      let validFiles: File[] = [];
      let alertShown = false;

      newFiles.forEach(file => {
        if (selectedFiles.length + validFiles.length >= MAX_TOTAL_FILES) {
          if (!alertShown) {
            alert(t('ChatInput_Error_MaxFiles', { max: MAX_TOTAL_FILES }));
            alertShown = true;
          }
          return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          if (!alertShown) {
            alert(t('ChatInput_Error_FileSize', { name: file.name, maxSize: MAX_FILE_SIZE_MB }));
            alertShown = true;
          }
          return;
        }
        // Add more specific type checks if ACCEPTED_FILE_TYPES string isn't enough for browser
        validFiles.push(file);
      });

      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles].slice(0, MAX_TOTAL_FILES));
      // Reset file input to allow selecting the same file again if removed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSendMessageInternal = useCallback(() => {
    const trimmedMessage = inputValue.trim(); // inputValue giờ là prop
    // Chỉ gửi nếu không bị disabled. Việc ChatInput có đang "edit" hay không không còn là mối bận tâm của nó.
    if (!disabled && (trimmedMessage || selectedFiles.length > 0)) {
      onSendFilesAndMessage(trimmedMessage, selectedFiles);
      // Việc xóa inputValue và selectedFiles sẽ do component cha quyết định
      // sau khi onSendFilesAndMessage được gọi (ví dụ, trong handleSendFromChatInput của RegularChat)
      // Tuy nhiên, selectedFiles là state cục bộ, nên có thể xóa ở đây.
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'; // Reset chiều cao textarea
      }
    }
  }, [inputValue, selectedFiles, onSendFilesAndMessage, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessageInternal();
      }
    },
    [handleSendMessageInternal, disabled]
  );

  const placeholderText = t('Type_message_or_attach_files');
  // Nút gửi giờ chỉ là "Send message"
  const buttonAriaLabel = t('Send_message');

  return (
    <div className='flex flex-col'>
      {/* Selected files preview */}
      {selectedFiles.length > 0 && ( // Không cần !isEditing nữa
        <div className="mb-2 flex flex-wrap gap-2 px-1 py-1 border-b border-gray-200 dark:border-gray-600 max-h-24 overflow-y-auto">
          {selectedFiles.map(file => (
            <div
              key={file.name}
              className="flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-200"
            >
              <span>{file.name.length > 20 ? `${file.name.substring(0, 17)}...` : file.name}</span>
              <button
                onClick={() => handleRemoveFile(file.name)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={t('ChatInput_Remove_File', { fileName: file.name })}
              >
                <LucideX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`flex w-full items-end rounded-2xl bg-white px-1 py-0.5 shadow-sm transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:bg-gray-700 dark:focus-within:border-blue-400 ${selectedFiles.length > 0 ? 'rounded-b-2xl rounded-t-none' : 'rounded-2xl'}`}>
        <Button
          variant='secondary'
          size='small'
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES} // Chỉ disable dựa trên disabled chung và số lượng file
          aria-label={t('ChatInput_Attach_File_Button_Label')}
          className='ml-0.25 rounded-xl mr-1.5 mb-0.5 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        >
          <Paperclip size={16} />
        </Button>
        <input
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES} // Chỉ disable dựa trên disabled chung và số lượng file
        />
        <TextareaAutosize
          ref={inputRef}
          value={inputValue} // Dùng prop inputValue
          onChange={handleInputChangeInternal} // Dùng hàm internal gọi callback
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={`
             max-h-28 flex-grow resize-none overflow-y-auto rounded-l-2xl
            bg-transparent px-1.5 py-1 text-sm text-gray-800
            focus:border-transparent focus:outline-none disabled:cursor-not-allowed
            disabled:bg-gray-100 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-600
          `}
          rows={1}
          disabled={disabled} // Prop disabled sẽ khóa textarea khi cần
        />
        <Button
          variant={'secondary'} // Nút gửi luôn là secondary (hoặc primary nếu muốn)
          size='mini'
          rounded={true}
          onClick={handleSendMessageInternal}
          disabled={disabled || (!inputValue.trim() && selectedFiles.length === 0)}
          aria-label={buttonAriaLabel}
          className='mb-0.5 ml-1.5 mr-0.25 flex-shrink-0 '
        >
          {/* Luôn là icon gửi tin nhắn mới */}
          <GrSend size={12} className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};


export default ChatInput;