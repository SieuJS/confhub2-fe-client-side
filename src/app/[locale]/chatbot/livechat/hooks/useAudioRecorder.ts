// src/app/[locale]/chatbot/livechat/hooks/useAudioRecorder.ts
import { useEffect } from "react";
import { AudioRecorder } from "../lib/audio-recorder";
import { Blob as SDKBlob } from "@google/genai";
import { Buffer } from 'buffer';
import { StreamingLog } from "../../lib/live-chat.types"; // Import StreamingLog
import { concatenateUint8Arrays } from '../utils/audioUtils'; // Import if used here

interface UseAudioRecorderParams {
  connected: boolean;
  muted: boolean;
  audioRecorder: AudioRecorder; // Instance is now passed in
  sendRealtimeInput: (params: { audio?: SDKBlob, audioStreamEnd?: boolean }) => void;
  log: (entry: StreamingLog) => void;
  setInVolume: (volume: number) => void;
  // onClientSpeechSegmentEnd: () => void; // This is handled by LiveChat.tsx listening to useLiveAPI event
  getAndClearAudioChunks: () => Uint8Array[]; // For final segment on explicit stop
  accumulateAudioChunk: (chunk: Uint8Array) => void; // New callback to accumulate chunks
}

const useAudioRecorder = ({
  connected,
  muted,
  audioRecorder, // Use the passed instance
  sendRealtimeInput,
  log,
  setInVolume,
  getAndClearAudioChunks,
  accumulateAudioChunk,
}: UseAudioRecorderParams) => {

  useEffect(() => {
    if (!audioRecorder) { // Guard if audioRecorder instance is not ready
        // log({date: new Date(), type: "debug.audioRecorder", message: "AudioRecorder instance not available in hook yet."})
        return;
    }

    if (connected && !muted) {
      const onData = (base64AudioData: string) => {
        try {
          const sdkAudioBlob: SDKBlob = {
            mimeType: "audio/pcm;rate=16000",
            data: base64AudioData,
          };
          sendRealtimeInput({ audio: sdkAudioBlob });

          // Convert base64 to Uint8Array and pass to accumulator
          const binaryString = Buffer.from(base64AudioData, 'base64').toString('binary');
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          accumulateAudioChunk(bytes);

        } catch (error) {
          // console.error("Error processing/sending audio data in onData:", error);
          log({ date: new Date(), type: "error.audioSend", message: `Error sending audio: ${ (error instanceof Error ? error.message : String(error))}`});
        }
      };

      const onRecorderVolume = (volume: number) => {
        setInVolume(volume);
      };
      
      // This 'stop' event from AudioRecorder is now only for when the recorder *actually* stops
      // (e.g., user explicitly stops, or component unmounts).
      // VAD-based segmentation is handled by 'clientSpeechSegmentEnd' from useLiveAPI.
      const onRecorderStop = () => {
        // This is called when audioRecorder.stop() completes.
        // The cleanup in the return function of this useEffect will handle remaining chunks.
        log({ date: new Date(), type: "debug.audioRecorder", message: "AudioRecorder emitted 'stop' event." });
      };

      audioRecorder.on("data", onData);
      audioRecorder.on("volume", onRecorderVolume);
      audioRecorder.on("stop", onRecorderStop); // Listen to the recorder's own stop event

      if (!audioRecorder.recording) { // Check if not already recording
        audioRecorder.start().catch(error => {
          // console.error("Failed to start audio recorder:", error);
          log({ date: new Date(), type: "error.audioRecordStart", message: `Failed to start recorder: ${ (error instanceof Error ? error.message : String(error))}`});
        });
      }

      return () => {
        // Cleanup when dependencies change or component unmounts
        audioRecorder.off("data", onData);
        audioRecorder.off("volume", onRecorderVolume);
        audioRecorder.off("stop", onRecorderStop);

        if (audioRecorder.recording) {
          audioRecorder.stop(); // This will eventually trigger onRecorderStop
        }
        
        // Process any remaining chunks when recording stops (e.g., user mutes, disconnects, or unmounts)
        // This ensures the last bit of audio is captured if 'clientSpeechSegmentEnd' didn't fire for it.
        const remainingChunks = getAndClearAudioChunks();
        if (remainingChunks.length > 0) {
          try {
            const combinedBinary = concatenateUint8Arrays(remainingChunks); // Ensure this utility is available or inline it
            const combinedBase64 = Buffer.from(combinedBinary).toString('base64');
            if (combinedBase64.length > 0) {
              log({
                date: new Date(),
                type: "send.clientAudio.finalSegment", // A distinct type for this scenario
                message: { clientAudio: { audioData: combinedBase64 } },
              });
            }
          } catch (error) {
            //  console.error("Error encoding base64 for final audio segment in cleanup", error);
             log({ date: new Date(), type: "error.finalAudioSegment", message: `Cleanup error: ${ (error instanceof Error ? error.message : String(error))}`});
          }
        }
      };
    } else if (audioRecorder && audioRecorder.recording) {
      // If not connected or muted, but recorder is still going, stop it.
      audioRecorder.stop();
      // The cleanup for remaining chunks will be handled by the return function
      // of the *previous* execution of this effect when connected && !muted was true.
      // However, to be safe, we can also process remaining chunks here if the stop was due to mute/disconnect.
        const remainingChunks = getAndClearAudioChunks();
        if (remainingChunks.length > 0) {
          try {
            const combinedBinary = concatenateUint8Arrays(remainingChunks);
            const combinedBase64 = Buffer.from(combinedBinary).toString('base64');
            if (combinedBase64.length > 0) {
              log({
                date: new Date(),
                type: "send.clientAudio.finalSegment",
                message: { clientAudio: { audioData: combinedBase64 } },
              });
            }
          } catch (error) {
            //  console.error("Error encoding base64 for final audio segment on mute/disconnect", error);
          }
        }
    }
  }, [connected, muted, audioRecorder, sendRealtimeInput, log, setInVolume, getAndClearAudioChunks, accumulateAudioChunk]);
};
export default useAudioRecorder;