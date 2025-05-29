// src/app/[locale]/chatbot/livechat/layout/MicButton.tsx
import cn from 'classnames'
import React, { useEffect, useRef } from 'react' // Thêm useEffect, useRef
import AudioPulse from '../AudioPulse'
import { Mic, MicOff } from 'lucide-react'

type MicButtonProps = {
  muted: boolean
  setMuted: (muted: boolean) => void
  userMicVolume: number // Đổi tên: âm lượng micro của người dùng
  modelOutputVolume: number // Thêm mới: âm lượng đầu ra của model
  connected: boolean
}

const MicButton: React.FC<MicButtonProps> = ({
  muted,
  setMuted,
  userMicVolume,     // Sử dụng tên mới
  modelOutputVolume, // Sử dụng tên mới
  connected
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cập nhật CSS variable --user-mic-volume cho hiệu ứng vòng tròn đỏ
  useEffect(() => {
    if (buttonRef.current) {
      // Chuyển đổi userMicVolume (0-1) thành một giá trị phù hợp cho style
      // Ví dụ: nếu userMicVolume là 0-1, bạn có thể nhân với một hệ số
      // để hiệu ứng rõ ràng hơn. Giả sử bạn muốn scale từ 0px đến 20px chẳng hạn.
      const effectScale = userMicVolume * 150; // Điều chỉnh 20 theo ý muốn
      buttonRef.current.style.setProperty('--user-mic-volume-effect', `${effectScale}px`);
    }
  }, [userMicVolume, muted]); // Cập nhật khi userMicVolume hoặc muted thay đổi

  return (
    <div className='flex items-center gap-2'>
      <button
        ref={buttonRef} // Gán ref cho button
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
          {muted ? <MicOff /> : <Mic />}
        </span>
        {!muted && (
          <div
            className='pointer-events-none absolute inset-0 z-0 rounded-full bg-red-500 opacity-35 transition-all duration-200 ease-in-out'
            style={{
              // Sử dụng biến CSS đã được đặt bởi useEffect
              top: `calc(var(--user-mic-volume-effect, 0px) * -1)`,
              left: `calc(var(--user-mic-volume-effect, 0px) * -1)`,
              width: `calc(100% + var(--user-mic-volume-effect, 0px) * 2)`,
              height: `calc(100% + var(--user-mic-volume-effect, 0px) * 2)`
            }}
          />
        )}
      </button>
      <div className='flex h-12 w-12 items-center justify-center'>
        {/* AudioPulse này giờ sẽ dùng modelOutputVolume */}
        <AudioPulse volume={modelOutputVolume} active={connected /* Hoặc một cờ isModelSpeaking */} hover={false} />
      </div>
    </div>
  );
}

export default MicButton;