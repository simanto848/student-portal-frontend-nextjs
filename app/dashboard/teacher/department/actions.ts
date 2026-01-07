"use server";

import { revalidatePath } from "next/cache";
import {
    academicService,
    Batch,
    AcademicApiError,
} from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { courseGradeService } from "@/services/enrollment/courseGrade.service";
import { studentService } from "@/services/user/student.service";
import { requireUser } from "@/lib/auth/userAuth";
import { notifyError } from "@/components/toast";

export async function getDepartmentData(departmentId: string) {
    try {
        await requireUser();

        let workflows: any[] = [];
        try {
            workflows = await courseGradeService.getWorkflow({
                status: 'approved,published',
            });
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load data";
            notifyError(message);
        }

        let batches: any[] = [];
        try {
            const [batchesData, teachersResult] = await Promise.all([
                academicService.getAllBatches({ departmentId }),
                teacherService.getAll({ limit: 1000 })
            ]);

            const teachers = teachersResult.teachers || [];

            batches = batchesData.map((b: any) => {
                const counselorId = typeof b.counselorId === 'string' ? b.counselorId : b.counselorId?.id;
                const counselorName =
                    b.counselorId?.fullName ||
                    (typeof b.counselorId === "object" ? b.counselorId.fullName : undefined) ||
                    (
                        typeof counselorId === "string"
                            ? teachers.find((t) => t.id === counselorId)?.fullName
                            : undefined
                    );

                return {
                    ...b,
                    session: b.sessionId,
                    program: b.programId,
                    department: b.departmentId,
                    counselor: counselorName ? { fullName: counselorName } : null,
                };
            });
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load data";
            notifyError(message);
        }

        let students: any[] = [];
        try {
            const studentResult = await studentService.getAll({ departmentId, limit: 1000 });
            students = studentResult.students.map((student: any) => {
                const batch = batches.find((b: any) => b.id === student.batchId);
                return {
                    ...student,
                    batch: batch ? {
                        id: batch.id,
                        name: batch.name,
                        shift: batch.shift,
                        counselor: batch.counselor
                    } : null
                };
            });
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load data";
            notifyError(message);
        }

        return {
            success: true,
            data: {
                workflows: Array.isArray(workflows) ? workflows : [],
                batches: Array.isArray(batches) ? batches : [],
                students: Array.isArray(students) ? students : [],
            }
        };

    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Failed to fetch department data"
        };
    }
}

export async function publishResult(workflowId: string, otp: string) {
    try {
        await requireUser();
        await courseGradeService.publishResult(workflowId, otp);
        revalidatePath("/dashboard/teacher/department");
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Failed to publish result"
        };
    }
}

export async function returnResult(workflowId: string, reason: string, otp: string) {
    try {
        await requireUser();
        await courseGradeService.returnToTeacher(workflowId, { comment: reason, otp });
        revalidatePath("/dashboard/teacher/department");
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Failed to return result"
        };
    }
}
