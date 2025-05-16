// src/hooks/chatbot/useMessageCopy.ts
import { useState } from 'react';
import { toast } from 'react-toastify';

export function useMessageCopy(messageToCopy: string) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isCopied) return;
    navigator.clipboard
      .writeText(messageToCopy)
      .then(() => {
        toast.success('Copied to clipboard!');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy message: ', err);
        toast.error('Copy failed. Please try again.');
      });
  };

  return {
    isCopied,
    handleCopy,
  };
}