"use server";

import { createFormAction } from "@/lib/formAction";
import { departmentSchema } from "@/lib/validations/academic";
import { revalidatePath } from "next/cache";

/**
 * Common transformation for department form data
 */
const transformDepartmentData = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    return data;
};

/**
 * Create Department Action
 */
export async function createDepartmentAction(state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "post",
            endpoint: "/academic/departments",
            schema: departmentSchema,
            transformData: transformDepartmentData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/department");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Update Department Action
 */
export async function updateDepartmentAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/departments/${id}`,
            schema: departmentSchema,
            transformData: transformDepartmentData,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/department");
            },
        },
        state,
        formData
    );
    return result;
}

/**
 * Delete Department Action
 */
export async function deleteDepartmentAction(id: string, state: any, formData: FormData) {
    const result = await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/departments/${id}`,
            onSuccess: () => {
                revalidatePath("/dashboard/admin/academic/department");
            },
        },
        state,
        formData
    );
    return result;
}
