"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateModerators = async () => {
    revalidatePath("/dashboard/admin/users/moderators");
};

export async function deleteModeratorAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/admins/${id}`,
            onSuccess: revalidateModerators,
        },
        state,
        formData
    );
}

export async function restoreModeratorAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: `/user/admins/${id}/restore`,
            onSuccess: revalidateModerators,
        },
        state,
        formData
    );
}

export async function permanentDeleteModeratorAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/admins/${id}/permanently`,
            onSuccess: revalidateModerators,
        },
        state,
        formData
    );
}
