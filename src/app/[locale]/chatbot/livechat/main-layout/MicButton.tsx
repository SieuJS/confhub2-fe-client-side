// MicButton.tsx
import cn from 'classnames'
import React from 'react'
import AudioPulse from '../audio-pulse/AudioPulse'

type MicButtonProps = {
  muted: boolean
  setMuted: (muted: boolean) => void
  volume: number
  connected: boolean
}
const MicButton: React.FC<MicButtonProps> = ({
  muted,
  setMuted,
  volume,
  connected
}) => (
  <div className='flex items-center gap-2'>
    <button
      className={cn(
        'relative z-10 flex h-10 w-10 select-none items-center justify-center rounded-full text-xl transition-all duration-200 ease-in',
        {
          'bg-red-600 text-black hover:bg-red-400 focus:border-gray-800 focus:outline-2 focus:outline-red-500':
            !muted,
          'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-100 focus:border-transparent focus:outline-2 focus:outline-gray-200':
            muted
        }
      )}
      onClick={() => setMuted(!muted)}
    >
      <span className='material-symbols-outlined filled'>
        {muted ? 'mic_off' : 'mic'}
      </span>
      {!muted && (
        <div
          className='pointer-events-none absolute inset-0 z-0 rounded-full bg-red-500 opacity-35 transition-all duration-200 ease-in-out'
          style={{
            top: `calc((var(--volume) * -1))`,
            left: `calc((var(--volume) * -1))`,
            width: `calc(100% + var(--volume) * 2)`,
            height: `calc(100% + var(--volume) * 2)`
          }}
        />
      )}
    </button>
    <div className='flex h-12 w-12 items-center justify-center'>
      <AudioPulse volume={volume} active={connected} hover={false} />
    </div>
  </div>
)

export default MicButton
