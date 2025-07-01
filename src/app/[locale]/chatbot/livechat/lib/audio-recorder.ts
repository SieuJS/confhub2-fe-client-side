// audio-recorder.ts (với avgNoiseMultiplier lớn hơn)
import { audioContext } from "./utils";
import AudioRecordingWorklet from "./worklets/audio-processing";
import VolMeterWorket from "./worklets/vol-meter";
import { createWorketFromSrc } from "./audioworklet-registry";
import EventEmitter from "eventemitter3";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export class AudioRecorder extends EventEmitter {
  stream: MediaStream | undefined;
  audioContext: AudioContext | undefined;
  source: MediaStreamAudioSourceNode | undefined;
  recording: boolean = false;
  recordingWorklet: AudioWorkletNode | undefined;
  vuWorklet: AudioWorkletNode | undefined;

  private starting: Promise<void> | null = null;

  constructor(public sampleRate = 16000) {
    super();
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Could not request user media");
    }

    this.starting = new Promise(async (resolve, reject) => {
      try { // Thêm try-catch để reject promise nếu có lỗi
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = await audioContext({ sampleRate: this.sampleRate });
        this.source = this.audioContext.createMediaStreamSource(this.stream);

       

        const workletName = "audio-recorder-worklet";
        const src = createWorketFromSrc(workletName, AudioRecordingWorklet);

        await this.audioContext.audioWorklet.addModule(src);
        this.recordingWorklet = new AudioWorkletNode(
          this.audioContext,
          workletName,
        );

        this.recordingWorklet.port.onmessage = (ev: MessageEvent) => {
          const arrayBuffer = ev.data.data.int16arrayBuffer;
          if (arrayBuffer) {
            const arrayBufferString = arrayBufferToBase64(arrayBuffer);
            this.emit("data", arrayBufferString); // Vẫn phát dữ liệu audio
          }
        };

        const vuWorkletName = "vu-meter";
        await this.audioContext.audioWorklet.addModule(
          createWorketFromSrc(vuWorkletName, VolMeterWorket),
        );
        this.vuWorklet = new AudioWorkletNode(this.audioContext, vuWorkletName);
        this.vuWorklet.port.onmessage = (ev: MessageEvent) => {
          this.emit("volume", ev.data.volume);
        };

        this.source.connect(this.recordingWorklet);
        this.source.connect(this.vuWorklet);
        this.recording = true;
        resolve();
      } catch (error) {
        // console.error("Error starting AudioRecorder:", error);
        reject(error); // Reject promise nếu có lỗi
      } finally {
        this.starting = null;
      }
    });
    return this.starting; // Trả về promise
  }

  stop() {
    const handleStop = () => {
      this.source?.disconnect();
      this.stream?.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
      this.recordingWorklet?.port.close(); // Đóng port
      this.recordingWorklet?.disconnect(); // Ngắt kết nối worklet
      this.vuWorklet?.port.close();
      this.vuWorklet?.disconnect();
      this.recordingWorklet = undefined;
      this.vuWorklet = undefined;
      this.recording = false; // Đảm bảo trạng thái recording được cập nhật
    
      this.emit("stop"); // Vẫn phát sự kiện "stop" khi recorder thực sự dừng (do người dùng)
    };

    if (this.starting) {
      this.starting.then(handleStop).catch(handleStop); // Xử lý cả trường hợp promise bị reject
      return;
    }
    handleStop();
  }
}