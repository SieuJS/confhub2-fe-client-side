import React from 'react'
import { formatTimeDisplay } from './utils/audioPlayerUtils'
import { Pause, Play, Volume2, VolumeOff } from 'lucide-react'

interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string
  iconName: string | React.ReactNode // iconName có thể là chuỗi hoặc một React node
  iconSizeClass?: string
}

// Generic ControlButton: Minimal style, icon only with subtle hover/focus
const ControlButton: React.FC<ControlButtonProps> = ({
  // Đảm bảo ControlButton vẫn ở đây
  ariaLabel,
  iconName,
  className,
  iconSizeClass = 'text-xl',
  ...props
}) => (
  <button
    // aria-label={ariaLabel}
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
  // Đảm bảo PlayPauseButton vẫn ở đây
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
  // Đảm bảo TimeDisplay vẫn ở đây
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
    // Container vẫn giữ nguyên flex-grow và chiều cao để đảm bảo input range có khu vực tương tác tốt
    <div className='group relative mx-1.5 flex h-5 flex-grow items-center'>
      {' '}
      {/* mx-1.5 thay vì mx-1 để có thêm chút không gian */}
      <input
        type='range'
        min='0'
        max={duration || 1}
        value={currentTime}
        // onChange={onSeek}
        disabled={disabled}
        aria-label='Audio progress'
        // Input range sẽ được ẩn hoàn toàn và chiếm toàn bộ không gian của track
        // Các style này nhằm mục đích ẩn thumb và track mặc định của trình duyệt
        className='
          /* z-index để input nằm trên track trực quan */ /* Có thể cần
          thêm style cụ thể cho
          Firefox */ /*
          Có thể cần thêm
          style cụ thể
          cho
          Edge/IE */ absolute left-0 top-0 z-10 m-0 h-full w-full cursor-pointer appearance-none bg-transparent
          p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 disabled:cursor-not-allowed dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-neutral-800 [&::-moz-range-thumb]:appearance-none [&::-moz-range-track]:border-transparent [&::-moz-range-track]:bg-transparent
          [&::-ms-thumb]:appearance-none [&::-ms-track]:border-transparent
          [&::-ms-track]:bg-transparent [&::-webkit-slider-runnable-track]:border-transparent
          [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none
        '
      />
      {/* Track Background: Thanh nền mỏng phía sau */}
      <div className='pointer-events-none absolute left-0 top-1/2 z-0 h-[3px] w-full -translate-y-1/2 rounded-full bg-gray-300 dark:bg-gray-600'>
        {/* Progress Fill: Thanh tiến trình chính. Điểm cuối bên phải của nó sẽ là "chấm" duy nhất. */}
        <div
          className='h-full rounded-full bg-current' // Màu của thanh tiến trình
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {/* KHÔNG CÓ NÚM KÉO (THUMB) RIÊNG BIỆT NỮA */}
    </div>
  )
}

interface MuteButtonProps {
  // Đảm bảo MuteButton vẫn ở đây
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
