// audio-recorder.ts
import { audioContext } from "./utils";
import AudioRecordingWorklet from "./worklets/audio-processing";
import VolMeterWorket from "./worklets/vol-meter";
import { createWorketFromSrc } from "./audioworklet-registry";
import EventEmitter from "eventemitter3";
// Import VAD
import VAD, { VoiceActivityDetectionOptions } from "voice-activity-detection";

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

  vad: ReturnType<typeof VAD> | undefined;
  silenceTimer: ReturnType<typeof setTimeout> | null = null;

  private starting: Promise<void> | null = null;

  constructor(public sampleRate = 16000) {
    super();
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Could not request user media");
    }

    this.starting = new Promise(async (resolve, reject) => {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = await audioContext({ sampleRate: this.sampleRate });
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      const vadOptions: VoiceActivityDetectionOptions = {
        minCaptureFreq: 85,
        maxCaptureFreq: 255,
        onVoiceStart: () => {
          console.log("voice start");
          if (this.silenceTimer) { //This is probably unnecessary now.
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        },
        onVoiceStop: () => {
          console.log("voice stop");
          this.emit("stop", this); // Emit the stop event.
        }
      };

      // Call VAD directly, without 'new'
      this.vad = VAD(this.audioContext, this.stream, vadOptions);
      this.vad.connect();

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
          this.emit("data", arrayBufferString);
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
      this.starting = null;
    });
  }

  stop() {
    const handleStop = () => {
      this.source?.disconnect();
      this.stream?.getTracks().forEach((track) => track.stop());
      this.vad?.disconnect();
      this.stream = undefined;
      this.recordingWorklet = undefined;
      this.vuWorklet = undefined;
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    };
    if (this.starting) {
      this.starting.then(handleStop);
      return;
    }
    handleStop();
  }
}