"use server";

import { revalidatePath } from "next/cache";
import { attendanceService, BulkAttendancePayload, Attendance } from "@/services/enrollment/attendance.service";

/**
 * Centralized revalidation for attendance records.
 * @param id Optional attendance record ID for specific page revalidation.
 */
function revalidateAttendance(id?: string) {
    revalidatePath("/dashboard/admin/enrollment/attendance");
    if (id) {
        revalidatePath(`/dashboard/admin/enrollment/attendance/${id}`);
        revalidatePath(`/dashboard/admin/enrollment/attendance/${id}/edit`);
    }
}

/**
 * Bulk marks attendance for a batch.
 */
export async function markBulkAttendanceAction(data: BulkAttendancePayload) {
    try {
        const result = await attendanceService.bulkMarkAttendance(data);
        revalidateAttendance();
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to mark attendance" };
    }
}

/**
 * Updates a single attendance record.
 */
export async function updateAttendanceAction(id: string, data: Partial<Attendance>) {
    try {
        const result = await attendanceService.updateAttendance(id, data);
        revalidateAttendance(id);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to update attendance" };
    }
}

/**
 * Deletes an attendance record.
 */
export async function deleteAttendanceAction(id: string) {
    try {
        await attendanceService.deleteAttendance(id);
        revalidateAttendance(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to delete attendance" };
    }
}
