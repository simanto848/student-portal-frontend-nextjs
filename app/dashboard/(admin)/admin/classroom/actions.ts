"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateClassroom = () => revalidatePath("/dashboard/admin/classroom");

export async function createWorkspaceAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/workspaces",
            onSuccess: revalidateClassroom,
        },
        state,
        formData
    );
}

export async function updateWorkspaceAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/workspaces/${id}`,
            onSuccess: revalidateClassroom,
        },
        state, // Changed from id as any to state to match signature if needed, though formAction uses state as 2nd arg
        formData
    );
}

export async function deleteWorkspaceAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/workspaces/${id}`,
            onSuccess: revalidateClassroom,
        },
        state,
        formData
    );
}

export async function deleteAssignmentAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/assignments/${id}`,
            onSuccess: revalidateClassroom,
        },
        state,
        formData
    );
}

export async function deleteMaterialAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/materials/${id}`,
            onSuccess: revalidateClassroom,
        },
        state,
        formData
    );
}
