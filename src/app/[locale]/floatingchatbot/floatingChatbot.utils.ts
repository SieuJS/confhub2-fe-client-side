// src/app/[locale]/floatingchatbot/floatingChatbot.utils.ts
import { FLOATING_CHATBOT_WRAPPER_ID } from './floatingChatbot.constants';

export const getCurrentPageTextContent = (
  maxLength: number = 50000
): string | null => {
  if (typeof window !== 'undefined' && document?.body?.innerText) {
    const chatbotWrapper = document.getElementById(FLOATING_CHATBOT_WRAPPER_ID);
    let originalDisplay = '';

    if (chatbotWrapper) {
      originalDisplay = chatbotWrapper.style.display;
      chatbotWrapper.style.display = 'none';
    }

    let text = document.body.innerText;

    if (chatbotWrapper) {
      chatbotWrapper.style.display = originalDisplay;
    }
    text = text.replace(/\s\s+/g, ' ').replace(/\n\n+/g, '\n').trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + '\n[...content truncated]'
      : text;
  }
  return null;
};

export const getCurrentPageUrl = (): string | null => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return null;
};