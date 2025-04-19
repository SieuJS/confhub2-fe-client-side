// // src/components/LiveChat.tsx (NEW FILE)
// 'use client';
// import React, { useRef } from 'react';
// import { useLoggerStore } from '../lib/store-logger';
// import Logger from '../logger/Logger';
// import ChatInput from './ChatInput';
// import ConnectionButton from './ConnectionButton';
// import MicButton from './MicButton';
// import ChatIntroduction from './ChatIntroduction';
// import useLoggerScroll from '../hooks/useLoggerScroll';

// interface LiveChatProps {
//     connected: boolean;
//     isConnecting: boolean; // Added for potential loading states
//     streamStartTime: number | null; // Added for context
//     hasInteracted: boolean; // To show introduction or logger
//     connectWithPermissions: () => Promise<void>;
//     handleDisconnect: () => void;
//     muted: boolean;
//     setMuted: (muted: boolean) => void;
//     volume: number;
//     handleSendMessage: (message: string) => void;
//     handleStartVoice: () => void;
// }

// const LiveChat: React.FC<LiveChatProps> = ({
//     connected,
//     isConnecting, // Use if needed for visual feedback
//     streamStartTime, // Use if needed
//     hasInteracted,
//     connectWithPermissions,
//     handleDisconnect,
//     muted,
//     setMuted,
//     volume,
//     handleSendMessage,
//     handleStartVoice,
// }) => {
//     const loggerRef = useRef<HTMLDivElement>(null);
//     useLoggerScroll(loggerRef); // Keep scroll logic tied to the logger view

//     return (
//         <div className="flex h-full flex-col space-y-4 bg-white p-4 text-gray-700 shadow-inner">
//             {/* Logger Area */}
//             <div className="flex-grow overflow-y-auto" ref={loggerRef}>
//                 {!connected && !hasInteracted && !isConnecting ? ( // Show intro only if not connected AND not interacted AND not currently trying to connect
//                     <ChatIntroduction
//                         onStartVoice={handleStartVoice}
//                     />
//                 ) : (
//                     <Logger filter="none" /> // Show logger otherwise (during connection attempt or when connected/interacted)
//                 )}
//             </div>

//             {/* Input Area */}
//             <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 p-1.5">
//                 <ConnectionButton
//                     connected={connected}
//                     isConnecting={isConnecting} // Pass isConnecting to ConnectionButton if it supports a loading state
//                     connect={connectWithPermissions}
//                     disconnect={handleDisconnect}
//                 />
//                 {/* Only show Mic button if potentially connectable or connected */}
//                 {(connected || !hasInteracted || isConnecting) && (
//                      <MicButton
//                         muted={muted}
//                         setMuted={setMuted}
//                         volume={volume}
//                         connected={connected}
//                     />
//                 )}
//                 <div className="flex-grow">
//                     <ChatInput
//                         onSendMessage={handleSendMessage}
//                         disabled={!connected} // Disable input if not connected
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LiveChat;