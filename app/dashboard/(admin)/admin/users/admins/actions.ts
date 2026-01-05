"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateAdmins = async (id?: string) => {
    revalidatePath("/dashboard/admin/users/admins");
    if (id) {
        revalidatePath(`/dashboard/admin/users/admins/${id}`);
    }
};

export async function deleteAdminAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/admins/${id}`,
            onSuccess: () => revalidateAdmins(id),
        },
        state,
        formData
    );
}

export async function restoreAdminAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: `/user/admins/${id}/restore`,
            onSuccess: () => revalidateAdmins(id),
        },
        state,
        formData
    );
}

export async function permanentDeleteAdminAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/admins/${id}/permanently`,
            onSuccess: () => revalidateAdmins(id),
        },
        state,
        formData
    );
}

export async function updateAdminRoleAction(id: string, state: any, formData: FormData) {
    const role = formData.get("role");
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/user/admins/${id}/role`,
            transformData: () => ({ role }),
            onSuccess: () => revalidateAdmins(id),
        },
        state,
        formData
    );
}

export async function updateAdminIpAction(id: string, state: any, formData: FormData) {
    const ip = formData.get("ip");
    const isRemove = formData.get("method") === "remove";
    const endpoint = `/user/admins/${id}/registered-ips/${isRemove ? 'remove' : 'add'}`;

    return await createFormAction(
        {
            method: "post",
            endpoint,
            transformData: () => ({ ipAddress: ip }),
            onSuccess: () => revalidateAdmins(id),
        },
        state,
        formData
    );
}
