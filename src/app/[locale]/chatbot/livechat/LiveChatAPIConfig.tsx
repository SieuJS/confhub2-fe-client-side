// src/app/[locale]/chatbot/livechat/LiveChatAPIConfig.tsx
"use client";
import { useEffect, memo } from "react";
import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import {
  englishGetConferencesDeclaration,
  englishGetWebsiteInfoDeclaration,
  englishManageCalendarDeclaration,
  englishManageFollowDeclaration,
  englishNavigationDeclaration,
  englishSendEmailToAdminDeclaration,
  englishOpenGoogleMapDeclaration,
  englishManageBlacklistDeclaration,
} from "../language/functions";

import {
  LiveChatSessionConfig,
  PrebuiltVoice,
  Language as AppLanguage,
  ToolCallPayload, // ToolCallPayload của bạn là SDKLiveServerToolCall
  ToolResponsePayload, // <-- THÊM IMPORT NÀY

} from '@/src/app/[locale]/chatbot/lib/live-chat.types';

import {
  FunctionDeclaration as SDKFunctionDeclaration,
  FunctionResponse as SDKFunctionResponse,
  Content as SDKContent,
  Modality as SDKModality,
} from '@google/genai';

import { appConfig } from "@/src/middleware";
import { usePathname } from 'next/navigation';
import { useLoggerStore } from '@/src/app/[locale]/chatbot/livechat/lib/store-logger';
import { toolHandlers } from './services/tool.handlers';
import { getBcp47LanguageCode } from './utils/languageUtils';

export type LiveChatAPIConfigProps = {
  outputModality: SDKModality;
  selectedVoice: PrebuiltVoice;
  language: AppLanguage;
  systemInstructions: string;
};

