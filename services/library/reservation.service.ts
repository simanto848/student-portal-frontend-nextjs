import {
  libraryApi,
  handleLibraryApiError,
  extractLibraryArrayData,
  extractLibraryItemData,
  LibraryApiResponse,
} from "./axios-instance";
import { Reservation, ReservationStatus, Library, BookCopy, Book } from "./types";

export interface ReservationUpdatePayload {
  copyId?: string;
  libraryId?: string;
  userId?: string;
  userType?: string;
  status?: ReservationStatus;
  notes?: string;
  reservationDate?: string;
  expiryDate?: string;
}

export const normalizeReservation = (data: unknown): Reservation => {
  const d = data as Record<string, unknown>;

  // Handle populated copyId
  let copyId = (d.copyId as string) || "";
  let copy = d.copy as BookCopy | undefined;

  if (d.copyId && typeof d.copyId === "object") {
    const copyObj = d.copyId as any;
    copyId = copyObj._id || copyObj.id;

    // Handle nested book in copy
    let book = copyObj.bookId as Book | undefined;
    let bookIdStr = copyObj.bookId as string;

    if (copyObj.bookId && typeof copyObj.bookId === 'object') {
      const bookObj = copyObj.bookId as any;
      bookIdStr = bookObj._id || bookObj.id;
      book = {
        ...bookObj,
        id: bookIdStr
      };
    }

    copy = {
      ...copyObj,
      id: copyObj._id || copyObj.id,
      bookId: bookIdStr,
      book
    } as BookCopy;
  }

  // Handle populated libraryId
  let libraryId = (d.libraryId as string) || "";
  let library = d.library as Library | undefined;

  if (d.libraryId && typeof d.libraryId === "object") {
    const libObj = d.libraryId as any;
    libraryId = libObj._id || libObj.id;
    library = {
      ...libObj,
      id: libObj._id || libObj.id,
    } as Library;
  }

  return {
    id: (d.id as string) || (d._id as string) || "",
    userType: (d.userType as Reservation["userType"]) || "student",
    userId: (d.userId as string) || "",
    copyId,
    copy,
    libraryId,
    library,
    reservationDate: (d.reservationDate as string) || "",
    expiryDate: (d.expiryDate as string) || "",
    status: (d.status as ReservationStatus) || "pending",
    pickupById: (d.pickupById as string) || "",
    fulfilledAt: (d.fulfilledAt as string) || "",
    notes: (d.notes as string) || "",
    hoursUntilExpiry: (d.hoursUntilExpiry as number) || 0,
    isExpired: (d.isExpired as boolean) || false,
    canCancel: (d.canCancel as boolean) || false,
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
    user: d.user as Reservation["user"],
  };
};

export const reservationService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: ReservationStatus;
    userId?: string;
    libraryId?: string;
    search?: string;
  }): Promise<{
    reservations: Reservation[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> => {
    try {
      const res = await libraryApi.get("/library/reservations/all", { params });
      const data = res.data as any;
      const rawReservations = data.data?.reservations || [];

      const reservations = Array.isArray(rawReservations)
        ? rawReservations.map(normalizeReservation)
        : [];
      return { reservations, pagination: data.data?.pagination };
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  getById: async (id: string): Promise<Reservation> => {
    try {
      const res = await libraryApi.get(`/library/reservations/${id}`);
      return normalizeReservation(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  fulfill: async (id: string, notes?: string): Promise<Reservation> => {
    try {
      const payload = notes ? { notes } : {};
      const res = await libraryApi.post(
        `/library/reservations/${id}/fulfill`,
        payload
      );
      return normalizeReservation(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  updateStatus: async (
    id: string,
    payload: ReservationUpdatePayload
  ): Promise<Reservation> => {
    try {
      const res = await libraryApi.patch(
        `/library/reservations/${id}`,
        payload
      );
      return normalizeReservation(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  checkExpired: async (): Promise<{
    message: string;
    expiredCount: number;
  }> => {
    try {
      const res = await libraryApi.post("/library/reservations/check-expired");
      return (
        res.data.data ||
        res.data || { message: "Expired checked", expiredCount: 0 }
      );
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  create: async (payload: {
    userId: string;
    userType: string;
    copyId: string;
    libraryId: string;
    notes?: string;
  }): Promise<Reservation> => {
    try {
      const res = await libraryApi.post("/library/reservations/reserve", payload);
      return normalizeReservation(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  cancel: async (id: string, reason?: string): Promise<Reservation> => {
    try {
      const res = await libraryApi.post(`/library/reservations/${id}/cancel`, {
        reason,
      });
      return normalizeReservation(extractLibraryItemData(res));
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },

  getMyReservations: async (params?: {
    page?: number;
    limit?: number;
    status?: ReservationStatus;
  }): Promise<Reservation[]> => {
    try {
      const res = await libraryApi.get("/library/reservations/my-reservations", { params });
      const data = res.data as any;
      const raw = data.data?.reservations ?? data.data ?? [];
      return Array.isArray(raw) ? raw.map(normalizeReservation) : [];
    } catch (error) {
      handleLibraryApiError(error);
      throw error as Error;
    }
  },
};
