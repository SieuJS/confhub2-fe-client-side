// src/app/[locale]/chatbot/livechat/LiveChatAPIConfig.tsx
"use client";
import { useEffect, memo } from "react";
import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import {
  englishGetConferencesDeclaration,
  englishGetJournalsDeclaration,
  englishDrawChartDeclaration,
  englishGetWebsiteInfoDeclaration,
  englishManageCalendarDeclaration,
  englishManageFollowDeclaration,
  englishNavigationDeclaration,
  englishSendEmailToAdminDeclaration,
  englishOpenGoogleMapDeclaration,
} from "../lib/functions";

import {
  LiveChatSessionConfig,
  PrebuiltVoice,
  Language as AppLanguage,
  ToolCallPayload, // ToolCallPayload của bạn là SDKLiveServerToolCall
  ToolResponsePayload, // <-- THÊM IMPORT NÀY

} from '@/src/app/[locale]/chatbot/lib/live-chat.types';

import {
  FunctionDeclaration as SDKFunctionDeclaration,
  // Tool as SDKTool, // Không dùng trực tiếp
  FunctionResponse as SDKFunctionResponse,
  // LiveClientMessage as SDKLiveClientMessage, // Không dùng trực tiếp
  Content as SDKContent,
  // GenerationConfig as SDKGenerationConfig, // Không dùng trực tiếp
  SpeechConfig as SDKSpeechConfig,
  Modality as SDKModality,
  AudioTranscriptionConfig as SDKAudioTranscriptionConfig,
} from '@google/genai';

import { appConfig } from "@/src/middleware"; // Đảm bảo đường dẫn đúng
import { usePathname } from 'next/navigation'; // Sử dụng next/navigation thay vì src/navigation nếu đó là alias
import { useLoggerStore } from '@/src/app/[locale]/chatbot/livechat/lib/store-logger';
import { toolHandlers } from './services/tool.handlers';
import { getBcp47LanguageCode } from './utils/languageUtils';

// export type OutputModalityString = "text" | "audio" | "image"; // Không còn dùng

export type LiveChatAPIConfigProps = {
  outputModality: SDKModality;
  selectedVoice: PrebuiltVoice;
  language: AppLanguage;
  systemInstructions: string;
};

