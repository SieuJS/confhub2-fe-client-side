import React from 'react';
import { formatTimeDisplay } from './utils/audioPlayerUtils';

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string;
  iconName: string;
  iconSizeClass?: string;
}


// Generic ControlButton: Minimal style, icon only with subtle hover/focus
const ControlButton: React.FC<ControlButtonProps> = ({ // Đảm bảo ControlButton vẫn ở đây
  ariaLabel,
  iconName,
  className,
  iconSizeClass = "text-xl", 
  ...props
}) => (
  <button
    aria-label={ariaLabel}
    className={`
      flex items-center justify-center shrink-0
      text-current
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-opacity-50
      rounded-full
      hover:bg-black/10 dark:hover:bg-white/15
      p-1
      transition-colors
      ${className}
    `}
    {...props}
  >
    <span className={`material-symbols-outlined ${iconSizeClass}`}>{iconName}</span>
  </button>
);


interface PlayPauseButtonProps { // Đảm bảo PlayPauseButton vẫn ở đây
  isPlaying: boolean;
  onTogglePlay: () => void;
  disabled: boolean;
}
export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ isPlaying, onTogglePlay, disabled }) => (
  <ControlButton
    onClick={onTogglePlay}
    disabled={disabled}
    ariaLabel={isPlaying ? "Pause" : "Play"}
    iconName={isPlaying ? "pause" : "play_arrow"}
    className="mr-1" 
    iconSizeClass="text-2xl"
  />
);

interface TimeDisplayProps { // Đảm bảo TimeDisplay vẫn ở đây
  currentTime: number;
  duration: number;
}
export const TimeDisplay: React.FC<TimeDisplayProps> = ({ currentTime, duration }) => (
  <span className="text-xs text-current opacity-80 shrink-0 mx-1.5 whitespace-nowrap">
    {formatTimeDisplay(currentTime)} / {formatTimeDisplay(duration)}
  </span>
);


interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}
export const SeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
  disabled,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    // Container vẫn giữ nguyên flex-grow và chiều cao để đảm bảo input range có khu vực tương tác tốt
    <div className="relative flex-grow h-5 mx-1.5 flex items-center group"> {/* mx-1.5 thay vì mx-1 để có thêm chút không gian */}
      <input
        type="range"
        min="0"
        max={duration || 1}
        value={currentTime}
        onChange={onSeek}
        disabled={disabled}
        aria-label="Audio progress"
        // Input range sẽ được ẩn hoàn toàn và chiếm toàn bộ không gian của track
        // Các style này nhằm mục đích ẩn thumb và track mặc định của trình duyệt
        className="
          absolute top-0 left-0 z-10 /* z-index để input nằm trên track trực quan */
          w-full h-full m-0 p-0 appearance-none
          bg-transparent cursor-pointer disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
          focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-neutral-800
          [&::-webkit-slider-thumb]:appearance-none
          [&::-moz-range-thumb]:appearance-none /* Có thể cần thêm style cụ thể cho Firefox */
          [&::-ms-thumb]:appearance-none /* Có thể cần thêm style cụ thể cho Edge/IE */
          [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-runnable-track]:border-transparent
          [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-transparent
          [&::-ms-track]:bg-transparent [&::-ms-track]:border-transparent
        "
      />

      {/* Track Background: Thanh nền mỏng phía sau */}
      <div
        className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-full h-[3px] rounded-full bg-gray-300 dark:bg-gray-600 z-0"
      >
        {/* Progress Fill: Thanh tiến trình chính. Điểm cuối bên phải của nó sẽ là "chấm" duy nhất. */}
        <div
          className="h-full rounded-full bg-current" // Màu của thanh tiến trình
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* KHÔNG CÓ NÚM KÉO (THUMB) RIÊNG BIỆT NỮA */}
    </div>
  );
};

interface MuteButtonProps { // Đảm bảo MuteButton vẫn ở đây
  isMuted: boolean;
  onToggleMute: () => void;
  disabled: boolean;
}
export const MuteButton: React.FC<MuteButtonProps> = ({ isMuted, onToggleMute, disabled }) => (
  <ControlButton
    onClick={onToggleMute}
    disabled={disabled}
    ariaLabel={isMuted ? "Unmute" : "Mute"}
    iconName={isMuted ? "volume_off" : "volume_up"}
    className="ml-1" 
    iconSizeClass="text-xl"
  />
);