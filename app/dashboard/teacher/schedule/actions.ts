"use server";

import { scheduleService } from "@/services/academic/schedule.service";
import { requireUser } from "@/lib/auth/userAuth";
import { CourseSchedule } from "@/services/academic/types";

export async function getTeacherSchedule(): Promise<CourseSchedule[]> {
    try {
        const user = await requireUser();
        if (!user || user.role !== 'teacher') {
            throw new Error("Unauthorized: Teacher access required");
        }

        const schedules = await scheduleService.getScheduleByTeacher(user.id);
        return schedules;
    } catch (error) {
        console.error("Error fetching teacher schedule:", error);
        throw error;
    }
}
