// ConnectionButton.tsx
import cn from "classnames";
import React from "react";
type ConnectionButtonProps = {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
};
const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  connected,
  connect,
  disconnect,
}) => (
  <button
    className={cn(
      "flex items-center justify-center w-12 h-12 rounded-full border border-transparent text-xl transition-all duration-200 ease-in-out focus:outline-2 focus:outline-offset-2 select-none",
      {
        "bg-blue-800 text-blue-500 hover:bg-blue-600 hover:border-blue-500":
          connected,
        "bg-blue-500 text-gray-900 hover:bg-blue-400 focus:outline-gray-200":
          !connected,
      },
    )}
    onClick={connected ? disconnect : connect}
  >
    <span className="material-symbols-outlined filled">
      {connected ? "pause" : "play_arrow"}
    </span>
  </button>
);

export default ConnectionButton;