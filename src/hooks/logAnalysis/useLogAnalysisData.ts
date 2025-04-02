// src/hooks/useLogAnalysisData.ts
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchLogAnalysisData } from '../../app/api/logAnalysis/logAnalysisApi';
import { LogAnalysisResult } from '../../models/logAnalysis/logAnalysis';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // URL của Socket.IO server

export const useLogAnalysisData = () => {
    const [data, setData] = useState<LogAnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        let socket: Socket | null = null;

        // Hàm fetch dữ liệu ban đầu hoặc khi có tín hiệu update
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchLogAnalysisData();
                setData(result);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                setData(null); // Xóa dữ liệu cũ nếu có lỗi
            } finally {
                setLoading(false);
            }
        };

        // Fetch dữ liệu lần đầu khi component mount
        fetchData();

        // --- Thiết lập Socket.IO ---
        try {
            socket = io(SOCKET_URL, {
                transports: ['websocket'], // Ưu tiên websocket
            });

            socket.on('connect', () => {
                console.log('Socket.IO Connected:', socket?.id);
                setIsConnected(true);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket.IO Disconnected:', reason);
                setIsConnected(false);
                 // Cân nhắc: Có thể thử kết nối lại hoặc thông báo cho người dùng
            });

            socket.on('connect_error', (err) => {
                 console.error('Socket.IO Connection Error:', err);
                 setIsConnected(false);
                 setError(prev => prev ? `${prev}, Socket Error: ${err.message}` : `Socket Error: ${err.message}`);
            });

            // Lắng nghe sự kiện update từ backend
            // Giả định backend emit 'log_analysis_update' với dữ liệu mới nhất
            socket.on('log_analysis_update', (updatedData: LogAnalysisResult) => {
                console.log('Received log_analysis_update event');
                setData(updatedData);
                setError(null); // Xóa lỗi nếu nhận được update thành công
                setLoading(false); // Đảm bảo loading là false
            });

            // --- Thay thế bằng cơ chế refetch nếu backend chỉ báo hiệu ---
            // socket.on('new_log_data_available', () => {
            //     console.log('Signal received: new_log_data_available. Refetching...');
            //     fetchData(); // Gọi lại hàm fetch
            // });

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
                socket.off('log_analysis_update'); // Hoặc 'new_log_data_available'
                socket.disconnect();
            }
        };
    }, []); // Chạy một lần khi mount

    return { data, loading, error, isConnected };
};