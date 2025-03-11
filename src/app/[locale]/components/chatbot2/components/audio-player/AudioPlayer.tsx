// components/AudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import AudioPulse from '../audio-pulse/AudioPulse'; // Import the AudioPulse component

interface AudioPlayerProps {
  audioData: string; // Base64 encoded audio data
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false); // For hover effect on AudioPulse
  const [volume, setVolume] = useState(0); // For volume indicator
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null); // Ref for GainNode


  useEffect(() => {
    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      gainNodeRef.current = audioContextRef.current.createGain(); // Create a GainNode
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    }
  }, []);

  useEffect(() => {
    if (!audioData || !audioContextRef.current) {
      return;
    }

    const audioBuffer = base64ToAudioBuffer(audioData, audioContextRef.current);
    if (!audioBuffer) return;

    audioBufferRef.current = audioBuffer;
    setDuration(audioBuffer.duration);

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
        if (bufferSourceRef.current) {
            bufferSourceRef.current.stop();
            bufferSourceRef.current.disconnect();
        }
    };
  }, [audioData]);



  const togglePlay = () => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) {
      return;
    }

    if (isPlaying) {
      if(bufferSourceRef.current) {
          bufferSourceRef.current.stop();
          bufferSourceRef.current.disconnect();
          bufferSourceRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const newSource = audioContextRef.current.createBufferSource();
      newSource.buffer = audioBufferRef.current;
        newSource.connect(gainNodeRef.current); // Connect to the GainNode
        gainNodeRef.current.connect(audioContextRef.current.destination); // Connect GainNode to destination
      bufferSourceRef.current = newSource;

      newSource.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (bufferSourceRef.current) {
            bufferSourceRef.current.disconnect();
            bufferSourceRef.current = null;
        }
      });
        // removed timeupdate event

      try {
        newSource.start(0);
        setIsPlaying(true);
      } catch (e) {
        console.error("Play failed", e);
      }
    }
  };



  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) {
      return;
    }

    const time = parseFloat(e.target.value);
    setCurrentTime(time);

    if (isPlaying) {
        if(bufferSourceRef.current) {
          bufferSourceRef.current.stop();
          bufferSourceRef.current.disconnect();
          bufferSourceRef.current = null
        }
    }

    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = audioBufferRef.current;
      newSource.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);
    bufferSourceRef.current = newSource;

    newSource.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (bufferSourceRef.current) {
          bufferSourceRef.current.disconnect();
          bufferSourceRef.current = null;
        }
    });
      // removed timeupdate event

    try {
      newSource.start(0, time);
      if (!isPlaying) {
          setIsPlaying(true);
      }
    } catch (e) {
      console.error("seek failed", e)
    }
  };



  const base64ToAudioBuffer = (base64: string, context: AudioContext) => {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16View = new Int16Array(bytes.buffer);
      const audioBuffer = context.createBuffer(
        1,
        int16View.length,
        24000
      );

      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < int16View.length; i++) {
        channelData[i] = int16View[i] / 32768;
      }

      return audioBuffer;
    } catch (e) {
      console.error("decode audio error", e);
      return null;
    }
  };

    const toggleMute = () => {
      if (audioContextRef.current && gainNodeRef.current) {
          if(gainNodeRef.current.gain.value > 0){
              gainNodeRef.current.gain.value = 0; // Mute
              setVolume(0)
          } else {
              gainNodeRef.current.gain.value = 1; // Unmute (set to your desired default volume)
              setVolume(1)
          }

      }
  };

  return (
    <div
      className="flex items-center rounded-full bg-primary p-1 pl-2 pr-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button onClick={togglePlay} className="audio-control  rounded-full bg-button p-1 text-button-text hover:bg-button-secondary">
        {isPlaying ? (
          <span className="material-symbols-outlined">pause</span>
        ) : (
          <span className="material-symbols-outlined">play_arrow</span>
        )}
      </button>
      <span className="audio-time ml-2 mr-2 text-sm text-text-secondary">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <div className='relative flex-grow'> {/* Container for the slider and pulse */}
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={seek}
          className="audio-slider absolute top-0 z-10 h-full w-full appearance-none bg-transparent" // Make slider full width and height, on top
          style={{
              background: 'transparent',
          }}

        />
          <div className='pointer-events-none absolute top-1/2 -translate-y-1/2'> {/*  Position the pulse in the middle */}
            <AudioPulse active={isPlaying} volume={isPlaying? (gainNodeRef.current ? gainNodeRef.current.gain.value : 0): 0} hover={isHovered} /> {/* Use the imported AudioPulse component */}
          </div>

      </div>
      <button onClick={toggleMute} className="audio-control ml-2  rounded-full bg-button p-1 text-button-text hover:bg-button-secondary">
        <span className="material-symbols-outlined">
          {gainNodeRef.current && gainNodeRef.current.gain.value > 0 ? "volume_up" : "volume_off"}
        </span>
      </button>
        <button  className="audio-control ml-2 rounded-full bg-button p-1 text-button-text hover:bg-button-secondary">
        <span className="material-symbols-outlined">
          more_vert
        </span>
      </button>
    </div>
  );
};

export default AudioPlayer;