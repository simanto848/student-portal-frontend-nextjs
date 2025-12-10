/**
 * Common API Types
 * Shared types used across all API services
 */

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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: FieldError[];
  statusCode: number;
}

export interface FieldError {
  path: string;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryParams extends PaginationParams {
  [key: string]: any;
}
