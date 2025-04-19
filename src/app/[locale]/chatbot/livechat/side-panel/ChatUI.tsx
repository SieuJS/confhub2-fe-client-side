// components/ChatUI.tsx
"use client";

import { useState } from "react";
import SidePanel from "../side-panel/SidePanel";
import { Altair } from "../altair/Altair";

// Import hooks and components needed for connection status/restart
import useConnection from "../hooks/useConnection";
import useTimer from "../hooks/useTimer";
import ConnectionStatus from "./ConnectionStatus";
import RestartStreamButton from "./RestartStreamButton";

// Import types
import { OutputModality, PrebuiltVoice } from "../page"; // Adjust import path if needed

// Define the available voices (could also be passed as a prop if dynamic)
const availableVoices: PrebuiltVoice[] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Orus", "Zephyr"];

export default function ChatUI() {
    // --- State for output (moved from page.tsx) ---
    const [outputModality, setOutputModality] = useState<OutputModality>("text");
    const [selectedVoice, setSelectedVoice] = useState<PrebuiltVoice>("Puck");
    // --- END State ---

    // --- Manage Connection State and Timer centrally (moved from page.tsx) ---
    // These hooks now correctly run within the LiveAPIProvider's context
    const {
        connected,
        isConnecting,
        streamStartTime,
        connectionStatusMessage,
        connectWithPermissions,
        handleDisconnect,
        handleReconnect,
    } = useConnection();

    const {
        elapsedTime,
        showTimer,
        handleCloseTimer
    } = useTimer(isConnecting, connected, streamStartTime);
    // --- END: Manage Connection State and Timer centrally ---

    // Determine the status type for the ConnectionStatus component (moved from page.tsx)
    let connectionStatusType: "connected" | "error" | "info" | "connecting" = 'info';
    if (isConnecting) {
        connectionStatusType = 'connecting';
    } else if (connected) {
        connectionStatusType = 'connected';
    } else if (connectionStatusMessage) {
        connectionStatusType = streamStartTime !== null ? 'error' : 'info';
    }

    // Only show the external status if the timer is active OR there's a connection message (moved from page.tsx)
    const shouldShowExternalStatus = showTimer || (connectionStatusMessage && !connected && !isConnecting);

    // Show restart button if disconnected after an attempt (moved from page.tsx)
    const shouldShowRestartButton = !connected && streamStartTime !== null && !isConnecting;

    return (
        // Main layout div (moved from page.tsx)
        <div className="relative px-10 max-h-3/4 flex flex-col h-screen">

            {/* --- BEGIN: External Connection Status (Centered) and Restart Button (Right) --- */}
            {/* These components float above the main layout */}

            {shouldShowExternalStatus && (
                // Thêm div bao quanh để căn giữa
                <div className="fixed top-4 w-full flex justify-center z-50">
                    <ConnectionStatus
                        status={connectionStatusType}
                        message={connectionStatusMessage}
                        elapsedTime={connectionStatusType === 'connected' ? elapsedTime : undefined}
                        onClose={handleCloseTimer}
                    />
                </div>
            )}

            {shouldShowRestartButton && (
                // Vị trí của nút Restart vẫn giữ nguyên ở bên phải
                <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 mt-16">
                    <RestartStreamButton onRestart={() => { handleReconnect(); /* Optional: clear logs if needed after restart */ }} />
                </div>
            )}

            {/* --- END: External Connection Status and Restart Button --- */}

            {/* Inner layout for SidePanel and Altair (moved from page.tsx) */}

            {/* Side Panel - Pass connection state and handlers from ChatUI */}
            <SidePanel
                // Pass connection props from ChatUI's state/hooks
                connected={connected}
                isConnecting={isConnecting}
                streamStartTime={streamStartTime}
                connectionStatusMessage={connectionStatusMessage}
                connectWithPermissions={connectWithPermissions}
                handleDisconnect={handleDisconnect}
                // handleReconnect is not needed internally by SidePanel in this setup

                // Output settings props (Giữ nguyên)
                currentModality={outputModality}
                onModalityChange={setOutputModality}
                currentVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                availableVoices={availableVoices}
            />

            {/* Altair Area */}
            {/* Truyền state lựa chọn xuống Altair */}
            <Altair outputModality={outputModality} selectedVoice={selectedVoice} />

            {/* Khu vực hiển thị chat hoặc nội dung khác có thể đặt ở đây */}
        </div>
    );
}