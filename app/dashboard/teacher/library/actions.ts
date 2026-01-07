"use server";

import { requireUser } from "@/lib/auth/userAuth";
import { borrowingService } from "@/services/library/borrowing.service";
import { reservationService } from "@/services/library/reservation.service";
import { libraryApi } from "@/services/library/axios-instance";
import { Borrowing, Reservation } from "@/services/library/types";

export interface LibraryDashboardData {
    borrowed: Borrowing[];
    overdue: Borrowing[];
    history: Borrowing[];
    reservations: Reservation[];
}

export async function getLibraryDashboardData(): Promise<LibraryDashboardData> {
    await requireUser();

    try {
        const [borrowed, overdue, history, reservations] = await Promise.all([
            borrowingService.getMyBorrowedBooks(),
            borrowingService.getMyOverdueBooks(),
            borrowingService.getMyBorrowingHistory({ limit: 10 }),
            reservationService.getMyReservations({ status: 'pending' })
        ]);

        return {
            borrowed: borrowed || [],
            overdue: overdue || [],
            history: history || [],
            reservations: reservations || []
        };
    } catch (error) {
        console.error("Failed to fetch library dashboard data:", error);
        return {
            borrowed: [],
            overdue: [],
            history: [],
            reservations: []
        };
    }
}
