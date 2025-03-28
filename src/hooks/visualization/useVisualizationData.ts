import { useState, useEffect, useRef } from 'react'; // Thêm useRef
import { fetchVisualizationData } from '@/src/app/api/conference/visualizationApi';

interface UseVisualizationDataReturn {
  data: any[] | null; // Use ConferenceData[] | null if defined
  loading: boolean;
  error: string | null;
}

const logPrefix = "[useVisualizationData]";

const useVisualizationData = (): UseVisualizationDataReturn => {
  console.log(`%c${logPrefix} Hook executing`);
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<any[] | null>(null); // Để theo dõi tham chiếu

  useEffect(() => {
    console.log(`%c${logPrefix} useEffect running - Fetching data...`);
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchVisualizationData();
        console.log(`%c${logPrefix} Data fetched successfully. Result length: ${result?.length}`);
        if (dataRef.current !== result) {
            console.log(`%c${logPrefix} Data reference CHANGED after fetch.` + 'font-weight: bold;');
        } else {
             console.log(`%c${logPrefix} Data reference is STABLE after fetch.`);
        }
        dataRef.current = result; // Cập nhật ref *trước* khi set state
        setData(result);
      } catch (err: any) {
        console.error(`%c${logPrefix} Error fetching data:`, err);
        setError(err.message || 'An unknown error occurred.');
        setData(null); // Clear data on error
        dataRef.current = null;
      } finally {
        console.log(`%c${logPrefix} Setting loading to false.`);
        setLoading(false);
      }
    };

    loadData();
    // No dependencies needed if data fetching happens only once on mount
  }, []);

  console.log(`%c${logPrefix} Returning: loading=${loading}, error=${error}, data exists=${!!data}`);
  return { data, loading, error };
};

export default useVisualizationData;