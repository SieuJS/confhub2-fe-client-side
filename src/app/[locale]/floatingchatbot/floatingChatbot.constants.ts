// src/app/[locale]/floatingchatbot/floatingChatbot.constants.ts
import { pathnames as appPathnames } from '@/src/navigation';

export const FLOATING_CHATBOT_WRAPPER_ID = 'floating-chatbot-wrapper-for-text-extraction';

export const MIN_WIDTH = 320;
export const MIN_HEIGHT = 400;
export const DEFAULT_WIDTH = 384;
export const DEFAULT_HEIGHT = 600;
export const MAX_WIDTH_PERCENTAGE = 0.9;
export const MAX_HEIGHT_PERCENTAGE = 0.85
export const OPEN_ANIMATION_DURATION = 300; // ms

export const FLOATING_ICON_Z_INDEX = 2147483640;
export const CHATBOT_WINDOW_Z_INDEX = 2147483645;

export const CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING: (keyof typeof appPathnames)[] = [
  '/chatbot/regularchat',
  '/chatbot/livechat',
  '/chatbot/history',
  '/poster'
];

export const MIN_REASONABLE_TEXT_LENGTH = 500;
export const MAX_CONTEXT_FETCH_ATTEMPTS = 10;
export const CONTEXT_FETCH_RETRY_DELAY = 500; // ms