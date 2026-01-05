"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateSyllabus = () => {
    revalidatePath("/dashboard/admin/academic/syllabus");
    revalidatePath("/dashboard/admin/academic/syllabus/[id]", "page");
};

export async function createSyllabusAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/syllabi",
            onSuccess: revalidateSyllabus,
        },
        state,
        formData
    );
}

export async function updateSyllabusAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/syllabi/${id}`,
            onSuccess: revalidateSyllabus,
        },
        state,
        formData
    );
}

export async function deleteSyllabusAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/syllabi/${id}`,
            onSuccess: revalidateSyllabus,
        },
        state,
        formData
    );
}