function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
  const {
    session,
    setConfig,
    sendToolResponse,
    on,
    off
  } = useLiveAPIContext();
  const { log: logToStore } = useLoggerStore();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as AppLanguage;

  useEffect(() => {
    console.log(
      `[LiveChatAPIConfig] useEffect: Constructing LiveChatSessionConfig for: Modality=${SDKModality[outputModality]} (raw: ${outputModality}), Voice=${selectedVoice}, AppLanguage=${language}, Locale=${currentLocale}`
    );
    const bcp47LanguageCode = getBcp47LanguageCode(language);

    const appLevelConfig: LiveChatSessionConfig = {
      model: "models/gemini-live-2.5-flash-preview",
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      } as SDKContent,
      tools: [],
      responseModalities: [outputModality],
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      // LUÔN BẬT INPUT AUDIO TRANSCRIPTION NẾU GIAO DIỆN CHO PHÉP NHẬP LIỆU ÂM THANH
      inputAudioTranscription: {}, // <--- ĐẢM BẢO DÒNG NÀY LUÔN CÓ
    };

    if (outputModality === SDKModality.AUDIO) {
      appLevelConfig.speechConfig = {
        languageCode: bcp47LanguageCode,
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: selectedVoice,
          }
        }
      };
      appLevelConfig.outputAudioTranscription = {};
    }

    const activeFunctionDeclarations: SDKFunctionDeclaration[] = [
      englishGetConferencesDeclaration,
      englishGetWebsiteInfoDeclaration,
      englishNavigationDeclaration,
      englishManageFollowDeclaration,
      englishManageCalendarDeclaration,
      englishManageBlacklistDeclaration,
      englishSendEmailToAdminDeclaration,
      englishOpenGoogleMapDeclaration,
    ];

    if (activeFunctionDeclarations.length > 0) {
      appLevelConfig.tools = [{ functionDeclarations: activeFunctionDeclarations }];
    }

    console.log("[LiveChatAPIConfig] Attempting to set appLevelConfig:", JSON.stringify(appLevelConfig, null, 2));

    setConfig(appLevelConfig);

  }, [setConfig, outputModality, selectedVoice, language, systemInstructions, currentLocale, logToStore]);

  // useEffect này để đăng ký tool call event
  useEffect(() => {
    const onToolCallCallback = async (toolCallPayload: ToolCallPayload) => {
      console.log(`[LiveChatAPIConfig] Got toolcall payload (inside callback):`, toolCallPayload);

      const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "https://confhub.ddns.net/database/api/v1";
      const NEXT_PUBLIC_FRONTEND_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

      const handlerConfig = {
        databaseUrl: NEXT_PUBLIC_DATABASE_URL,
        frontendUrl: NEXT_PUBLIC_FRONTEND_URL,
        currentLocale: currentLocale,
      };

      const responsesForSDK: SDKFunctionResponse[] = [];

      if (toolCallPayload.functionCalls) {
        for (const fc of toolCallPayload.functionCalls) {
          if (fc.name && fc.id) {
            console.log(`[LiveChatAPIConfig] Processing function call: Name='${fc.name}', ID='${fc.id}'`);
            console.log(`[LiveChatAPIConfig] Available tool handlers:`, Object.keys(toolHandlers));
            const handler = toolHandlers[fc.name];
            if (handler) {
              console.log(`[LiveChatAPIConfig] Executing handler for ${fc.name} with id ${fc.id}`);
              try {
                const resultFromHandler = await handler(fc, handlerConfig);
                responsesForSDK.push({
                  id: fc.id,
                  name: fc.name,
                  response: resultFromHandler.response,
                });
                console.log(`[LiveChatAPIConfig] Handler for ${fc.name} executed. Response added.`);
              } catch (error: any) {
                // console.error(`[LiveChatAPIConfig] Error in handler for ${fc.name}:`, error);
                let errorMessage = error.message || "An unexpected error occurred in handler.";
                if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";
                responsesForSDK.push({
                  id: fc.id,
                  name: fc.name,
                  response: { content: { type: "error", message: `Handler error for ${fc.name}: ${errorMessage}` } },
                });
              }
            } else {
              // console.warn(`[LiveChatAPIConfig] No handler found for function: ${fc.name}`);
              responsesForSDK.push({
                id: fc.id,
                name: fc.name,
                response: { content: { type: "error", message: `Unknown function: ${fc.name}` } },
              });
            }
          } else {
            // console.error(`[LiveChatAPIConfig] Received function call with missing name or id:`, fc);
            if (fc.id) {
              responsesForSDK.push({
                id: fc.id,
                name: fc.name || "unknownFunction",
                response: { content: { type: "error", message: `Function call received with missing name.` } },
              });
            }
          }
        }
      }

      if (responsesForSDK.length > 0) {
        // Create the payload for sending.
        // The inferred type of `payloadForSend` will be `{ functionResponses: SDKFunctionResponse[] }`
        // because `responsesForSDK` is `SDKFunctionResponse[]`.
        // This matches the expected parameter type of `sendToolResponse`.
        const payloadForSend = { functionResponses: responsesForSDK };

        console.log("[LiveChatAPIConfig] Sending tool responses:", JSON.stringify(payloadForSend, null, 2));
        sendToolResponse(payloadForSend); // Now type-correct

        // For logging, we can use the ToolResponsePayload type.
        // This assignment is safe because `payloadForSend` is more specific than `ToolResponsePayload`.
        const toolResponseDataForLog: ToolResponsePayload = payloadForSend;

        logToStore({
          date: new Date(),
          type: "client.toolResponseSent",
          message: toolResponseDataForLog, // This will be correct if StreamingLog.message includes ToolResponsePayload
          count: responsesForSDK.length
        });
      } else {
        console.log("[LiveChatAPIConfig] No responses generated for this tool call batch (after processing).");
      }
    };

    if (session && typeof on === 'function' && typeof off === 'function') {
      console.log("[LiveChatAPIConfig] Session is available. Subscribing to 'toolcall' event.");
      on("toolcall", onToolCallCallback);
      return () => {
        console.log("[LiveChatAPIConfig] Cleaning up 'toolcall' event subscription.");
        off("toolcall", onToolCallCallback);
      };
    } else {
      console.log("[LiveChatAPIConfig] Session not available or on/off not ready, not subscribing to 'toolcall'. Current session:", session);
    }
  }, [session, on, off, sendToolResponse, currentLocale, logToStore]);
  return null;
}

export const LiveChatAPIConfig = memo(LiveChatAPI);