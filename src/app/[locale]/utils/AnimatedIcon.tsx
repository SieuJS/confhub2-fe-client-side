// src/components/AnimatedIcon.tsx
'use client' // <--- THÊM DÒNG NÀY
import React, { useRef, useState } from 'react' // Import useState
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

// Import file animation JSON (điều chỉnh đường dẫn nếu cần)
// Đảm bảo file Animation.json nằm cùng cấp hoặc đường dẫn tương đối đúng
import animationData from './Animation.json'

interface AnimatedIconProps {
  className?: string // Để truyền các class Tailwind cho kích thước, margin, v.v.
  loopOnHover?: boolean // Tuỳ chọn: có lặp lại animation khi hover không
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  className,
  loopOnHover = false
}) => {
  // Sử dụng useRef với kiểu LottieRefCurrentProps từ lottie-react
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  // State để theo dõi trạng thái hover
  const [isHovered, setIsHovered] = useState(false)

  // Cấu hình cho component Lottie
  const options = {
    animationData: animationData,
    // Điều khiển thuộc tính loop dựa vào trạng thái hover VÀ prop loopOnHover
    loop: isHovered && loopOnHover,
    autoplay: false, // Luôn đặt false, chúng ta sẽ điều khiển play/stop bằng code
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice' // Giữ tỷ lệ khung hình
    }
  }

  // Xử lý khi di chuột vào
  const handleMouseEnter = () => {
    setIsHovered(true) // Cập nhật state hover
    const lottie = lottieRef.current
    if (lottie) {
      // Dừng animation hiện tại và reset về frame 0
      lottie.stop()
      // Đặt hướng chạy là tiến (từ 0 đến cuối)
      lottie.setDirection(1)
      // Bắt đầu chạy animation
      lottie.play()
      // Lưu ý: Chúng ta KHÔNG gọi setLoop ở đây. Prop `loop` của component Lottie
      // sẽ được cập nhật tự động bởi React sau khi state `isHovered` thay đổi,
      // điều này sẽ cấu hình lottie-web để lặp hoặc không lặp ở cuối animation.
    }
  }

  // Xử lý khi di chuột ra
  const handleMouseLeave = () => {
    setIsHovered(false) // Cập nhật state hover (làm cho prop `loop` thành false)
    const lottie = lottieRef.current
    if (lottie) {
      if (loopOnHover) {
        // Nếu animation được cấu hình để lặp khi hover, dừng ngay lập tức khi mouse leave
        lottie.stop()
      } else {
        // Nếu không lặp (chỉ chạy 1 lần khi hover), phát ngược animation về frame 0
        // Vẫn cần check currentFrame, dùng 'as any' và optional chaining để tránh lỗi nếu nó không tồn tại
        const currentFrame = (lottie as any)?.currentFrame

        // Chỉ phát ngược nếu animation chưa ở frame 0 và currentFrame là một số hợp lệ
        if (typeof currentFrame === 'number' && currentFrame !== 0) {
          lottie.setDirection(-1) // Đặt hướng chạy là ngược
          lottie.play() // Chạy animation ngược
          // Khi animation chạy ngược và đến frame 0, nó sẽ tự dừng vì prop `loop` đã là false (!isHovered)
        } else {
          // Đã ở frame 0 hoặc không lấy được frame, đảm bảo animation dừng
          lottie.stop()
        }
      }
    }
  }

  // Có thể thêm handler onComplete để đảm bảo dừng đúng sau khi chạy ngược
  const handleComplete = () => {
    const lottie = lottieRef.current
    if (lottie) {
      // Dùng 'as any' cho currentFrame và direction nếu cần
      const currentFrame = (lottie as any)?.currentFrame
      const direction = (lottie as any)?.direction

      // Nếu animation hoàn thành khi đang chạy ngược (direction -1)
      // và nó đã về frame 0, đồng thời không còn hover nữa (loop: false)
      // thì dừng nó lại để đảm bảo.
      if (
        typeof currentFrame === 'number' &&
        currentFrame === 0 &&
        typeof direction === 'number' &&
        direction === -1 &&
        !isHovered
      ) {
        lottie.stop()
      }
      // Hoặc nếu nó hoàn thành khi chạy xuôi (direction 1) và loop đã tắt (do mouseleave)
      // thì cũng dừng lại.
      if (
        typeof direction === 'number' &&
        direction === 1 &&
        !options.loop &&
        !isHovered
      ) {
        lottie.stop()
      }
    }
  }

  return (
    // Thẻ div bao bọc để áp dụng các event handler và Tailwind classes
    <div
      className={`inline-block ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Thêm overflow-hidden để tránh vấn đề hiển thị gradient ở kích thước nhỏ
      style={{ overflow: 'hidden' }}
    >
      <Lottie
        lottieRef={lottieRef} // Truyền ref
        animationData={options.animationData} // Truyền dữ liệu animation
        loop={options.loop} // Sử dụng prop loop động
        autoplay={options.autoplay} // Luôn false
        style={{ width: '100%', height: '100%' }} // Để Lottie lấp đầy div cha
        onComplete={handleComplete} // Thêm handler onComplete
      />
    </div>
  )
}

export default AnimatedIcon
