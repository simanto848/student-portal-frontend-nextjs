"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateCourse = () => revalidatePath("/dashboard/admin/academic/course");

export async function createCourseAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/courses",
            onSuccess: revalidateCourse,
        },
        state,
        formData
    );
}

export async function updateCourseAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/courses/${id}`,
            onSuccess: revalidateCourse,
        },
        state,
        formData
    );
}

export async function deleteCourseAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/courses/${id}`,
            onSuccess: revalidateCourse,
        },
        state,
        formData
    );
}
