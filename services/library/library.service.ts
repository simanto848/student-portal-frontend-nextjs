import {
  libraryApi,
  handleLibraryApiError,
  extractLibraryArrayData,
  extractLibraryItemData,
  LibraryApiResponse,
} from "./axios-instance";
import { LibraryStatus, Library } from "./types";

export interface LibraryCreatePayload {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  operatingHours?: Record<string, string>;
  maxBorrowLimit?: number;
  borrowDuration?: number;
  finePerDay?: number;
  reservationHoldDays?: number;
  status?: LibraryStatus;
}

export interface LibraryUpdatePayload {
  name?: string;
  code?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  operatingHours?: Record<string, string>;
  maxBorrowLimit?: number;
  borrowDuration?: number;
  finePerDay?: number;
  reservationHoldDays?: number;
  status?: LibraryStatus;
}

const normalizeLibrary = (data: unknown): Library => {
  const d = data as Record<string, unknown>;
  return {
    id: (d.id as string) || (d._id as string) || "",
    name: (d.name as string) || "",
    code: (d.code as string) || "",
    description: (d.description as string) || "",
    address: (d.address as string) || "",
    phone: (d.phone as string) || "",
    email: (d.email as string) || "",
    operatingHours: (d.operatingHours as Record<string, string>) || {},
    maxBorrowLimit: (d.maxBorrowLimit as number) || 3,
    borrowDuration: (d.borrowDuration as number) || 14,
    finePerDay: (d.finePerDay as number) || 0,
    reservationHoldDays: (d.reservationHoldDays as number) || 2,
    status: (d.status as LibraryStatus) || "active",
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
  };
};

export const libraryService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: LibraryStatus;
  }): Promise<{
    libraries: Library[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> => {
    try {
      const res = await libraryApi.get("/library/libraries", { params });
      const data = res.data as any;

      // Handle the specific response structure where libraries are in data.libraries
      const rawLibraries = data.data?.libraries || [];
      const libraries = Array.isArray(rawLibraries)
        ? rawLibraries.map(normalizeLibrary)
        : [];

      return {
        libraries,
        pagination: data.data?.pagination,
      };
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  getById: async (id: string): Promise<Library> => {
    try {
      const res = await libraryApi.get(`/library/libraries/${id}`);
      return normalizeLibrary(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  create: async (payload: LibraryCreatePayload): Promise<Library> => {
    try {
      const res = await libraryApi.post("/library/libraries", payload);
      return normalizeLibrary(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  update: async (
    id: string,
    payload: LibraryUpdatePayload
  ): Promise<Library> => {
    try {
      const res = await libraryApi.patch(`/library/libraries/${id}`, payload);
      return normalizeLibrary(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await libraryApi.delete(`/library/libraries/${id}`);
      return (
        res.data.data || res.data || { message: "Library deleted successfully" }
      );
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  restore: async (id: string): Promise<Library> => {
    try {
      const res = await libraryApi.post(`/library/libraries/${id}/restore`);
      return normalizeLibrary(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },
};
