"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const revalidateClassroom = () => revalidatePath("/dashboard/admin/academic/classroom");

const classroomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required"),
    buildingName: z.string().min(1, "Building name is required"),
    floor: z.coerce.number().optional().nullable(),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    roomType: z.string().min(1, "Room type is required"),
    departmentId: z.string().optional().nullable().transform(v => v === "" ? null : v),
    facilities: z.string().optional().nullable().transform(v => v ? v.split(",").map(f => f.trim()) : []),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()),
    isUnderMaintenance: z.preprocess((val) => val === "true" || val === true, z.boolean()),
    maintenanceNotes: z.string().optional().nullable(),
});

export async function createClassroomAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/classrooms",
            schema: classroomSchema,
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
            schema: classroomSchema,
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
