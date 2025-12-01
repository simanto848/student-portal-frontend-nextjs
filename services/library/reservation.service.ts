import {
  libraryApi,
  handleLibraryApiError,
  extractLibraryArrayData,
  extractLibraryItemData,
  LibraryApiResponse,
} from "./axios-instance";
import { Reservation, ReservationStatus, Library, BookCopy } from "./types";

export interface ReservationUpdatePayload {
  status?: ReservationStatus;
  notes?: string;
}

const normalizeReservation = (data: unknown): Reservation => {
  const d = data as Record<string, unknown>;
  return {
    id: (d.id as string) || (d._id as string) || "",
    userType: (d.userType as Reservation["userType"]) || "student",
    userId: (d.userId as string) || "",
    copyId: (d.copyId as string) || "",
    copy: d.copy as BookCopy | undefined,
    libraryId: (d.libraryId as string) || "",
    library: d.library as Library | undefined,
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
  };
};

export const reservationService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: ReservationStatus;
    userId?: string;
    libraryId?: string;
  }): Promise<{
    reservations: Reservation[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }> => {
    try {
      const res = await libraryApi.get("/library/reservations/all", { params });
      const data = res.data as LibraryApiResponse<Reservation[]>;
      const reservations =
        extractLibraryArrayData<Reservation>(res).map(normalizeReservation);
      return { reservations, pagination: data.data?.pagination };
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
};
