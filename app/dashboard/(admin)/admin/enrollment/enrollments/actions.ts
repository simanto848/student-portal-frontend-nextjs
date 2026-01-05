"use server";

import { revalidatePath } from "next/cache";
import { enrollmentService, CreateEnrollmentDto, Enrollment, BulkEnrollDto } from "@/services/enrollment/enrollment.service";

/**
 * Centralized revalidation for enrollment records.
 * @param id Optional enrollment record ID for specific page revalidation.
 */
function revalidateEnrollments(id?: string) {
    revalidatePath("/dashboard/admin/enrollment/enrollments");
    if (id) {
        revalidatePath(`/dashboard/admin/enrollment/enrollments/${id}`);
        revalidatePath(`/dashboard/admin/enrollment/enrollments/${id}/edit`);
    }
}

/**
 * Creates a new enrollment.
 */
export async function createEnrollmentAction(data: CreateEnrollmentDto) {
    try {
        const result = await enrollmentService.enrollStudent(data);
        revalidateEnrollments();
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to create enrollment" };
    }
}

/**
 * Bulk enrolls students.
 */
export async function bulkEnrollAction(data: BulkEnrollDto) {
    try {
        const result = await enrollmentService.bulkEnroll(data);
        revalidateEnrollments();
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to bulk enroll students" };
    }
}

/**
 * Updates an enrollment record.
 */
export async function updateEnrollmentAction(id: string, data: Partial<Enrollment>) {
    try {
        const result = await enrollmentService.updateEnrollment(id, data);
        revalidateEnrollments(id);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to update enrollment" };
    }
}

/**
 * Deletes an enrollment record.
 */
export async function deleteEnrollmentAction(id: string) {
    try {
        await enrollmentService.deleteEnrollment(id);
        revalidateEnrollments(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to delete enrollment" };
    }
}

/**
 * Progresses a batch to the next semester.
 */
export async function progressBatchSemesterAction(batchId: string) {
    try {
        const result = await enrollmentService.progressBatchSemester(batchId);
        revalidateEnrollments();
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to progress batch semester" };
    }
}

/**
 * Completes a semester for a batch.
 */
export async function completeBatchSemesterAction(batchId: string, semester: number) {
    try {
        const result = await enrollmentService.completeBatchSemester(batchId, semester);
        revalidateEnrollments();
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to complete batch semester" };
    }
}
