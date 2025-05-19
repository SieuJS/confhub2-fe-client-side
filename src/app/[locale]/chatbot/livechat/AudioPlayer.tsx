import React from 'react'
import { useAudioEngine, AudioEngineControls } from './hooks/useAudioEngine'
import {
  PlayPauseButton,
  TimeDisplay,
  SeekBar,
  MuteButton
} from './AudioPlayerControls'

interface AudioPlayerProps {
  audioData: string
  autoPlay?: boolean
  sampleRate: number
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioData,
  autoPlay = false,
  sampleRate
}) => {
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
    toggleMute
  }: AudioEngineControls = useAudioEngine({ audioData, sampleRate, autoPlay })

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  if (error && !canPlay) {
    return (
      <div className='mx-auto w-full max-w-xs p-2 text-center text-xs text-red-500 dark:text-red-400 sm:max-w-sm md:max-w-md'>
        {error}
      </div>
    )
  }
  if (audioData && !canPlay && !error) {
    return (
      <div className='mx-auto w-full max-w-xs p-2 text-center text-xs text-gray-500 dark:text-gray-400 sm:max-w-sm md:max-w-md'>
        Loading audio...
      </div>
    )
  }
  if (!audioData && !error) {
    return (
      <div className='mx-auto w-full max-w-xs p-2 text-center text-xs text-gray-500 dark:text-gray-400 sm:max-w-sm md:max-w-md'>
        Preparing audio...
      </div>
    )
  }

  return (
    <div
      className='
        relative mx-auto flex w-full min-w-[300px]
        items-center rounded-full
        bg-gray-100 px-2
        py-1 text-black
        shadow-md dark:bg-neutral-800
        dark:text-white
      '
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
        onSeek={e => seek(parseFloat(e.target.value))}
        disabled={!canPlay}
      />

      <MuteButton
        isMuted={isMuted}
        onToggleMute={toggleMute}
        disabled={!canPlay}
      />

      {error && canPlay && (
        <div className='absolute bottom-0 right-2 z-30 translate-y-[calc(100%+4px)] rounded bg-red-100 p-1 text-xs text-red-500 shadow-md dark:bg-red-900/80 dark:text-red-400'>
          {error}
        </div>
      )}
    </div>
  )
}

export default AudioPlayer
