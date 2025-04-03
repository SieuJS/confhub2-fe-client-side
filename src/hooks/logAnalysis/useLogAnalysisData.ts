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

        // Fetch dữ liệu lần đầu và mỗi khi bộ lọc thay đổi
        fetchData(false); // Gọi fetchData khi mount hoặc khi filter thay đổi

        // --- Thiết lập Socket.IO ---
        try {
            // Đảm bảo SOCKET_URL có giá trị hợp lệ
            if (!SOCKET_URL) {
                 throw new Error("Socket URL is not defined. Check NEXT_PUBLIC_BACKEND_URL environment variable.");
            }
            socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnectionAttempts: 5, // Giới hạn số lần thử kết nối lại
                reconnectionDelay: 1000, // Thời gian chờ giữa các lần thử
            });

            socket.on('connect', () => {
                console.log('Socket.IO Connected:', socket?.id);
                setIsConnected(true);
                // Có thể fetch lại dữ liệu khi kết nối thành công để đảm bảo đồng bộ?
                // fetchData(false);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket.IO Disconnected:', reason);
                setIsConnected(false);
                if (reason === 'io server disconnect') {
                    // server chủ động ngắt kết nối, có thể không cần thử lại
                    socket?.connect(); // thử kết nối lại thủ công nếu muốn
                }
                // reason === 'io client disconnect' -> client gọi socket.disconnect()
                // reason === 'ping timeout' -> mạng có vấn đề
                // reason === 'transport close' -> kết nối bị mất
                // reason === 'transport error' -> lỗi kết nối
            });

            socket.on('connect_error', (err) => {
                 console.error('Socket.IO Connection Error:', err);
                 setIsConnected(false);
                 // Cập nhật lỗi, nhưng không ghi đè lỗi fetch dữ liệu nếu có
                 setError(prev => {
                     const socketErrorMsg = `Socket Error: ${err.message}`;
                     if (prev && !prev.includes("Socket Error:")) {
                         return `${prev}, ${socketErrorMsg}`;
                     }
                     return socketErrorMsg;
                 });
            });

            // Lắng nghe sự kiện update từ backend
            // QUAN TRỌNG: Xem xét lại logic này. Socket push thường gửi dữ liệu TỔNG THỂ mới nhất.
            // Việc này có thể ghi đè dữ liệu ĐÃ LỌC của bạn.
            // Tùy chọn:
            // 1. Chấp nhận: Socket update hiển thị dữ liệu tổng thể, bộ lọc chỉ áp dụng khi fetch/refresh.
            // 2. Bỏ qua socket update: Chỉ dựa vào refresh/filter change.
            // 3. Backend gửi kèm filter: Backend gửi { filterUsed: {start, end}, data: ... }, frontend chỉ cập nhật nếu filter khớp (phức tạp).
            // 4. Frontend tự fetch lại khi có tín hiệu: Backend chỉ gửi tín hiệu 'new_log_data_available', frontend gọi fetchData() với filter hiện tại. (Khả thi)

            // --- Lựa chọn 1 (Đơn giản nhất): Cập nhật data từ socket, có thể không khớp filter ---
            socket.on('log_analysis_update', (updatedData: LogAnalysisResult) => {
                console.log('Received log_analysis_update event via Socket (Data might be unfiltered)');
                // Chỉ cập nhật nếu người dùng đang xem 'All Time' hoặc không có filter?
                // Hoặc cứ cập nhật, người dùng biết socket là live data tổng thể?
                // Hiện tại: Cập nhật bất kể filter nào đang chọn.
                setData(updatedData);
                setError(null); // Xóa lỗi nếu socket gửi data thành công
                setLoading(false);
            });

            // --- Lựa chọn 4 (Thay thế lựa chọn 1): Fetch lại khi có tín hiệu ---
            /*
            socket.on('new_log_data_available', () => {
                 console.log('Signal received: new_log_data_available. Refetching with current filters...');
                 fetchData(false); // Gọi lại hàm fetch với filter hiện tại
            });
            */

        } catch (socketError: any) {
             console.error("Failed to initialize Socket.IO:", socketError);
             setError(prev => prev ? `${prev}, Socket Init Error: ${socketError.message}` : `Socket Init Error: ${socketError.message}`);
        }

        // --- Cleanup ---
        return () => {
            if (socket) {
                console.log('Disconnecting Socket.IO...');
                socket.off('connect');
                socket.off('disconnect');
                socket.off('connect_error');
                socket.off('log_analysis_update'); // Hoặc 'new_log_data_available' nếu dùng Lựa chọn 4
                socket.disconnect();
            }
        };
    // fetchData là dependency chính chứa các filter.
    // Thêm filterStartTime, filterEndTime vào đây để useEffect chạy lại khi filter thay đổi.
    }, [fetchData, filterStartTime, filterEndTime]);

    // Trả về hàm refetchData không cần tham số, vì nó sẽ dùng filter từ state của hook
    return { data, loading, error, isConnected, refetchData: () => fetchData(true) };
};