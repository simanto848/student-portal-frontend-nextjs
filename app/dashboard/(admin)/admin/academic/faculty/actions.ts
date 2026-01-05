"use server";

import { createFormAction } from "@/lib/formAction";
import { facultySchema, assignDeanSchema } from "@/lib/validations/academic";
import { revalidatePath } from "next/cache";

/**
 * Common transformation for faculty form data
 */
const transformFacultyData = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    return data;
};

/**
 * Create Faculty Action
 */
export async function createFacultyAction(state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: "/academic/faculties",
            schema: facultySchema,
            transformData: transformFacultyData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/faculty");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Update Faculty Action
 */
export async function updateFacultyAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/faculties/${id}`,
            schema: facultySchema,
            transformData: transformFacultyData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/faculty");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Delete Faculty Action
 */
export async function deleteFacultyAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/faculties/${id}`,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/faculty");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Assign Dean Action
 */
export async function assignDeanAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: `/academic/faculties/${id}/assign-dean`,
            schema: assignDeanSchema,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/faculty");
            },
        },
        state,
        formData
    );
    return result;
}
