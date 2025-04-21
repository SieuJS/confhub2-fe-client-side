"use client";
import { useEffect, memo } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { ToolCall } from "../multimodal-live-types"; // Thêm FunctionResponsePart nếu cần type rõ ràng
import {
  getConferencesDeclaration,
  getJournalsDeclaration,
  getWebsiteInformationDeclaration,
  // drawChartDeclaration,
  systemInstructions,
} from "./functionDeclaration"; // Đảm bảo đường dẫn đúng
import { OutputModality, PrebuiltVoice } from "../page";
interface AltairComponentProps {
  outputModality: OutputModality;
  selectedVoice: PrebuiltVoice;
}

function AltairComponent({ outputModality, selectedVoice }: AltairComponentProps) {
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    console.log(`Configuring API for: Modality=${outputModality}, Voice=${selectedVoice}`);

    // Explicitly define responseModalities as an array
    const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];

    const generationConfig: any = {
      // responseModalities: outputModality.toUpperCase(), // Old way
      responseModalities: modalitiesConfig, // Use the array
    };

    if (outputModality === 'audio') {
      generationConfig.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: selectedVoice }
        },
      };
      console.log("Audio mode selected, enabling speechConfig and setting modality to AUDIO.");
    } else {
      console.log("Text mode selected, setting modality to TEXT.");
    }

    // Add logging to see the exact config being sent
    console.log("Setting config with generationConfig:", JSON.stringify(generationConfig, null, 2));

    setConfig({
      model: "models/gemini-2.0-flash-live-001",
      generationConfig: generationConfig, // Use the updated config
      systemInstruction: {
        parts: [{ text: systemInstructions }], // Use updated instructions
      },
      tools: [
        {
          functionDeclarations: [
            getConferencesDeclaration,
            getJournalsDeclaration,
            getWebsiteInformationDeclaration,
            // drawChartDeclaration,
          ],
        },
      ],
    });
  }, [setConfig, outputModality, selectedVoice]); // Dependencies are correct


  // Trong useEffect thứ hai của AltairComponent

  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`Got toolcall`, toolCall);

      const BASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL + "/api/v1";
      console.log("Backend URL:", BASE_URL);

      const responses = [];

      for (const fc of toolCall.functionCalls) {
        let apiUrl = '';
        let method: 'GET' | 'POST' = 'POST'; // Mặc định là POST
        let body: string | undefined = undefined;
        let headers: HeadersInit = { 'Content-Type': 'application/json' };
        let requiresJsonResponse = false; // Cờ để biết có cần parse JSON không
        let responseData: any;
        let finalUrl = ''; // Biến để chứa URL cuối cùng

        try {
          switch (fc.name) {
            case "getConferences":
              // Trong case "getConferences":
              apiUrl = `${BASE_URL}/conference`;
              method = 'GET';
              headers = {};

              // 1. Kiểm tra fc.args và sự tồn tại của searchQuery
              if (!fc.args || typeof fc.args !== 'object' || !('searchQuery' in fc.args)) {
                console.error("Lỗi: 'searchQuery' bị thiếu trong fc.args:", fc.args);
                throw new Error("Thuộc tính 'searchQuery' bị thiếu trong đối số nhận được từ model cho getConferences.");
              }

              // 2. Kiểm tra kiểu của searchQuery
              const searchQueryValue = (fc.args as any).searchQuery; // Tạm dùng any để lấy giá trị
              if (typeof searchQueryValue !== 'string' || !searchQueryValue) {
                console.error("Lỗi: 'searchQuery' không phải là string hoặc rỗng:", searchQueryValue);
                throw new Error("Giá trị 'searchQuery' nhận được từ model không hợp lệ (không phải string hoặc rỗng).");
              }

              // 3. Sử dụng giá trị đã được kiểm tra
              const searchQuery: string = searchQueryValue;
              console.log("Extracted Conference Search Query:", searchQuery);

              finalUrl = `${apiUrl}?${searchQuery}&mode=detail`;
              // --- END: Sửa lỗi getConferences ---
              break; // Quan trọng: Đừng quên break!

            case "getJournals":
              apiUrl = `${BASE_URL}/api/get_journals`; // Giả sử đây vẫn là POST
              method = 'POST';
              body = JSON.stringify(fc.args);
              finalUrl = apiUrl; // URL không có query params
              break;
            case "getWebsiteInformation":
              apiUrl = `${BASE_URL}/api/get_website_information`; // Giả sử đây vẫn là POST
              method = 'POST';
              body = JSON.stringify(fc.args);
              finalUrl = apiUrl; // URL không có query params
              break;
            case "drawChart":
              apiUrl = `${BASE_URL}/api/draw_chart`; // Giả sử đây vẫn là POST
              method = 'POST';
              body = JSON.stringify(fc.args);
              requiresJsonResponse = true; // Hàm này trả về JSON
              finalUrl = apiUrl; // URL không có query params
              break;
            default:
              console.warn(`Unknown function call: ${fc.name}`);
              responses.push({
                response: { content: { type: "error", message: `Unknown function: ${fc.name}` } },
                id: fc.id,
              });
              continue; // Bỏ qua function không xác định
          }

          // Log URL và phương thức sẽ được gọi
          console.log(`Calling API for ${fc.name} using ${method} at: ${finalUrl}`);
          if (body) console.log('With body:', body);

          // Thực hiện fetch request
          const response = await fetch(finalUrl, {
            method: method,
            headers: headers,
            body: body, // body sẽ là undefined cho GET
          });

          // Xử lý response (giữ nguyên)
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API call for ${fc.name} failed with status ${response.status}: ${errorText}`);
            throw new Error(`API Error (${response.status}) for ${fc.name}: ${errorText.substring(0, 200)}`);
          }

          responseData = requiresJsonResponse ? await response.json() : await response.text();
          console.log(`Response data for ${fc.name}:`, responseData);

          responses.push({
            response: { content: responseData },
            id: fc.id,
          });

        } catch (error: any) {
          console.error(`Error processing function call ${fc.name}:`, error);
          responses.push({
            response: { content: { type: "error", message: error.message || "An unexpected error occurred." } },
            id: fc.id,
          });
        }
      } // Kết thúc vòng lặp for

      // Gửi tất cả các phản hồi tool thu thập được (giữ nguyên)
      if (responses.length > 0) {
        console.log("Sending tool responses:", responses);
        client.sendToolResponse({ functionResponses: responses });
      } else {
        console.log("No responses to send for this tool call batch.");
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]); // Chỉ cần client ở đây

  return null;
}

export const Altair = memo(AltairComponent);