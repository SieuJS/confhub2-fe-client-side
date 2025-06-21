// src/app/apis/journal/getJournalDetails.ts (TẠO FILE MỚI)

import { JournalData } from "@/src/models/response/journal.response";

// Hàm này có thể được gọi an toàn từ Server Components
export async function getJournalDetails(journalId: string): Promise<JournalData> {
  const baseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_DATABASE_URL is not defined in environment variables.');
  }

  const apiUrl = `${baseUrl}/api/v1/journals/${journalId}`;

  // Sử dụng fetch với các tùy chọn cache của Next.js
  const response = await fetch(apiUrl, {
    next: {
      // Dữ liệu của một journal ít thay đổi, có thể cache lâu hơn
      revalidate: 86400, // Cache trong 1 giờ
    },
  });

  if (response.status === 404) {
    // Ném lỗi với status để Server Component có thể bắt và trả về notFound()
    const error: any = new Error(`Journal with id ${journalId} not found.`);
    error.status = 404;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  const journalData: JournalData = await response.json();
  return journalData;
}