// src/app/[locale]/chatbot/livechat/LiveChatAPIConfig.tsx
"use client";
import { useEffect, memo } from "react";
import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import {
  englishGetConferencesDeclaration,
  englishGetJournalsDeclaration,
  englishGetWebsiteInfoDeclaration,
  englishNavigationDeclaration,
  englishManageFollowDeclaration,
  englishManageCalendarDeclaration,
  englishSendEmailToAdminDeclaration, // Retained for completeness, ensure handler exists if used
  englishOpenGoogleMapDeclaration,
} from "../lib/functions";
import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { FunctionDeclaration as LiveChatFunctionDeclaration } from '@google/generative-ai';
import { appConfig } from "@/src/middleware";
import { usePathname } from 'next/navigation';
import { useLoggerStore } from '@/src/app/[locale]/chatbot/livechat/lib/store-logger';
import { ToolResponseMessage } from "./multimodal-live-types";
import { toolHandlers } from './services/tool.handlers'; // Import the handlers

// Define types for props
export type LiveChatAPIConfigProps = {
  outputModality: OutputModality;
  selectedVoice: PrebuiltVoice;
  language: Language;
  systemInstructions: string;
};

function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
  const { client, setConfig } = useLiveAPIContext();
  const { log: logToStore } = useLoggerStore();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1];

  // Effect for setting up initial Live API client configuration
  useEffect(() => {
    console.log(`Configuring API for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}, Locale=${currentLocale}`);
    const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
    const generationConfig: any = {
      responseModalities: modalitiesConfig,
    };
    if (outputModality === 'audio') {
      generationConfig.speechConfig = {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
      };
    }

    // Active function declarations (Consider making this dynamic based on language if needed in future)
    const activeFunctionDeclarations: LiveChatFunctionDeclaration[] = [
      englishGetConferencesDeclaration,
      englishGetJournalsDeclaration,
      englishGetWebsiteInfoDeclaration,
      englishNavigationDeclaration,
      englishManageFollowDeclaration,
      englishManageCalendarDeclaration,
      englishSendEmailToAdminDeclaration, // Keep if it's still a declared function, otherwise remove
      englishOpenGoogleMapDeclaration,
    ];

    const finalConfig = {
      model: "models/gemini-2.0-flash-live-001",
      generationConfig: generationConfig,
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      },
      tools: [
        {
          functionDeclarations: activeFunctionDeclarations,
        },
      ],
    };
    console.log("Setting config with functions:", JSON.stringify(finalConfig.tools, null, 2));
    setConfig(finalConfig);
  }, [setConfig, outputModality, selectedVoice, language, systemInstructions, currentLocale]);

  // Effect for handling tool calls
  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`Got toolcall`, toolCall);
      const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "https://confhub.westus3.cloudapp.azure.com/api/v1";
      const NEXT_PUBLIC_FRONTEND_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";
      
      const handlerConfig = {
        databaseUrl: NEXT_PUBLIC_DATABASE_URL,
        frontendUrl: NEXT_PUBLIC_FRONTEND_URL,
        currentLocale: currentLocale,
      };

      const responses = [];

      for (const fc of toolCall.functionCalls) {
        try {
          const handler = toolHandlers[fc.name];
          if (handler) {
            console.log(`Executing handler for ${fc.name}`);
            const result = await handler(fc, handlerConfig);
            responses.push(result);
          } else {
            console.warn(`Unknown function call name received: ${fc.name}`);
            responses.push({
              response: { content: { type: "error", message: `Unknown function: ${fc.name}` } },
              id: fc.id
            });
          }
        } catch (error: any) {
          console.error(`Error processing function call ${fc.name}:`, error);
          let errorMessage = error.message || "An unexpected error occurred.";
          if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";
          responses.push({
            response: { content: { type: "error", message: `Failed to execute ${fc.name}: ${errorMessage}` } },
            id: fc.id
          });
        }
      }

      if (responses.length > 0) {
        console.log("Sending tool responses:", { functionResponses: responses });
        const toolResponseMessageForLog: ToolResponseMessage = {
          toolResponse: { functionResponses: responses }
        };
        logToStore({
          date: new Date(),
          type: "client.toolResponse",
          message: toolResponseMessageForLog,
          count: 1
        });
        client.sendToolResponse({ functionResponses: responses });
      } else {
        console.log("No responses generated for this tool call batch.");
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, currentLocale, logToStore]); // Removed setConfig from dependencies as it's stable

  return null; // This component does not render UI
}

export const LiveChatAPIConfig = memo(LiveChatAPI);