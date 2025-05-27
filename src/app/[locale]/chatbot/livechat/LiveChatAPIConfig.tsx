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
  Language as AppLanguage, // Rename to avoid conflict with SDK Language if any
  ToolCallPayload,
} from '@/src/app/[locale]/chatbot/lib/live-chat.types'; // Using unified types

import {
  FunctionDeclaration as SDKFunctionDeclaration,
  Tool as SDKTool,
  FunctionResponse as SDKFunctionResponse,
  LiveClientMessage as SDKLiveClientMessage,
  Content as SDKContent,
  GenerationConfig as SDKGenerationConfig,
  SpeechConfig as SDKSpeechConfig,
  Modality as SDKModality,
} from '@google/genai';

import { appConfig } from "@/src/middleware";
import { usePathname } from 'next/navigation';
import { useLoggerStore } from '@/src/app/[locale]/chatbot/livechat/lib/store-logger';
import { toolHandlers } from './services/tool.handlers';
import { getBcp47LanguageCode } from './utils/languageUtils'; // Import the new utility

export type OutputModalityString = "text" | "audio" | "image";

export type LiveChatAPIConfigProps = {
  outputModality: SDKModality;
  selectedVoice: PrebuiltVoice;
  language: AppLanguage; // Use your application's Language type
  systemInstructions: string;
};

function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
  const { client, setConfig } = useLiveAPIContext();
  const { log: logToStore } = useLoggerStore();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as AppLanguage;

  useEffect(() => {
    console.log(`Constructing LiveChatSessionConfig for: Modality=${outputModality}, Voice=${selectedVoice}, AppLanguage=${language}, Locale=${currentLocale}`);

    const bcp47LanguageCode = getBcp47LanguageCode(language); // Get BCP-47 code
    console.log(`Using BCP-47 language code for speechConfig: ${bcp47LanguageCode}`);

    const appLevelConfig: LiveChatSessionConfig = {
      model: "models/gemini-2.0-flash-live-001", // Ensure this model supports live/bidi
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      } as SDKContent,
      generationConfig: {} as Partial<SDKGenerationConfig>,
      tools: [],

      // Now outputModality is already SDKModality, so direct usage
      responseModalities: [outputModality], // Simpler: just use the passed enum member in an array
      // Or, if you only support AUDIO/TEXT:
      // outputModality === SDKModality.AUDIO ? [SDKModality.AUDIO] : [SDKModality.TEXT]
      // The simpler [outputModality] assumes it's already one of the desired values.
    };

    // Compare with SDKModality enum member
    if (outputModality === SDKModality.AUDIO) {
      appLevelConfig.speechConfig = {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
        languageCode: bcp47LanguageCode,
      } as SDKSpeechConfig;
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
      appLevelConfig.tools = [
        {
          functionDeclarations: activeFunctionDeclarations,
        },
      ];
    }

    console.log("Calling setConfig with appLevelConfig:", JSON.stringify(appLevelConfig, null, 2));
    logToStore({
      date: new Date(),
      type: "client.setConfigAttempt",
      message: `Attempting to set config: ${JSON.stringify({
        model: appLevelConfig.model,
        outputModality,
        selectedVoice,
        language: language, // Log app language
        bcp47Language: bcp47LanguageCode, // Log BCP-47 code used
        systemInstructionLength: systemInstructions.length,
        numTools: appLevelConfig.tools?.[0]?.functionDeclarations?.length || 0
      })}`
    });
    setConfig(appLevelConfig);

  }, [setConfig, outputModality, selectedVoice, language, systemInstructions, currentLocale, logToStore]);

  // ... (useEffect for tool calls remains the same as the previous correct version)
  useEffect(() => {
    const onToolCall = async (toolCallPayload: ToolCallPayload) => {
      console.log(`Got toolcall payload`, toolCallPayload);
      logToStore({ date: new Date(), type: "server.toolCall", message: JSON.stringify(toolCallPayload) });

      const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "https://confhub.westus3.cloudapp.azure.com/api/v1";
      const NEXT_PUBLIC_FRONTEND_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

      const handlerConfig = {
        databaseUrl: NEXT_PUBLIC_DATABASE_URL,
        frontendUrl: NEXT_PUBLIC_FRONTEND_URL,
        currentLocale: currentLocale, // currentLocale is AppLanguage here
      };

      const responsesForSDK: SDKFunctionResponse[] = [];

      if (toolCallPayload.functionCalls) {
        for (const fc of toolCallPayload.functionCalls) {
          if (fc.name && fc.id) {
            try {
              const handler = toolHandlers[fc.name];
              if (handler) {
                console.log(`Executing handler for ${fc.name} with id ${fc.id}`);
                const resultFromHandler = await handler(fc, handlerConfig);

                const sdkResponse = new SDKFunctionResponse();
                sdkResponse.name = fc.name;
                sdkResponse.id = resultFromHandler.id;
                sdkResponse.response = resultFromHandler.response;
                responsesForSDK.push(sdkResponse);

              } else {
                console.warn(`Unknown function call name received: ${fc.name}`);
                const sdkErrorResponse = new SDKFunctionResponse();
                sdkErrorResponse.name = fc.name;
                sdkErrorResponse.id = fc.id;
                sdkErrorResponse.response = { content: { type: "error", message: `Unknown function: ${fc.name}` } };
                responsesForSDK.push(sdkErrorResponse);
              }
            } catch (error: any) {
              console.error(`Error processing function call ${fc.name}:`, error);
              let errorMessage = error.message || "An unexpected error occurred.";
              if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";

              const sdkCatchResponse = new SDKFunctionResponse();
              sdkCatchResponse.name = fc.name;
              sdkCatchResponse.id = fc.id;
              sdkCatchResponse.response = { content: { type: "error", message: `Failed to execute ${fc.name}: ${errorMessage}` } };
              responsesForSDK.push(sdkCatchResponse);
            }
          } else {
            console.error(`Received function call with missing name or id:`, fc);
            if (fc.id) {
              const sdkMissingInfoResponse = new SDKFunctionResponse();
              sdkMissingInfoResponse.name = fc.name || "unknownFunction";
              sdkMissingInfoResponse.id = fc.id;
              sdkMissingInfoResponse.response = { content: { type: "error", message: `Function call received with missing name.` } };
              responsesForSDK.push(sdkMissingInfoResponse);
            }
          }
        }
      }

      if (responsesForSDK.length > 0) {
        const toolResponsePayloadToSend = { functionResponses: responsesForSDK };
        console.log("Sending tool responses:", toolResponsePayloadToSend);
        const toolResponseMessageForLog: SDKLiveClientMessage = {
          toolResponse: toolResponsePayloadToSend
        };
        logToStore({
          date: new Date(),
          type: "client.toolResponse",
          message: JSON.stringify(toolResponseMessageForLog),
          count: responsesForSDK.length
        });
        client.sendToolResponse(toolResponsePayloadToSend);
      } else {
        console.log("No responses generated for this tool call batch.");
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, currentLocale, logToStore]);


  return null;
}

export const LiveChatAPIConfig = memo(LiveChatAPI);