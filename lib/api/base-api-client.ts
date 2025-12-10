import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

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

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
  statusCode: number;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ path: string; message: string }>;

  constructor(message: string, statusCode: number, errors?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class BaseApiClient {
  protected api: AxiosInstance;

  constructor(baseURL: string, withCredentials: boolean = true) {
    this.api = axios.create({
      baseURL,
      withCredentials,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor (optional - for global error handling)
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // You can add global error handling here if needed
        return Promise.reject(error);
      }
    );
  }

  protected handleError(error: unknown): never {
    if (error instanceof AxiosError && error.response) {
      const data = error.response.data as ApiErrorResponse;
      throw new ApiError(
        data.message || 'An error occurred',
        error.response.status,
        data.errors
      );
    }
    throw new ApiError('Network error occurred', 500);
  }

  protected extractArrayData<T>(response: { data: ApiResponse<T[]> }): T[] {
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
  }

  protected extractItemData<T>(response: { data: ApiResponse<T> | { data: T } }): T {
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
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.get(url, config);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async getList<T>(url: string, config?: AxiosRequestConfig): Promise<T[]> {
    try {
      const response = await this.api.get(url, config);
      return this.extractArrayData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.post(url, data, config);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.put(url, data, config);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.patch(url, data, config);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete(url, config);
      if (response.data) {
        return this.extractItemData<T>(response);
      }
      return undefined as T;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
