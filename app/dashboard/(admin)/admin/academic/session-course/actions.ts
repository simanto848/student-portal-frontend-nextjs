"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateSessionCourse = () => revalidatePath("/dashboard/admin/academic/session-course");

export async function syncSessionCoursesAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/session-courses/sync",
            onSuccess: revalidateSessionCourse,
        },
        state,
        formData
    );
}

export async function deleteSessionCourseAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/session-courses/${id}`,
            onSuccess: revalidateSessionCourse,
        },
        state,
        formData
    );
}
