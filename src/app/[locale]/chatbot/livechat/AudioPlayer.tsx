import React from 'react';
import { useAudioEngine, AudioEngineControls } from './hooks/useAudioEngine';
import {
  PlayPauseButton,
  TimeDisplay,
  SeekBar,
  MuteButton,
} from './AudioPlayerControls';

interface AudioPlayerProps {
  audioData: string;
  autoPlay?: boolean;
  sampleRate: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData, autoPlay = false, sampleRate }) => {
  const {
    isPlaying,
    currentTime,
    duration,
    isMuted,
    error,
    canPlay,
    play,
    pause,
    seek,
    toggleMute,
  }: AudioEngineControls = useAudioEngine({ audioData, sampleRate, autoPlay });

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  if (error && !canPlay) {
    return <div className="text-red-500 dark:text-red-400 text-xs p-2 text-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">{error}</div>;
  }
  if (audioData && !canPlay && !error) {
    return <div className="text-gray-500 dark:text-gray-400 text-xs p-2 text-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">Loading audio...</div>;
  }
  if (!audioData && !error) {
    return <div className="text-gray-500 dark:text-gray-400 text-xs p-2 text-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">Preparing audio...</div>;
  }

  return (
    <div
      className="
        flex items-center w-full mx-auto min-w-[300px]
        text-black dark:text-white
        bg-gray-100 dark:bg-neutral-800
        rounded-full shadow-md
        px-2 py-1
        relative
      "
    >
      <PlayPauseButton
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        disabled={!canPlay}
      />

      <TimeDisplay currentTime={currentTime} duration={duration} />

      <SeekBar
        currentTime={currentTime}
        duration={duration}
        onSeek={(e) => seek(parseFloat(e.target.value))}
        disabled={!canPlay}
      />

      <MuteButton
        isMuted={isMuted}
        onToggleMute={toggleMute}
        disabled={!canPlay}
      />

      {error && canPlay &&
        <div className="absolute bottom-0 right-2 translate-y-[calc(100%+4px)] text-red-500 dark:text-red-400 text-xs p-1 bg-red-100 dark:bg-red-900/80 rounded shadow-md z-30">
          {error}
        </div>
      }
    </div>
  );
};

export default AudioPlayer;