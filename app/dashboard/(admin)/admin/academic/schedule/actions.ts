"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";
import { courseScheduleSchema } from "@/lib/validations/academic";

const revalidateSchedule = () => {
    revalidatePath("/dashboard/admin/academic/schedule");
    revalidatePath("/dashboard/admin/academic/schedule/[id]", "page");
};

const transformScheduleData = (formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());

    const data: any = {};
    Object.entries(rawData).forEach(([key, value]) => {
        let cleanKey = key;
        if (/^\d+_/.test(key)) {
            cleanKey = key.replace(/^\d+_/, '');
        } else if (key.includes('.')) {
            cleanKey = key.split('.').pop() || key;
        }
        data[cleanKey] = value;
    });

    return {
        ...data,
        startDate: data.startDate ? new Date(data.startDate as string).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate as string).toISOString() : undefined,
    };
};

export async function createScheduleAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/schedules",
            schema: courseScheduleSchema,
            transformData: transformScheduleData,
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
            transformData: transformScheduleData,
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
