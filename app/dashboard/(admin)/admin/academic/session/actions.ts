"use server";

import { createFormAction } from "@/lib/formAction";
import { sessionSchema } from "@/lib/validations/academic";
import { revalidatePath } from "next/cache";

/**
 * Common transformation for session form data
 */
const transformSessionData = (formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());

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

    return {
        ...data,
        year: data.year ? Number(data.year) : undefined,
        startDate: data.startDate ? new Date(data.startDate as string).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate as string).toISOString() : undefined,
    };
};

/**
 * Create Session Action
 */
export async function createSessionAction(state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: "/academic/sessions",
            schema: sessionSchema,
            transformData: transformSessionData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/session");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Update Session Action
 */
export async function updateSessionAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/sessions/${id}`,
            schema: sessionSchema,
            transformData: transformSessionData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/session");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Delete Session Action
 */
export async function deleteSessionAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/sessions/${id}`,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/session");
            },
        },
        state,
        formData
    );
    return result;
}
