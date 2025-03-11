// components/AudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import "./audio-player.css"

interface AudioPlayerProps {
  audioData: string; // Base64 encoded audio data
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null); // Ref for AudioContext
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null); // Ref for AudioBufferSourceNode
  const audioBufferRef = useRef<AudioBuffer | null>(null); // Ref for AudioBuffer


  useEffect(() => {
    audioContextRef.current = new AudioContext({ sampleRate: 24000 }); //sample rate = 24000
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

    audioBufferRef.current = audioBuffer; // Store the decoded audio buffer
    setDuration(audioBuffer.duration);


    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // No need to disconnect here, as it will be handled in togglePlay and seek
    };


      // timeupdate event will not be fired from AudioContext, so no need to handle it
    return () => { // Cleanup
        if (bufferSourceRef.current) {
            bufferSourceRef.current.stop();
            bufferSourceRef.current.disconnect();
        }
    };
  }, [audioData]); // Removed autoPlay from dependency array.


  const togglePlay = () => {
    if (!audioContextRef.current || !audioBufferRef.current) {
      return;
    }

    if (isPlaying) {
      if(bufferSourceRef.current) {
          bufferSourceRef.current.stop(); // Stop before disconnect
          bufferSourceRef.current.disconnect();
          bufferSourceRef.current = null; // Clear it after stop.
      }

      setIsPlaying(false);
    } else {
      // Create a *new* source node each time we play.
      const newSource = audioContextRef.current.createBufferSource();
      newSource.buffer = audioBufferRef.current; // Use the stored buffer
      newSource.connect(audioContextRef.current.destination);
      bufferSourceRef.current = newSource; // Update the ref

      newSource.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (bufferSourceRef.current) { // Check again before disconnecting
            bufferSourceRef.current.disconnect();
            bufferSourceRef.current = null; // Clear it after disconnect
        }
      });

      // Update currentTime *before* starting playback, to avoid 0s issues
      newSource.context.addEventListener('timeupdate', () => {
        if(bufferSourceRef.current && bufferSourceRef.current.context){
           setCurrentTime(bufferSourceRef.current.context.currentTime);
        }

      });


      try {
        newSource.start(0); // Start from the beginning.
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
    if (!audioContextRef.current || !audioBufferRef.current) {
      return;
    }

    const time = parseFloat(e.target.value);
    setCurrentTime(time);

    if (isPlaying) { // Stop if Playing
        if(bufferSourceRef.current) { // Check before stopping
          bufferSourceRef.current.stop();
          bufferSourceRef.current.disconnect();
          bufferSourceRef.current = null
        }
    }


    // Create a new source node for the new playback position.
    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = audioBufferRef.current;
    newSource.connect(audioContextRef.current.destination);
    bufferSourceRef.current = newSource;

    newSource.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);

        if (bufferSourceRef.current) {
          bufferSourceRef.current.disconnect();
          bufferSourceRef.current = null;
        }

    });

    newSource.context.addEventListener('timeupdate', () => {
        if(bufferSourceRef.current && bufferSourceRef.current.context)
        setCurrentTime(bufferSourceRef.current.context.currentTime);
      });

    try {
      newSource.start(0, time); // Start at the seeked time.
      if (!isPlaying) {
          setIsPlaying(true); //Set isPlaying to true, when start by seeking
      }

    } catch (e) {
      console.error("seek failed", e)
    }
  };



  // Helper function to convert base64 to AudioBuffer
  const base64ToAudioBuffer = (base64: string, context: AudioContext) => {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Int16Array (assuming 16-bit PCM)
      const int16View = new Int16Array(bytes.buffer);

      // Create an AudioBuffer
      const audioBuffer = context.createBuffer(
        1, // Number of channels (1 for mono, 2 for stereo)
        int16View.length, // Number of samples
        24000 // Sample rate (24kHz)
      );

      // Get the channel data (Float32Array)
      const channelData = audioBuffer.getChannelData(0);

      // Fill the channel data with the PCM values (normalized to -1 to 1)
      for (let i = 0; i < int16View.length; i++) {
        channelData[i] = int16View[i] / 32768; // 32768 for 16-bit audio
      }

      return audioBuffer;
    } catch (e) {
      console.error("decode audio error", e);
      return null;
    }

  };


  return (
    <div className="audio-player">
      <button onClick={togglePlay} className="audio-control">
        {isPlaying ? (
          <span className="material-symbols-outlined">pause</span>
        ) : (
          <span className="material-symbols-outlined">play_arrow</span>
        )}
      </button>
      <span className="audio-time">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={seek}
        className="audio-slider"
      />
      <button onClick={() => { if (audioContextRef.current) audioContextRef.current.resume() }} className="audio-control">
        <span className="material-symbols-outlined">{audioContextRef.current && audioContextRef.current.state === "running" ? "volume_up" : "volume_off"}</span>
      </button>
    </div>
  );
};

export default AudioPlayer;