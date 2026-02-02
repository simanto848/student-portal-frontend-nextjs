"use server";

import { createFormAction } from "@/lib/formAction";
import { programSchema } from "@/lib/validations/academic";
import { revalidatePath } from "next/cache";

/**
 * Common transformation for program form data
 */
const transformProgramData = (formData: FormData) => {
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
        duration: data.duration ? Number(data.duration) : undefined,
        totalCredits: data.totalCredits ? Number(data.totalCredits) : undefined,
    };
};

/**
 * Create Program Action
 */
export async function createProgramAction(state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: "/academic/programs",
            schema: programSchema,
            transformData: transformProgramData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/program");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Update Program Action
 */
export async function updateProgramAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/programs/${id}`,
            schema: programSchema,
            transformData: transformProgramData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/program");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Delete Program Action
 */
export async function deleteProgramAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/programs/${id}`,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/program");
            },
        },
        state,
        formData
    );
    return result;
}
