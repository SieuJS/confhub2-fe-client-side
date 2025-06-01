// src/app/[locale]/chatbot/livechat/layout/ConnectionButton.tsx
import cn from 'classnames'
import { Hourglass, Pause, Play } from 'lucide-react'
import React from 'react' // No longer need useState here

type ConnectionButtonProps = {
  connected: boolean
  connect: () => Promise<void> | void // connect might not always be async, adjust if needed
  disconnect: () => void
  isConnecting: boolean // Receive isConnecting state from parent
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  connected,
  connect,
  disconnect,
  isConnecting // Use the prop
}) => {
  const handleClick = () => {
    // Don't handle async/loading state here, just call the functions.
    // The parent/hook manages the isConnecting state.
    if (connected) {
      disconnect()
    } else if (!isConnecting) {
      // Prevent clicking connect if already connecting
      // We don't need try/catch or state management here.
      // Errors/loading are handled by useConnection and reflected in props.
      connect()
    }
  }

  return (
    <button
      className={cn(
        'flex min-h-8 min-w-8 select-none items-center  justify-center rounded-full border border-transparent text-xl transition-all duration-200 ease-in-out focus:outline-2 focus:outline-offset-2 lg:min-h-10 lg:min-w-10',
        {
          // Red when connected (shows pause icon for disconnect action)
          'bg-red-500 text-white hover:bg-red-600': connected,
          // Green when disconnected AND not connecting (shows play icon)
          'bg-green-500 text-white hover:bg-green-600':
            !connected && !isConnecting,
          // Gray and disabled when connecting (shows hourglass icon)
          'cursor-not-allowed bg-gray-300 text-gray-500': isConnecting
        }
      )}
      onClick={handleClick}
      // Disable button if EITHER already connected (to prevent spam disconnect?) OR currently connecting
      // Usually, you only disable when isConnecting. If connected, clicking disconnects.
      disabled={isConnecting} // Disable the button ONLY while connecting
      aria-label={
        connected ? 'Disconnect' : isConnecting ? 'Connecting' : 'Connect'
      }
    >
      <span className='material-symbols-outlined filled'>
        {/* Icon depends on connection and connecting states */}
        {connected ? (
          <Pause className='h-4 w-4 lg:h-5 lg:w-5' />
        ) : isConnecting ? (
          <Hourglass className='h-4 w-4 lg:h-5 lg:w-5' />
        ) : (
          <Play className='h-4 w-4 lg:h-5 lg:w-5' />
        )}
      </span>
    </button>
  )
}

export default ConnectionButton
