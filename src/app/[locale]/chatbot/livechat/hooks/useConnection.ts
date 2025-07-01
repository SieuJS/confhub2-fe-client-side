// src/app/[locale]/chatbot/livechat/hooks/useConnection.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";

// Interface để định nghĩa props cho useConnection nếu truyền từ bên ngoài
// Hiện tại, chúng ta lấy trực tiếp từ context nên không cần props này nữa.
// interface UseConnectionProps {
//   sdkConnect: () => Promise<void>;
//   sdkDisconnect: () => void;
//   sdkConnected: boolean;
//   sdkIsConnecting: boolean;
// }

const useConnection = (/* props: UseConnectionProps */) => {
    // Lấy trực tiếp từ context
    const {
        connect: sdkConnect,
        disconnect: sdkDisconnect,
        connected: sdkConnected,
        isConnecting: sdkIsConnecting,
        on, // Để lắng nghe các event open, close, serverError từ SDK hook
        off,
    } = useLiveAPIContext();
    const { log } = useLoggerStore();

    // State của hook này, một số có thể không cần thiết nữa nếu sdkIsConnecting đã đủ
    // const [isConnectingLocal, setIsConnectingLocal] = useState(false); // Có thể dùng sdkIsConnecting
    const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
    const [connectionStatusMessage, setConnectionStatusMessage] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const hasAttemptedConnect = useRef(false); // Để tránh gọi connect nhiều lần không cần thiết

    const connectWithPermissions = useCallback(async () => {
        if (sdkIsConnecting || sdkConnected) {
            log({ date: new Date(), type: "info.connectAttempt", message: `Connect attempt skipped: sdkIsConnecting=${sdkIsConnecting}, sdkConnected=${sdkConnected}` });
            return;
        }

        hasAttemptedConnect.current = true;
        // setIsConnectingLocal(true); // sdkIsConnecting sẽ được cập nhật bởi useLiveAPI
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

            await sdkConnect(); // Gọi hàm connect từ useLiveAPI
            // Trạng thái connected và isConnecting sẽ được cập nhật bởi useLiveAPI thông qua context
            // streamStartTime sẽ được set trong useEffect khi 'open' event được nhận

        } catch (err) {
            // console.error("Error getting media permissions or connecting via SDK:", err);
            const connectionError = err instanceof Error ? err : new Error(String(err));
            setError(connectionError);
            log({ date: new Date(), type: "error.connection", message: `Connection failed: ${connectionError.message}` });

            if (connectionError.message.toLowerCase().includes('permission denied') || connectionError.message.toLowerCase().includes('not allowed')) {
                setConnectionStatusMessage("Mic permission denied. Please grant access.");
            } else {
                setConnectionStatusMessage(`Connection failed: ${connectionError.message.substring(0, 100)}...`);
            }
            // setIsConnectingLocal(false); // sdkIsConnecting sẽ tự cập nhật
            setStreamStartTime(null);
            hasAttemptedConnect.current = false; // Cho phép thử lại
        }
    }, [sdkConnect, sdkIsConnecting, sdkConnected, log]);

    const handleDisconnect = useCallback(() => {
        log({ date: new Date(), type: "system.disconnect", message: "Disconnect requested by user." });
        sdkDisconnect(); // Gọi hàm disconnect từ useLiveAPI
        // Các state khác (connected, isConnecting, streamStartTime) sẽ được cập nhật thông qua event 'close' từ useLiveAPI
        // setConnectionStatusMessage("Disconnected."); // Có thể để event 'close' xử lý
        setError(null);
        hasAttemptedConnect.current = false;
    }, [sdkDisconnect, log]);

    const handleReconnect = useCallback(async () => {
        log({ date: new Date(), type: "system.reconnect", message: "Reconnect attempt..." });
        if (sdkConnected) { // Nếu đang kết nối, ngắt trước
            handleDisconnect();
            // Chờ một chút để đảm bảo disconnect hoàn tất trước khi connect lại
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setError(null);
        setConnectionStatusMessage(null);
        await connectWithPermissions();
    }, [connectWithPermissions, handleDisconnect, sdkConnected, log]);

    // Lắng nghe các event từ useLiveAPI để cập nhật state của hook này
    useEffect(() => {
        const onOpen = () => {
            // sdkConnected và sdkIsConnecting đã được cập nhật bởi useLiveAPI
            setStreamStartTime(Date.now());
            setConnectionStatusMessage("Connected");
            setError(null);
            log({ date: new Date(), type: "connection.event.open", message: "Session opened." });
            hasAttemptedConnect.current = false; // Reset sau khi kết nối thành công
        };

        const onClose = (closeEvent?: CloseEvent) => { // closeEvent có thể là undefined nếu tự gọi
            // sdkConnected và sdkIsConnecting đã được cập nhật
            setStreamStartTime(null);
            // Chỉ đặt lỗi nếu đây là một ngắt kết nối không mong muốn và chưa có lỗi nào được đặt
            if (!error && hasAttemptedConnect.current && !sdkIsConnecting) { // hasAttemptedConnect để biết là đã từng cố kết nối
                const reason = closeEvent?.reason || "Connection closed without specific reason.";
                const code = closeEvent?.code;
                log({ date: new Date(), type: "connection.event.close", message: `Session closed. Code: ${code}, Reason: ${reason}` });
                if (code !== 1000 && code !== 1005) { // 1000 = Normal Closure, 1005 = No Status Rcvd (thường do client tự đóng)
                    setError(new Error(`Connection closed unexpectedly. Code: ${code}. ${reason}`));
                    setConnectionStatusMessage("Connection lost.");
                } else if (!connectionStatusMessage || connectionStatusMessage === "Connected") {
                    // Nếu client chủ động disconnect, connectionStatusMessage có thể đã là "Disconnected."
                    setConnectionStatusMessage("Disconnected.");
                }
            } else if (connectionStatusMessage === "Connected") {
                 setConnectionStatusMessage("Disconnected.");
            }
            hasAttemptedConnect.current = false; // Reset
        };

        const onServerError = (err: Error | string) => {
            // sdkConnected và sdkIsConnecting đã được cập nhật
            const e = typeof err === 'string' ? new Error(err) : err;
            setError(e);
            setConnectionStatusMessage(`Error: ${e.message.substring(0,100)}...`);
            setStreamStartTime(null);
            log({ date: new Date(), type: "connection.event.error", message: `Server error: ${e.message}` });
            hasAttemptedConnect.current = false; // Cho phép thử lại
        };

        on('open', onOpen);
        on('close', onClose);
        on('serverError', onServerError);

        return () => {
            off('open', onOpen);
            off('close', onClose);
            off('serverError', onServerError);
        };
    }, [on, off, log, error, connectionStatusMessage, sdkIsConnecting]); // Thêm sdkIsConnecting để xử lý trường hợp đang connect mà bị lỗi

    // Đồng bộ trạng thái isConnecting của hook này với sdkIsConnecting từ context
    // và connectionStatusMessage khi sdkIsConnecting thay đổi
    useEffect(() => {
        if (sdkIsConnecting) {
            setConnectionStatusMessage("Connecting...");
            setError(null); // Xóa lỗi cũ khi bắt đầu kết nối mới
        }
        // Không cần setIsConnectingLocal(sdkIsConnecting) vì chúng ta sẽ trả về sdkIsConnecting
    }, [sdkIsConnecting]);


    return {
        connected: sdkConnected, // Trả về trạng thái từ SDK hook
        isConnecting: sdkIsConnecting, // Trả về trạng thái từ SDK hook
        streamStartTime,
        connectionStatusMessage,
        setConnectionStatusMessage, // Vẫn giữ lại nếu cần set message từ bên ngoài
        connectWithPermissions,
        handleDisconnect,
        handleReconnect,
        error
    };
};

export default useConnection;