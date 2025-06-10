import { NextResponse } from 'next/server';

// Loại bỏ các import liên quan đến file system (fs, path)
// import fs from 'fs';
// import path from 'path';
// import { JournalResponse } from '@/src/models/response/journal.response';

export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
        if (!baseUrl) {
            // Lỗi này chỉ log ở server, không lộ ra cho client
            console.error("NEXT_PUBLIC_DATABASE_URL is not defined in environment variables.");
            throw new Error("Server configuration error.");
        }

        // Giả sử endpoint để lấy tất cả journals là /api/v1/journals
        const apiUrl = `${baseUrl}/api/v1/journals`;
        console.log(`Proxying request to: ${apiUrl}`);

        const apiResponse = await fetch(apiUrl, {
            // Thêm header hoặc tùy chọn cache nếu cần
            // Ví dụ: cache trong 1 giờ
            next: { revalidate: 3600 } 
        });

        if (!apiResponse.ok) {
            // Chuyển tiếp lỗi từ API gốc
            return NextResponse.json(
                { message: `Error from upstream API: ${apiResponse.statusText}` },
                { status: apiResponse.status }
            );
        }

        const allJournals = await apiResponse.json();

        console.log(`Successfully fetched ${allJournals.length} journals from the upstream API.`);
        return NextResponse.json(allJournals);

    } catch (error: any) {
        console.error('Failed to proxy request for journals:', error.message, error);
        return NextResponse.json(
            { message: 'Internal Server Error: Failed to fetch journals', error: error.message },
            { status: 500 }
        );
    }
}