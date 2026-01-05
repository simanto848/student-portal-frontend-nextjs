"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateStudents = async () => {
    revalidatePath("/dashboard/admin/users/students");
};

export async function deleteStudentAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/students/${id}`,
            onSuccess: revalidateStudents,
        },
        state,
        formData
    );
}

export async function restoreStudentAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: `/user/students/${id}/restore`,
            onSuccess: revalidateStudents,
        },
        state,
        formData
    );
}

export async function permanentDeleteStudentAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/user/students/${id}/permanently`,
            onSuccess: revalidateStudents,
        },
        state,
        formData
    );
}
