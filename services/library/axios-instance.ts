import axios, { AxiosError } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export const libraryApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

libraryApi.interceptors.request.use((config) => {
  // Guard for Next.js SSR where window/localStorage are undefined
  if (typeof window !== "undefined") {
    const token = window.localStorage?.getItem("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      (
        config.headers as Record<string, string>
      ).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API Response structure
export interface LibraryApiResponse<T> {
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
export interface LibraryApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
  statusCode: number;
}

// Custom error class for better error handling
export class LibraryApiError extends Error {
  statusCode: number;
  errors?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = "LibraryApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Helper to handle API errors
export const handleLibraryApiError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as LibraryApiErrorResponse;
    throw new LibraryApiError(
      data.message || "An error occurred",
      error.response.status,
      data.errors
    );
  }
  throw new LibraryApiError("Network error occurred", 500);
};

// Helper function to safely extract array data from API response
export const extractLibraryArrayData = <T>(response: {
  data: LibraryApiResponse<T[]>;
}): T[] => {
  try {
    const apiData = response.data;
    if (apiData && apiData.data && Array.isArray(apiData.data.data)) {
      return apiData.data.data;
    }
    if (apiData && apiData.data && Array.isArray(apiData.data)) {
      return apiData.data as unknown as T[];
    }
    console.warn("Unexpected API response structure:", apiData);
    return [];
  } catch (error) {
    console.error("Error extracting data:", error);
    return [];
  }
};

// Helper function to extract single item data
export const extractLibraryItemData = <T>(response: {
  data: LibraryApiResponse<T> | { data: T };
}): T => {
  try {
    const apiData = response.data;
    if (apiData && "data" in apiData) {
      const innerData = apiData.data;
      if (innerData && typeof innerData === "object" && "data" in innerData) {
        return (innerData as { data: T }).data;
      }
      return innerData as T;
    }
    return apiData as T;
  } catch (error) {
    console.error("Error extracting item data:", error);
    throw error;
  }
};
