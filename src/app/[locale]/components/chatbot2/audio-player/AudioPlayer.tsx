// AudioPlayer.tsx (REVISED)
import React, { useState, useRef, useEffect } from 'react';
import AudioPulse from '../audio-pulse/AudioPulse';

interface AudioPlayerProps {
  audioData: string;
  autoPlay?: boolean;
  sampleRate: number; // Make sampleRate required
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData, autoPlay = false, sampleRate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const volumeRef = useRef(1); // Store volume in a ref

  // --- Audio Context Setup (with sampleRate) ---
  useEffect(() => {
    try {
      audioContextRef.current = new AudioContext({ sampleRate });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volumeRef.current; // Initial volume
    } catch (error) {
      console.error("Failed to create AudioContext:", error);
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, [sampleRate]);

  // --- Decode Audio Data & Buffer Setup ---
  useEffect(() => {
    if (!audioData || !audioContextRef.current) return;

    const decodeAndSetBuffer = async () => {
      try {
        const audioBuffer = await base64ToAudioBuffer(audioData, audioContextRef.current!);
        if (!audioBuffer) return;

        audioBufferRef.current = audioBuffer;
        setDuration(audioBuffer.duration);
        setCurrentTime(0); // Reset current time on new data

        if (autoPlay) {
          // Immediately play if autoPlay is true
          playFrom(0);
        }
      } catch (error) {
        console.error("Error decoding audio data:", error);
      }
    };
    decodeAndSetBuffer();

    return () => { //Proper Cleanup
        stopAndDisconnect();
    }

  }, [audioData, autoPlay, sampleRate]);

    const stopAndDisconnect = () => {
     if (bufferSourceRef.current) {
        try {
            bufferSourceRef.current.stop();
        } catch(e) {
          //Source already stopped
        }
        bufferSourceRef.current.disconnect();
        bufferSourceRef.current = null;
      }
    }


  // --- Playback Logic ---
    const playFrom = (startTime: number) => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) return;

    stopAndDisconnect(); // Ensure any previous source is stopped

    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = audioBufferRef.current;
    newSource.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);
    bufferSourceRef.current = newSource;

    newSource.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      stopAndDisconnect(); // Clean up after playback
    };

    try {
      newSource.start(0, startTime);
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to start playback:", error);
      setIsPlaying(false); // Ensure isPlaying is false on error
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
        stopAndDisconnect();
        setIsPlaying(false);
    } else {
      playFrom(currentTime);
    }
  };

  // --- Seek Logic ---
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
     if (isPlaying) {
          playFrom(time);
      }
  };

  // --- Mute/Unmute Logic ---
  const toggleMute = () => {
    if (gainNodeRef.current) {
      if (gainNodeRef.current.gain.value > 0) {
        gainNodeRef.current.gain.value = 0;
        volumeRef.current = 0;
      } else {
        gainNodeRef.current.gain.value = 1;
        volumeRef.current = 1;
      }
    }
  };

  // --- Helper Functions ---
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

   const base64ToAudioBuffer = async (base64: string, context: AudioContext): Promise<AudioBuffer | null> => {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
       const int16View = new Int16Array(bytes.buffer);
      const audioBuffer = context.createBuffer(1, int16View.length, context.sampleRate); //Use context sampleRate
      const channelData = audioBuffer.getChannelData(0);

      // Convert Int16 samples to Float32 (-1.0 to 1.0)
      for (let i = 0; i < int16View.length; i++) {
        channelData[i] = int16View[i] / 32768.0; // Correct scaling
      }

      return audioBuffer;
    } catch (e) {
      console.error("Decode audio error", e);
      return null;
    }
  };

  // --- Rendering ---
  return (
    <div
      className="flex items-center rounded-full bg-primary p-1 pl-2 pr-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button onClick={togglePlay} className="audio-control rounded-full bg-button p-1 text-button-text hover:bg-button-secondary">
        {isPlaying ? (
          <span className="material-symbols-outlined">pause</span>
        ) : (
          <span className="material-symbols-outlined">play_arrow</span>
        )}
      </button>
      <span className="audio-time ml-2 mr-2 text-sm text-text-secondary">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <div className='relative flex-grow'>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={seek}
          className="audio-slider absolute top-0 z-10 h-full w-full appearance-none bg-transparent"
          style={{ background: 'transparent' }}
        />
        <div className='pointer-events-none absolute top-1/2 -translate-y-1/2'>
          <AudioPulse active={isPlaying} volume={isPlaying ? volumeRef.current: 0} hover={isHovered} />
        </div>
      </div>
      <button onClick={toggleMute} className="audio-control ml-2 rounded-full bg-button p-1 text-button-text hover:bg-button-secondary">
        <span className="material-symbols-outlined">
          {volumeRef.current > 0 ? "volume_up" : "volume_off"}
        </span>
      </button>
      <button className="audio-control ml-2 rounded-full bg-button p-1 text-button-text hover:bg-button-secondary">
        <span className="material-symbols-outlined">more_vert</span>
      </button>
    </div>
  );
};

export default AudioPlayer;