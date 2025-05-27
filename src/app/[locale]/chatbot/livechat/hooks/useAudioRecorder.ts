// src/app/[locale]/chatbot/livechat/hooks/useAudioRecorder.ts
import { useEffect } from "react";
import { AudioRecorder } from "../lib/audio-recorder";
import { Blob as SDKBlob } from "@google/genai"; // Import SDKBlob
import { Buffer } from 'buffer'; // Đảm bảo Buffer được import nếu cần


// Helper function (moved here for better organization)
function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  if (arrays.length === 1) {
    return arrays[0];
  }
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
const useAudioRecorder = (
  connected: boolean,
  muted: boolean,
  audioRecorder: AudioRecorder,
  // client: any, // Loại bỏ client cũ
  sendRealtimeInput: (params: { audio?: SDKBlob, audioStreamEnd?: boolean }) => void, // Hàm mới từ useLiveAPI
  log: (entry: any) => void,
  setInVolume: (volume: number) => void,
) => {
  useEffect(() => {
    if (connected && !muted && audioRecorder) {
       let audioChunksForLog: Uint8Array[] = [];

      const onData = (base64AudioData: string) => {
        try {
          const sdkAudioBlob: SDKBlob = {
            mimeType: "audio/l16;rate=16000",
            data: base64AudioData,
          };
          sendRealtimeInput({ audio: sdkAudioBlob });

          const binaryString = Buffer.from(base64AudioData, 'base64').toString('binary');
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioChunksForLog.push(bytes);

        } catch (error) {
          console.error("Error processing/sending audio data in onData:", error);
          log({ date: new Date(), type: "error.audioSend", message: `Error sending audio: ${ (error as Error).message}`});
        }
      };

      const onStop = () => {
        try {
          if (audioChunksForLog.length > 0) {
            const combinedBinary = concatenateUint8Arrays(audioChunksForLog);
            const combinedBase64 = Buffer.from(combinedBinary).toString('base64');

            if (combinedBase64.length > 0) {
              log({
                date: new Date(),
                type: "send.clientAudio.sessionComplete",
                message: { clientAudio: { audioData: combinedBase64 } },
              });
            }
          }
        } catch (error) {
          console.error("Error encoding base64 in onStop for logging", error);
        }
        audioChunksForLog = [];
      };

      audioRecorder.on("data", onData);
      audioRecorder.on("volume", setInVolume);
      audioRecorder.on("stop", onStop);
      audioRecorder.start().catch(error => {
        console.error("Failed to start audio recorder:", error);
        log({ date: new Date(), type: "error.audioRecordStart", message: `Failed to start recorder: ${ (error as Error).message}`});
      });

      // log({ date: new Date(), type: "info.audioRecord", message: "Audio recorder started."});

      return () => {
        // Kiểm tra xem audioRecorder có thực sự đang ghi âm không trước khi gọi stop
        // để tránh lỗi nếu stop được gọi nhiều lần hoặc khi chưa start.
        if (audioRecorder.recording) { // SỬA Ở ĐÂY
            audioRecorder.stop();
        }
        audioRecorder.off("data", onData);
        audioRecorder.off("volume", setInVolume);
        audioRecorder.off("stop", onStop);
        // log({ date: new Date(), type: "info.audioRecord", message: "Audio recorder stopped."});
        // Cân nhắc gửi audioStreamEnd khi recorder thực sự dừng do unmount/mute/disconnect
        // sendRealtimeInput({ audioStreamEnd: true });
      };
    } else if (audioRecorder && audioRecorder.recording) { // SỬA Ở ĐÂY: dùng audioRecorder.recording
        // Nếu không connected hoặc bị muted, và recorder đang chạy, thì dừng nó.
        audioRecorder.stop();
        // log({ date: new Date(), type: "info.audioRecord", message: "Audio recorder stopped due to disconnect/mute."});
    }
  }, [connected, muted, audioRecorder, sendRealtimeInput, log, setInVolume]);
};
export default useAudioRecorder;