import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { ApiError, ApiErrorResponse, ApiResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const createApiClient = (basePath: string = ""): AxiosInstance => {
  const client = axios.create({
    baseURL: `${BASE_URL}${basePath}`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds timeout
  });

  client.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await axios.post(
            `${BASE_URL}/user/auth/refresh-token`,
            {
              refreshToken,
            },
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;

          processQueue(null, accessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error, null);

          // Clear auth data and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          document.cookie =
            "accessToken=; path=/; max-age=0; SameSite=Lax; Secure";
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

// Pre-configured API clients for different services
export const api = createApiClient();
export const academicApi = createApiClient("/academic");
export const classroomApi = createApiClient("/classroom");
export const enrollmentApi = createApiClient("/enrollment");
export const userApi = createApiClient("/user");
export const libraryApi = createApiClient("/library");
export const notificationApi = createApiClient("/notification");
export const communicationApi = createApiClient("/communication");

export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response) {
    throw ApiError.fromAxiosError(error);
  }
  if (error instanceof ApiError) {
    throw error;
  }
  throw new ApiError(
    error instanceof Error ? error.message : "An unexpected error occurred",
    500,
  );
};

export const extractArrayData = <T>(
  response: AxiosResponse<ApiResponse<T[]>>,
): T[] => {
  try {
    const apiData = response.data;
    // Handle standard response structure: { data: { data: T[] } }
    if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
      return apiData.data.data;
    }

    // Handle alternative structure: { data: T[] }
    if (apiData?.data && Array.isArray(apiData.data)) {
      return apiData.data as unknown as T[];
    }

    console.warn("Unexpected API response structure:", apiData);
    return [];
  } catch (error) {
    console.error("Error extracting array data:", error);
    return [];
  }
};

export const extractItemData = <T>(
  response: AxiosResponse<ApiResponse<T> | { data: T }>,
): T => {
  try {
    const apiData = response.data;
    // Handle standard response structure: { data: { data: T } }
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

export const extractPaginatedData = <T>(
  response: AxiosResponse<ApiResponse<T[]>>,
): { data: T[]; pagination: ApiResponse<T[]>["data"]["pagination"] } => {
  try {
    const apiData = response.data;
    return {
      data: extractArrayData(response),
      pagination: apiData?.data?.pagination,
    };
  } catch (error) {
    console.error("Error extracting paginated data:", error);
    return { data: [], pagination: undefined };
  }
};

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
