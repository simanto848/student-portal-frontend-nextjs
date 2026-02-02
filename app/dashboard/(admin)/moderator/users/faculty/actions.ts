"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateFaculty = async (id?: string) => {
    revalidatePath("/dashboard/moderator/users/faculty");
    if (id) {
        revalidatePath(`/dashboard/moderator/users/faculty/${id}`);
    }
};

export async function deleteTeacherAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/teachers/${id}`,
            onSuccess: () => revalidateFaculty(id),
        },
        state,
        formData
    );
}

export async function restoreTeacherAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: `/user/teachers/${id}/restore`,
            onSuccess: () => revalidateFaculty(id),
        },
        state,
        formData
    );
}

export async function permanentDeleteTeacherAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/teachers/${id}/permanently`,
            onSuccess: () => revalidateFaculty(id),
        },
        state,
        formData
    );
}

export async function updateTeacherIpAction(id: string, state: any, formData: FormData) {
    const ip = formData.get("ip");
    const isRemove = formData.get("method") === "remove";
    const endpoint = `/user/teachers/${id}/registered-ips/${isRemove ? 'remove' : 'add'}`;

    return await createFormAction(
        {
            method: "post",
            endpoint,
            transformData: () => ({ ipAddress: ip }),
            onSuccess: () => revalidateFaculty(id),
        },
        state,
        formData
    );
}
