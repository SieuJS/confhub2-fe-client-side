// src/models/logAnalysis/importCrawl.ts

export interface Conference {
    Title: string; // Đổi tên cho nhất quán camelCase
    Acronym: string;
}

export interface ApiCrawlResponse {
    message: string;
    runtime?: number; // Có thể không có tùy endpoint
    data?: any; // Cần định nghĩa cụ thể hơn nếu biết cấu trúc
    error?: string; // Backend có thể trả về lỗi trong body
}

export interface CrawlProgress {
    current: number;
    total: number;
    status: 'idle' | 'parsing' | 'crawling' | 'success' | 'error' | 'stopped';
    currentChunkData?: Conference[]; // Thêm dữ liệu chunk hiện tại để hiển thị (optional)
}