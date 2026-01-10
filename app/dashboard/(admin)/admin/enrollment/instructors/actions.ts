"use server";

import { createFormAction } from "@/lib/formAction";
import { instructorAssignmentSchema } from "@/lib/validations/enrollment";
import { revalidatePath } from "next/cache";

/**
 * Common transformation for instructor assignment form data
 */
const transformInstructorAssignmentData = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    return {
        ...data,
        semester: data.semester ? Number(data.semester) : undefined,
    };
};

/**
 * Create Instructor Assignment
 */
export async function createInstructorAssignmentAction(state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: "/enrollment/batch-course-instructors",
            schema: instructorAssignmentSchema,
            transformData: transformInstructorAssignmentData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/enrollment/instructors");
                revalidatePath("/dashboard/admin/academic/schedule"); // Schedule depends on this
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Update Instructor Assignment
 */
export async function updateInstructorAssignmentAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "put", // Service uses put for update
            endpoint: `/enrollment/batch-course-instructors/${id}`,
            schema: instructorAssignmentSchema,
            transformData: transformInstructorAssignmentData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/enrollment/instructors");
                revalidatePath(`/dashboard/admin/enrollment/instructors/${id}`);
                revalidatePath("/dashboard/admin/academic/schedule");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Delete Instructor Assignment
 */
export async function deleteInstructorAssignmentAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "delete",
            endpoint: `/enrollment/batch-course-instructors/${id}`,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/enrollment/instructors");
                revalidatePath("/dashboard/admin/academic/schedule");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Bulk Assign Instructors
 * (Custom implementation since createFormAction handles single objects by default)
 */
export async function bulkAssignInstructorsAction(assignments: any[]) {
    try {
        const { batchCourseInstructorService } = await import("@/services/enrollment/batchCourseInstructor.service");
        const result = await batchCourseInstructorService.bulkAssign(assignments);

        revalidatePath("/dashboard/admin/enrollment/instructors");
        revalidatePath("/dashboard/admin/academic/schedule");

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to perform bulk assignment" };
    }
}
