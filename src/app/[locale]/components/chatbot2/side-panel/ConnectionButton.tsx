// ConnectionButton.tsx
import cn from "classnames";
import React, { useState } from "react"; // Import useState

type ConnectionButtonProps = {
  connected: boolean;
  connect: () => Promise<void>; //  connect is now async
  disconnect: () => void;
};

const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  connected,
  connect,
  disconnect,
}) => {
  const [isConnecting, setIsConnecting] = useState(false); // State for button loading

  const handleClick = async () => {
    if (connected) {
      disconnect();
    } else {
      setIsConnecting(true); // Set loading state
      try {
        await connect(); // Await the connect promise
      } catch (error) {
          //You can handle the displaying error here, or SidePanel
          console.error("Connection error:", error); 
      } finally {
        setIsConnecting(false); // Reset loading state, always, success of fail
      }
    }
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full border border-transparent text-xl transition-all duration-200 ease-in-out focus:outline-2 focus:outline-offset-2 select-none",
        {
          "bg-red-500 text-white hover:bg-red-600": connected, // Changed to red for disconnect
          "bg-green-500 text-white hover:bg-green-600": !connected && !isConnecting, // Changed to green, disable when isConnecting
          "bg-gray-300 text-gray-500 cursor-not-allowed": isConnecting, // Disable and change style
        },
      )}
      onClick={handleClick}
      disabled={isConnecting} // Disable the button while connecting
    >
      <span className="material-symbols-outlined filled">
        {connected ? "pause" : (isConnecting ? "hourglass_empty" : "play_arrow")}
         {/*Loading indicator */}
      </span>
    </button>
  );
};

export default ConnectionButton;