// src/services/logAnalysisApi.ts
import { LogAnalysisResult } from '../../../models/logAnalysis/logAnalysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Cấu hình URL backend

export const fetchLogAnalysisData = async (): Promise<LogAnalysisResult> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/logs/analysis/latest`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch log analysis data' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: LogAnalysisResult = await response.json();
    return data;
};