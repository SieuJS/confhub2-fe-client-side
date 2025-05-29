// src/app/[locale]/chatbot/livechat/AudioPlayerControls.tsx

import React from 'react'
import { formatTimeDisplay } from './utils/audioUtils'
import { Pause, Play, Volume2, VolumeOff } from 'lucide-react'

interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string
  iconName: string | React.ReactNode
  iconSizeClass?: string
}

const ControlButton: React.FC<ControlButtonProps> = ({
  ariaLabel,
  iconName,
  className,
  iconSizeClass = 'text-xl',
  ...props
}) => (
  <button
    aria-label={ariaLabel} // It's good practice to keep aria-label, uncommented it from your original if it was intentional
    className={`
      flex shrink-0 items-center justify-center
      rounded-full
      p-1 text-current
      transition-colors hover:bg-black/10 focus:outline-none focus-visible:ring-2
      focus-visible:ring-current
      focus-visible:ring-opacity-50 disabled:cursor-not-allowed
      disabled:opacity-50
      dark:hover:bg-white/15
      ${className}
    `}
    {...props}
  >
    <span className={`material-symbols-outlined ${iconSizeClass}`}>
      {iconName}
    </span>
  </button>
)

interface PlayPauseButtonProps {
  isPlaying: boolean
  onTogglePlay: () => void
  disabled: boolean
}
export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({
  isPlaying,
  onTogglePlay,
  disabled
}) => (
  <ControlButton
    onClick={onTogglePlay}
    disabled={disabled}
    ariaLabel={isPlaying ? 'pause' : 'play'}
    iconName={isPlaying ? <Pause /> : <Play />}
    className='mr-1'
    iconSizeClass='text-2xl'
  />
)

interface TimeDisplayProps {
  currentTime: number
  duration: number
}
export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  currentTime,
  duration
}) => (
  <span className='mx-1.5 shrink-0 whitespace-nowrap text-xs text-current opacity-80'>
    {formatTimeDisplay(currentTime)} / {formatTimeDisplay(duration)}
  </span>
)

interface SeekBarProps {
  currentTime: number
  duration: number
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled: boolean
}
export const SeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
  disabled
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className='group relative mx-1.5 flex h-5 flex-grow items-center'>
      {' '}
      <input
        type='range'
        min='0'
        max={duration || 1}
        value={currentTime}
        onChange={onSeek} // SOLUTION: Uncomment this line
        disabled={disabled}
        aria-label='Audio progress'
        className='
          absolute left-0 top-0 z-10 m-0 h-full w-full cursor-pointer appearance-none bg-transparent
          p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 disabled:cursor-not-allowed dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-neutral-800 [&::-moz-range-thumb]:appearance-none [&::-moz-range-track]:border-transparent [&::-moz-range-track]:bg-transparent
          [&::-ms-thumb]:appearance-none [&::-ms-track]:border-transparent
          [&::-ms-track]:bg-transparent [&::-webkit-slider-runnable-track]:border-transparent
          [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none
        '
      />
      <div className='pointer-events-none absolute left-0 top-1/2 z-0 h-[3px] w-full -translate-y-1/2 rounded-full bg-gray-300 dark:bg-gray-600'>
        <div
          className='h-full rounded-full bg-current'
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

interface MuteButtonProps {
  isMuted: boolean
  onToggleMute: () => void
  disabled: boolean
}
export const MuteButton: React.FC<MuteButtonProps> = ({
  isMuted,
  onToggleMute,
  disabled
}) => (
  <ControlButton
    onClick={onToggleMute}
    disabled={disabled}
    ariaLabel={isMuted ? 'Unmute' : 'Mute'}
    iconName={isMuted ? <VolumeOff /> : <Volume2 />}
    className='ml-1'
    iconSizeClass='text-xl'
  />
)