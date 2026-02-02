"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidatePrerequisite = () => revalidatePath("/dashboard/admin/academic/prerequisite");

export async function createPrerequisiteAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/courses/prerequisites",
            onSuccess: revalidatePrerequisite,
        },
        state,
        formData
    );
}

export async function updatePrerequisiteAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/courses/prerequisites/${id}`,
            onSuccess: revalidatePrerequisite,
        },
        state,
        formData
    );
}

export async function deletePrerequisiteAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/courses/prerequisites/${id}`,
            onSuccess: revalidatePrerequisite,
        },
        state,
        formData
    );
}
