"use server";

import { createFormAction } from "@/lib/formAction";
import { batchSchema } from "@/lib/validations/academic";
import { revalidatePath } from "next/cache";

/**
 * Common transformation for batch form data
 */
const transformBatchData = (formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());

    // Helper to extract value regardless of prefix (e.g., "1_name" -> "name")
    const data: any = {};
    Object.entries(rawData).forEach(([key, value]) => {
        let cleanKey = key;
        if (/^\d+_/.test(key)) {
            cleanKey = key.replace(/^\d+_/, '');
        } else if (key.includes('.')) {
            cleanKey = key.split('.').pop() || key;
        }
        data[cleanKey] = value;
    });

    // Helper to convert empty strings to undefined
    const emptyToUndefined = (value: any) =>
        value === "" || value === null || value === undefined ? undefined : value;

    return {
        ...data,
        year: data.year ? Number(data.year) : undefined,
        currentSemester: data.currentSemester ? Number(data.currentSemester) : undefined,
        maxStudents: data.maxStudents ? Number(data.maxStudents) : undefined,
        // Handle optional fields - convert empty strings to undefined
        counselorId: emptyToUndefined(data.counselorId),
        startDate: data.startDate ? new Date(data.startDate as string).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate as string).toISOString() : undefined,
        code: emptyToUndefined(data.code),
    };
};

/**
 * Create Batch
 */
export async function createBatchAction(state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: "/academic/batches",
            schema: batchSchema,
            transformData: transformBatchData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/batch");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Update Batch
 */
export async function updateBatchAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/batches/${id}`,
            schema: batchSchema,
            transformData: transformBatchData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/batch");
                revalidatePath(`/dashboard/admin/academic/batch/${id}`);
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Delete Batch
 */
export async function deleteBatchAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/batches/${id}`,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/batch");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Assign Counselor
 */
export async function assignCounselorAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: `/academic/batches/${id}/assign-counselor`,
            onSuccess: () => {
                revalidatePath(`/dashboard/admin/academic/batch/${id}`);
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Update Semester
 */
export async function updateSemesterAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/batches/${id}/semester`,
            onSuccess: () => {
                revalidatePath(`/dashboard/admin/academic/batch/${id}`);
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Assign Class Representative
 */
export async function assignCRAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: `/academic/batches/${id}/cr`,
            onSuccess: () => {
                revalidatePath(`/dashboard/admin/academic/batch/${id}`);
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Remove Class Representative
 */
export async function removeCRAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/batches/${id}/cr`,
            onSuccess: () => {
                revalidatePath(`/dashboard/admin/academic/batch/${id}`);
            },
        },
        state,
        formData
    );
    return result;
}
