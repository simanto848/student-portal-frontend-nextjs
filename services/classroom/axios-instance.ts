import axios, { AxiosError } from 'axios';
import { getAuthToken } from '@/lib/authHelper';

const API_URL = process.env.NEXT_PUBLIC_CLASSROOM_API_URL || 'http://localhost:8000/api/classroom';

export const classroomApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

classroomApi.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface ClassroomApiResponse<T> {
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

export interface ClassroomApiErrorResponse {
    success: false;
    message: string;
    errors?: Array<{ path: string; message: string }>;
    statusCode: number;
}

export class ClassroomApiError extends Error {
    statusCode: number;
    errors?: Array<{ path: string; message: string }>;

    constructor(message: string, statusCode: number, errors?: Array<{ path: string; message: string }>) {
        super(message);
        this.name = 'ClassroomApiError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export const handleClassroomApiError = (error: unknown): never => {
    if (error instanceof AxiosError && error.response) {
        const data = error.response.data as ClassroomApiErrorResponse;
        throw new ClassroomApiError(
            data.message || 'An error occurred',
            error.response.status,
            data.errors
        );
    }
    throw new ClassroomApiError('Network error occurred', 500);
};

export const extractClassroomArrayData = <T>(response: { data: ClassroomApiResponse<T[]> }): T[] => {
    try {
        const apiData = response.data;
        if (apiData && apiData.data && Array.isArray(apiData.data.data)) {
            return apiData.data.data;
        }
        if (apiData && apiData.data && Array.isArray(apiData.data)) {
            return apiData.data as unknown as T[];
        }
        console.warn('Unexpected classroom API response structure:', apiData);
        return [];
    } catch (error) {
        console.error('Error extracting classroom data:', error);
        return [];
    }
};

export const extractClassroomItemData = <T>(response: { data: ClassroomApiResponse<T> | { data: T } }): T => {
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
        console.error('Error extracting classroom item data:', error);
        throw error;
    }
};
