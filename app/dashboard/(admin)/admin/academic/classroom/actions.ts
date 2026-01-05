"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateClassroom = () => revalidatePath("/dashboard/admin/academic/classroom");

export async function createClassroomAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/classrooms",
            onSuccess: revalidateClassroom,
        },
        state,
        formData
    );
}

export async function updateClassroomAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/classrooms/${id}`,
            onSuccess: revalidateClassroom,
        },
        state,
        formData
    );
}

export async function deleteClassroomAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/classrooms/${id}`,
            onSuccess: revalidateClassroom,
        },
        state,
        formData
    );
}
