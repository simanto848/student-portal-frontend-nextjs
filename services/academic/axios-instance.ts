import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-portal-gateway-detpel38n.vercel.app/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// API Response structure
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: {
        data: T;
        total?: number;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
    statusCode: number;
}

// API Error structure
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Array<{ path: string; message: string }>;
    statusCode: number;
}

// Custom error class for better error handling
export class AcademicApiError extends Error {
    statusCode: number;
    errors?: Array<{ path: string; message: string }>;

    constructor(message: string, statusCode: number, errors?: Array<{ path: string; message: string }>) {
        super(message);
        this.name = 'AcademicApiError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

// Helper to handle API errors
export const handleApiError = (error: unknown): never => {
    if (error instanceof AxiosError && error.response) {
        const data = error.response.data as ApiErrorResponse;
        throw new AcademicApiError(
            data.message || 'An error occurred',
            error.response.status,
            data.errors
        );
    }
    throw new AcademicApiError('Network error occurred', 500);
};

// Helper function to safely extract array data from API response
export const extractArrayData = <T>(response: { data: ApiResponse<T[]> }): T[] => {
    try {
        const apiData = response.data;
        if (apiData && apiData.data && Array.isArray(apiData.data.data)) {
            return apiData.data.data;
        }
        if (apiData && apiData.data && Array.isArray(apiData.data)) {
            return apiData.data as unknown as T[];
        }
        console.warn('Unexpected API response structure:', apiData);
        return [];
    } catch (error) {
        console.error('Error extracting data:', error);
        return [];
    }
};

// Helper function to extract single item data
export const extractItemData = <T>(response: { data: ApiResponse<T> | { data: T } }): T => {
    try {
        const apiData = response.data;
        if (apiData && 'data' in apiData) {
            const innerData = apiData.data;
            if (innerData && typeof innerData === 'object' && 'data' in innerData) {
                return (innerData as { data: T }).data;
            }
            return innerData as T;
        }
        return apiData as T;
    } catch (error) {
        console.error('Error extracting item data:', error);
        throw error;
    }
};
