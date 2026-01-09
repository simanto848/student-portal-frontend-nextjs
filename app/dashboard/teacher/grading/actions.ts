"use server";

import { requireUser } from "@/lib/auth/userAuth";
import { courseGradeService } from "@/services/enrollment/courseGrade.service";

export async function getGradingWorkflows() {
    await requireUser();
    try {
        const workflows = await courseGradeService.getWorkflow();
        return workflows || [];
    } catch (error) {
        console.error("Failed to fetch grading workflows:", error);
        return [];
    }
}
