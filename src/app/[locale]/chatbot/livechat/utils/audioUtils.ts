// src/app/[locale]/chatbot/livechat/utils/audioPlayerUtils.ts
export const formatTimeDisplay = (time: number): string => {
  const validTime = isNaN(time) || !isFinite(time) || time < 0 ? 0 : time;
  const minutes = Math.floor(validTime / 60);
  const seconds = Math.floor(validTime % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const base64ToAudioBuffer = async (
  base64: string,
  context: AudioContext,
  pcmSampleRate: number
): Promise<AudioBuffer | null> => {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (bytes.byteLength % 2 !== 0) {
      // console.error("Raw PCM data length is not a multiple of 2 (expected 16-bit samples).");
      throw new Error("Invalid audio data: Incomplete sample data.");
    }

    const int16View = new Int16Array(bytes.buffer);
    const numSamples = int16View.length;

    if (numSamples === 0) {
      throw new Error("No audio samples found after decoding base64.");
    }

    const buffer = context.createBuffer(1, numSamples, pcmSampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      channelData[i] = int16View[i] / 32768.0; // Normalize to [-1.0, 1.0]
    }
    return buffer;
  } catch (e: any) {
    // console.error("Error processing base64 to AudioBuffer (raw PCM assumption):", e);
    if (e.name === 'DOMException' && e.message.includes('atob')) {
      throw new Error("Failed to decode base64. String might be corrupted.");
    }
    throw new Error(e.message || "Failed to process raw audio data. Ensure it's base64 16-bit PCM.");
  }
};



// Helper function (moved here for better organization)
export function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
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