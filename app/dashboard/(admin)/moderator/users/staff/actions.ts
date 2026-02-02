"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateStaff = async (id?: string) => {
    revalidatePath("/dashboard/moderator/users/staff");
    if (id) {
        revalidatePath(`/dashboard/moderator/users/staff/${id}`);
    }
};

export async function deleteStaffAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/staffs/${id}`,
            onSuccess: () => revalidateStaff(id),
        },
        state,
        formData
    );
}

export async function restoreStaffAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: `/user/staffs/${id}/restore`,
            onSuccess: () => revalidateStaff(id),
        },
        state,
        formData
    );
}

export async function permanentDeleteStaffAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/staffs/${id}/permanently`,
            onSuccess: () => revalidateStaff(id),
        },
        state,
        formData
    );
}

export async function updateStaffRoleAction(id: string, state: any, formData: FormData) {
    const role = formData.get("role");
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/user/staffs/${id}/role`,
            transformData: () => ({ role }),
            onSuccess: () => revalidateStaff(id),
        },
        state,
        formData
    );
}

export async function updateStaffIpAction(id: string, state: any, formData: FormData) {
    const ip = formData.get("ip");
    const isRemove = formData.get("method") === "remove";
    const endpoint = `/user/staffs/${id}/registered-ips/${isRemove ? 'remove' : 'add'}`;

    return await createFormAction(
        {
            method: "post",
            endpoint,
            transformData: () => ({ ipAddress: ip }),
            onSuccess: () => revalidateStaff(id),
        },
        state,
        formData
    );
}
