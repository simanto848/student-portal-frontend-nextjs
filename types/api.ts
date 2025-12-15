import { AxiosError } from 'axios';

// Standard API Response structure
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: {
        data: T;
        total?: number;
        pagination?: Pagination;
    };
    statusCode: number;
}

// Pagination structure
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

// API Error Response structure
export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: ValidationError[];
    statusCode: number;
}

// Validation error structure
export interface ValidationError {
    path: string;
    message: string;
}

// Custom API Error class
export class ApiError extends Error {
    statusCode: number;
    errors?: ValidationError[];

    constructor(message: string, statusCode: number, errors?: ValidationError[]) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.errors = errors;
    }

    static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
        if (error.response) {
            const data = error.response.data;
            return new ApiError(
                data?.message || 'An error occurred',
                error.response.status,
                data?.errors
            );
        }
        return new ApiError('Network error occurred', 500);
    }

    static isApiError(error: unknown): error is ApiError {
        return error instanceof ApiError;
    }
}

// Generic service interface for CRUD operations
export interface CrudService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
    getAll: () => Promise<T[]>;
    getById: (id: string) => Promise<T>;
    create: (data: CreateDTO) => Promise<T>;
    update: (id: string, data: UpdateDTO) => Promise<T>;
    delete: (id: string) => Promise<void>;
}

// Query options type
export interface QueryOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, string | number | boolean>;
}

// Paginated response type
export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}
