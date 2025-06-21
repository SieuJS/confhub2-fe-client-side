// src/hooks/visualization/useVisualizationData.ts

import { useState, useEffect } from 'react';
import { fetchVisualizationData } from '@/src/app/apis/visualization/visualization';
import { ConferenceDetailsListResponse } from '@/src/models/response/conference.response';

// --- Props Interface ---
interface UseVisualizationDataProps {
  initialData: ConferenceDetailsListResponse | null;
  initialError: string | null;
}

interface UseVisualizationDataReturn {
  data: ConferenceDetailsListResponse | null;
  loading: boolean;
  error: string | null;
}

const useVisualizationData = ({ initialData, initialError }: UseVisualizationDataProps): UseVisualizationDataReturn => {
  // 1. Khởi tạo state trực tiếp từ props
  const [data, setData] = useState<ConferenceDetailsListResponse | null>(initialData);
  const [error, setError] = useState<string | null>(initialError);
  
  // 2. Loading sẽ là false nếu có dữ liệu hoặc lỗi ban đầu
  const [loading, setLoading] = useState(!initialData && !initialError);

  // 3. useEffect giờ đây chỉ chạy khi không có dữ liệu ban đầu
  // (ví dụ: lỗi server-side, hoặc trong môi trường dev mà server render không chạy)
  useEffect(() => {
    // Nếu đã có dữ liệu hoặc lỗi từ server, không làm gì cả.
    if (initialData || initialError) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchVisualizationData();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [initialData, initialError]); // Phụ thuộc vào props ban đầu

  return { data, loading, error };
};

export default useVisualizationData;