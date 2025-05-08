// src/hooks/useLogAnalysisData.ts
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchLogAnalysisData } from '../../app/api/logAnalysis/logAnalysisApi'; // Đường dẫn có thể cần điều chỉnh
import { LogAnalysisResult } from '../../models/logAnalysis/logAnalysis'; // Đường dẫn có thể cần điều chỉnh

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; // Cung cấp giá trị mặc định nếu cần

// Hook nhận thêm tham số filterStartTime và filterEndTime
export const useLogAnalysisData = (
    filterStartTime?: number, // Milliseconds
    filterEndTime?: number   // Milliseconds
) => {
    const [data, setData] = useState<LogAnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    // fetchData giờ đây sử dụng filterStartTime và filterEndTime từ props của hook
    const fetchData = useCallback(async (isManualRefresh = false) => {
        // Luôn set loading khi fetch (kể cả manual refresh hoặc filter change)
        setLoading(true);
        setError(null);

        // Xóa dữ liệu cũ khi bắt đầu fetch mới (tùy chọn, cân nhắc UX)
        // setData(null);

        try {
            console.log(`Fetching log analysis data with filters: Start=${filterStartTime}, End=${filterEndTime}`);
            // Truyền filterStartTime và filterEndTime vào hàm API
            const result = await fetchLogAnalysisData(filterStartTime, filterEndTime);
            console.log("Fetch successful, updating data.");
            setData(result);
            setError(null); // Xóa lỗi nếu fetch thành công
        } catch (err: any) {
            console.error("Fetch failed:", err);
            setError(err.message || 'Failed to fetch data');
            // Không xóa dữ liệu cũ khi lỗi nếu đang hiển thị dữ liệu từ lần fetch trước? Cân nhắc UX
            // setData(null); // Xóa dữ liệu cũ nếu có lỗi nghiêm trọng
        } finally {
            setLoading(false);
        }
    // Thêm filterStartTime và filterEndTime vào dependency array của useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStartTime, filterEndTime]);

    
    useEffect(() => {
        let socket: Socket | null = null;

        fetchData(false);

        // Lấy token từ nơi bạn lưu trữ (ví dụ: localStorage)
        // Thay 'authToken' bằng key bạn sử dụng để lưu token
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

        if (!SOCKET_URL) {
            console.error("Socket URL is not defined. Check NEXT_PUBLIC_BACKEND_URL environment variable.");
            setError("Socket URL is not defined.");
            // setLoading(false); // fetchData sẽ tự xử lý loading
            return;
        }

        // QUAN TRỌNG: Chỉ kết nối socket nếu có token
        // Nếu route này không yêu cầu xác thực thì server không nên ngắt kết nối khi không có token
        if (!authToken) {
            console.warn('No auth token found in localStorage. Socket.IO connection for log analysis will not be established.');
            setError(prev => {
                const noTokenMsg = 'Real-time updates disabled: Authentication token not found.';
                if (prev && !prev.includes("token not found")) return `${prev}, ${noTokenMsg}`;
                return noTokenMsg;
            });
            setIsConnected(false);
            // setLoading(false); // fetchData đã xử lý
            return; // Không kết nối socket nếu không có token
        }

        try {
            socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                auth: { // <<< THÊM DÒNG NÀY ĐỂ GỬI TOKEN
                    token: authToken
                }
            });

            socket.on('connect', () => {
                console.log('Socket.IO Connected:', socket?.id);
                setIsConnected(true);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket.IO Disconnected:', reason);
                setIsConnected(false);
                if (reason === 'io server disconnect') {
                    // Server chủ động ngắt, kiểm tra log server. Có thể do token hết hạn hoặc không hợp lệ.
                    // Nếu client vẫn còn token cũ và server báo lỗi, client có thể cần xử lý logout/refresh token.
                    // Hiện tại, không tự động connect lại nếu server chủ động ngắt
                    // socket?.connect(); // Bỏ dòng này nếu server ngắt là do lỗi auth
                }
            });

            socket.on('connect_error', (err) => {
                 console.error('Socket.IO Connection Error:', err);
                 setIsConnected(false);
                 // Lỗi này thường xảy ra TRƯỚC khi 'disconnect' với reason 'io server disconnect' nếu là lỗi auth từ middleware
                 // err.message có thể là "Authentication error: Invalid or expired token."
                 setError(prev => {
                     const socketErrorMsg = `Socket Connection Error: ${err.message}`;
                     // Nếu lỗi là do middleware (err.data.code === 'AUTH_FAILED') thì đây là lỗi xác thực
                     // @ts-ignore
                     if (err.data && err.data.code === 'AUTH_FAILED') {
                         return `Authentication failed: ${err.message}. Please try logging in again.`;
                     }
                     if (prev && !prev.includes("Socket Connection Error:")) {
                         return `${prev}, ${socketErrorMsg}`;
                     }
                     return socketErrorMsg;
                 });
            });

            socket.on('log_analysis_update', (updatedData: LogAnalysisResult) => {
                console.log('Received log_analysis_update event via Socket');
                setData(updatedData);
                setError(null);
                setLoading(false);
            });

            // Lắng nghe lỗi xác thực từ server (do handleConnection gửi)
            socket.on('auth_error', (authError: { message: string }) => {
                console.error('Socket.IO Authentication Error from server:', authError.message);
                setError(`Authentication Error: ${authError.message}. Please log in again.`);
                setIsConnected(false);
                // Có thể thực hiện logout người dùng tại đây nếu cần
            });


        } catch (socketError: any) {
             console.error("Failed to initialize Socket.IO:", socketError);
             setError(prev => prev ? `${prev}, Socket Init Error: ${socketError.message}` : `Socket Init Error: ${socketError.message}`);
        }

        return () => {
            if (socket) {
                console.log('Disconnecting Socket.IO in cleanup...');
                socket.off('connect');
                socket.off('disconnect');
                socket.off('connect_error');
                socket.off('log_analysis_update');
                socket.off('auth_error');
                socket.disconnect();
            }
        };
    // fetchData là dependency chính. `authToken` cũng nên là dependency nếu nó có thể thay đổi
    // và bạn muốn hook tự động kết nối lại.
    // }, [fetchData, filterStartTime, filterEndTime, authToken]); // Nếu authToken là state/prop
    }, [fetchData, filterStartTime, filterEndTime]); // Giữ nguyên nếu authToken chỉ lấy 1 lần khi mount

    return { data, loading, error, isConnected, refetchData: () => fetchData(true) };
};