function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
  const {
    session, // session là SDKSession | null
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
      model: "models/gemini-2.0-flash-live-001",
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      } as SDKContent,
      tools: [],
      responseModalities: [outputModality],
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
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
      appLevelConfig.inputAudioTranscription = {};
      appLevelConfig.outputAudioTranscription = {};
    }

    const activeFunctionDeclarations: SDKFunctionDeclaration[] = [
      englishGetConferencesDeclaration,
      englishGetJournalsDeclaration,
      englishGetWebsiteInfoDeclaration,
      englishNavigationDeclaration,
      englishManageFollowDeclaration,
      englishManageCalendarDeclaration,
      englishSendEmailToAdminDeclaration,
      englishOpenGoogleMapDeclaration,
    ];

    if (activeFunctionDeclarations.length > 0) {
      appLevelConfig.tools = [{ functionDeclarations: activeFunctionDeclarations }];
    }

    console.log("[LiveChatAPIConfig] Attempting to set appLevelConfig:", JSON.stringify(appLevelConfig, null, 2));

    // logToStore({
    //   date: new Date(),
    //   type: "client.setConfigAttempt",
    //   message: `Attempting to set config: ${JSON.stringify({
    //     model: appLevelConfig.model,
    //     outputModality: SDKModality[outputModality],
    //     selectedVoice,
    //     language: language,
    //     bcp47Language: bcp47LanguageCode,
    //     speechConfigIncluded: !!appLevelConfig.speechConfig,
    //     systemInstructionLength: systemInstructions.length,
    //     numTools: appLevelConfig.tools?.[0]?.functionDeclarations?.length || 0,
    //     inputTranscriptionEnabled: !!appLevelConfig.inputAudioTranscription,
    //     outputTranscriptionEnabled: !!appLevelConfig.outputAudioTranscription,
    //     temperature: appLevelConfig.temperature,
    //     topK: appLevelConfig.topK,
    //     topP: appLevelConfig.topP,
    //     maxOutputTokens: appLevelConfig.maxOutputTokens,
    //   }, null, 2)}`
    // });

    setConfig(appLevelConfig);

  }, [setConfig, outputModality, selectedVoice, language, systemInstructions, currentLocale, logToStore]);

  // useEffect này để đăng ký tool call event
  useEffect(() => {
    const onToolCallCallback = async (toolCallPayload: ToolCallPayload) => {
      console.log(`[LiveChatAPIConfig] Got toolcall payload (inside callback):`, toolCallPayload);

      const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "https://confhub.westus3.cloudapp.azure.com/api/v1";
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
                  id: fc.id, // Luôn dùng fc.id để khớp với FunctionCall gốc
                  name: fc.name,
                  response: resultFromHandler.response,
                });
                console.log(`[LiveChatAPIConfig] Handler for ${fc.name} executed. Response added.`);
              } catch (error: any) {
                console.error(`[LiveChatAPIConfig] Error in handler for ${fc.name}:`, error);
                let errorMessage = error.message || "An unexpected error occurred in handler.";
                if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";
                responsesForSDK.push({
                  id: fc.id,
                  name: fc.name,
                  response: { content: { type: "error", message: `Handler error for ${fc.name}: ${errorMessage}` } },
                });
              }
            } else {
              console.warn(`[LiveChatAPIConfig] No handler found for function: ${fc.name}`);
              responsesForSDK.push({
                id: fc.id,
                name: fc.name,
                response: { content: { type: "error", message: `Unknown function: ${fc.name}` } },
              });
            }
          } else {
            console.error(`[LiveChatAPIConfig] Received function call with missing name or id:`, fc);
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
        const toolResponseData: ToolResponsePayload = { functionResponses: responsesForSDK }; // <-- TẠO PAYLOAD

        console.log("[LiveChatAPIConfig] Sending tool responses:", JSON.stringify(toolResponseData, null, 2));
        sendToolResponse(toolResponseData); // sendToolResponse vẫn nhận { functionResponses: ... }

        logToStore({
          date: new Date(),
          type: "client.toolResponseSent",
          message: toolResponseData, // <-- LƯU TRỮ OBJECT PAYLOAD THỰC SỰ
          summary: `Sent tool responses for ${responsesForSDK.length} function calls.`, // (Tùy chọn) Giữ lại summary dạng string nếu cần
          count: responsesForSDK.length
        });
      } else {
        console.log("[LiveChatAPIConfig] No responses generated for this tool call batch (after processing).");
      }
    };


    // Chỉ đăng ký khi session thực sự tồn tại và các hàm on/off cũng đã sẵn sàng
    // (on/off thường ổn định, nhưng session là yếu tố chính ở đây)
    if (session && typeof on === 'function' && typeof off === 'function') {
      console.log("[LiveChatAPIConfig] Session is available. Subscribing to 'toolcall' event.");
      on("toolcall", onToolCallCallback);
      return () => {
        console.log("[LiveChatAPIConfig] Cleaning up 'toolcall' event subscription.");
        off("toolcall", onToolCallCallback);
      };
    } else {
      console.log("[LiveChatAPIConfig] Session not available or on/off not ready, not subscribing to 'toolcall'. Current session:", session);
      // Không return gì cả, useEffect sẽ chạy lại khi session hoặc on/off thay đổi
    }
    // Thêm session, on, off vào dependency array.
    // sendToolResponse, currentLocale, logToStore cũng cần nếu chúng thay đổi và bạn muốn đăng ký lại.
  }, [session, on, off, sendToolResponse, currentLocale, logToStore]); // QUAN TRỌNG: session, on, off ở đây

  return null;
}

export const LiveChatAPIConfig = memo(LiveChatAPI);