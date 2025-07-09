// src/app/[locale]/chatbot/livechat/hooks/useConnection.ts

import { useState, useCallback, useEffect, useRef } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";

// ... (phần interface không đổi)

const useConnection = () => {
    const {
        connect: sdkConnect,
        disconnect: sdkDisconnect,
        connected: sdkConnected,
        isConnecting: sdkIsConnecting,
        on,
        off,
    } = useLiveAPIContext();
    
    // Lấy thêm hàm clearLogs từ store
    const { log, clearLogs } = useLoggerStore();

    const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
    const [connectionStatusMessage, setConnectionStatusMessage] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const hasAttemptedConnect = useRef(false);

    const connectWithPermissions = useCallback(async () => {
        if (sdkIsConnecting || sdkConnected) {
            log({ date: new Date(), type: "info.connectAttempt", message: `Connect attempt skipped: sdkIsConnecting=${sdkIsConnecting}, sdkConnected=${sdkConnected}` });
            return;
        }

        // ===================== THAY ĐỔI QUAN TRỌNG =====================
        // Xóa tất cả log của phiên trước đó ngay khi bắt đầu kết nối mới.
        // Điều này đảm bảo chỉ các log của phiên hiện tại được hiển thị.
        clearLogs();
        // ===============================================================

        hasAttemptedConnect.current = true;
        setError(null);
        setConnectionStatusMessage("Requesting mic permission...");
        log({ date: new Date(), type: "system.permission", message: "Requesting microphone permission..." });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            stream.getTracks().forEach(track => track.stop());
            log({ date: new Date(), type: "system.permission", message: "Microphone permission granted." });
            setConnectionStatusMessage("Connecting to live service...");

            await sdkConnect();

        } catch (err) {
            const connectionError = err instanceof Error ? err : new Error(String(err));
            setError(connectionError);
            log({ date: new Date(), type: "error.connection", message: `Connection failed: ${connectionError.message}` });

            if (connectionError.message.toLowerCase().includes('permission denied') || connectionError.message.toLowerCase().includes('not allowed')) {
                setConnectionStatusMessage("Mic permission denied. Please grant access.");
            } else {
                setConnectionStatusMessage(`Connection failed: ${connectionError.message.substring(0, 100)}...`);
            }
            setStreamStartTime(null);
            hasAttemptedConnect.current = false;
        }
    // Thêm clearLogs vào dependency array của useCallback
    }, [sdkConnect, sdkIsConnecting, sdkConnected, log, clearLogs]);

    // ... (các hàm handleDisconnect, handleReconnect, và useEffect không cần thay đổi)
    // ...
    const handleDisconnect = useCallback(() => {
        // log({ date: new Date(), type: "system.disconnect", message: "Disconnected" });
        sdkDisconnect();
        setError(null);
        hasAttemptedConnect.current = false;
    }, [sdkDisconnect, log]);

    const handleReconnect = useCallback(async () => {
        log({ date: new Date(), type: "system.reconnect", message: "Reconnect attempt..." });
        if (sdkConnected) {
            handleDisconnect();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setError(null);
        setConnectionStatusMessage(null);
        // Vì hàm này gọi connectWithPermissions, nên log cũng sẽ được xóa tự động.
        await connectWithPermissions();
    }, [connectWithPermissions, handleDisconnect, sdkConnected, log]);

    // ... (phần useEffect và return không đổi)
    useEffect(() => {
        const onOpen = () => {
            setStreamStartTime(Date.now());
            setConnectionStatusMessage("Connected");
            setError(null);
            log({ date: new Date(), type: "connection.event.open", message: "Session opened." });
            hasAttemptedConnect.current = false;
        };

        const onClose = (closeEvent?: CloseEvent) => {
            setStreamStartTime(null);
            if (!error && hasAttemptedConnect.current && !sdkIsConnecting) {
                const reason = closeEvent?.reason || "Connection closed without specific reason.";
                const code = closeEvent?.code;
                log({ date: new Date(), type: "connection.event.close", message: `Session closed. Code: ${code}, Reason: ${reason}` });
                if (code !== 1000 && code !== 1005) {
                    setError(new Error(`Connection closed unexpectedly. Code: ${code}. ${reason}`));
                    setConnectionStatusMessage("Connection lost.");
                } else if (!connectionStatusMessage || connectionStatusMessage === "Connected") {
                    setConnectionStatusMessage("Disconnected.");
                }
            } else if (connectionStatusMessage === "Connected") {
                 setConnectionStatusMessage("Disconnected.");
            }
            hasAttemptedConnect.current = false;
        };

        const onServerError = (err: Error | string) => {
            const e = typeof err === 'string' ? new Error(err) : err;
            setError(e);
            setConnectionStatusMessage(`Error: ${e.message.substring(0,100)}...`);
            setStreamStartTime(null);
            log({ date: new Date(), type: "connection.event.error", message: `Server error: ${e.message}` });
            hasAttemptedConnect.current = false;
        };

        on('open', onOpen);
        on('close', onClose);
        on('serverError', onServerError);

        return () => {
            off('open', onOpen);
            off('close', onClose);
            off('serverError', onServerError);
        };
    }, [on, off, log, error, connectionStatusMessage, sdkIsConnecting]);

    useEffect(() => {
        if (sdkIsConnecting) {
            setConnectionStatusMessage("Connecting...");
            setError(null);
        }
    }, [sdkIsConnecting]);


    return {
        connected: sdkConnected,
        isConnecting: sdkIsConnecting,
        streamStartTime,
        connectionStatusMessage,
        setConnectionStatusMessage,
        connectWithPermissions,
        handleDisconnect,
        handleReconnect,
        error
    };
};

export default useConnection;