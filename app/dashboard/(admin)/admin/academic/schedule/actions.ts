"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";
import { courseScheduleSchema } from "@/lib/validations/academic";

const revalidateSchedule = () => {
    revalidatePath("/dashboard/admin/academic/schedule");
    revalidatePath("/dashboard/admin/academic/schedule/[id]", "page");
};

export async function createScheduleAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/schedules",
            schema: courseScheduleSchema,
            onSuccess: revalidateSchedule,
        },
        state,
        formData
    );
}

export async function updateScheduleAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/schedules/${id}`,
            schema: courseScheduleSchema,
            onSuccess: revalidateSchedule,
        },
        state,
        formData
    );
}

export async function deleteScheduleAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/schedules/${id}`,
            onSuccess: revalidateSchedule,
        },
        state,
        formData
    );
}
