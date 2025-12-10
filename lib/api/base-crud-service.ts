import { BaseApiClient } from './base-api-client';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Base CRUD Service
 * Provides standard CRUD operations for any entity
 */
export class BaseCrudService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> extends BaseApiClient {
  constructor(
    baseURL: string,
    protected readonly resourcePath: string,
    withCredentials: boolean = true,
    protected readonly options?: {
      resourceKey?: string; // Override the resource key if different from path
    }
  ) {
    super(baseURL, withCredentials);
  }

  /**
   * Get all items with optional pagination and filters
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.api.get(this.resourcePath, { params });
      const data = response.data?.data || response.data;
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return { data: data as T[] };
      }
      
      // Try to extract items from common response structures
      const resourceKey = this.options?.resourceKey || this.getResourceName();
      const items = data.data || data[resourceKey] || [];
      
      return {
        data: Array.isArray(items) ? items : [],
        pagination: data.pagination,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get single item by ID
   */
  async getById(id: string): Promise<T> {
    try {
      const response = await this.api.get(`${this.resourcePath}/${id}`);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create new item
   */
  async create(data: CreateDTO | FormData): Promise<T> {
    try {
      const response = await this.api.post(this.resourcePath, data);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update existing item
   */
  async update(id: string, data: UpdateDTO | FormData): Promise<T> {
    try {
      const response = await this.api.patch(`${this.resourcePath}/${id}`, data);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete item (soft delete)
   * Note: Uses deleteItem internally to avoid conflicts with BaseApiClient.delete
   */
  async deleteItem(id: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete(`${this.resourcePath}/${id}`);
      return response.data?.data || response.data || { message: 'Deleted successfully' };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Restore soft-deleted item
   */
  async restore(id: string): Promise<T> {
    try {
      const response = await this.api.post(`${this.resourcePath}/${id}/restore`);
      return this.extractItemData<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all soft-deleted items
   */
  async getDeleted(): Promise<T[]> {
    try {
      const response = await this.api.get(`${this.resourcePath}/deleted`);
      const data = response.data?.data || response.data;
      
      if (Array.isArray(data)) {
        return data;
      }
      
      const resourceKey = this.options?.resourceKey || this.getResourceName();
      const items = data.data || data[resourceKey] || [];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Permanently delete item
   * Note: Uses deleteItemPermanently to avoid conflicts with BaseApiClient.delete
   */
  async deleteItemPermanently(id: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete(`${this.resourcePath}/${id}/permanently`);
      return response.data?.data || response.data || { message: 'Deleted permanently' };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Helper to extract resource name from path
   * e.g., "/user/students" -> "students"
   */
  private getResourceName(): string {
    const parts = this.resourcePath.split('/').filter(Boolean);
    return parts[parts.length - 1];
  }
}
