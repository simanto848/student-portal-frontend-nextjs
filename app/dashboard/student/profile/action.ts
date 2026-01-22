"use server";

import { studentService } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";

export async function getStudentProfileAction(studentId: string) {
    try {
        const student = await studentService.getById(studentId);

        const [deptData, progData, batchData, sessData] = await Promise.all([
            student.departmentId
                ? departmentService.getDepartmentById(student.departmentId).catch(() => null)
                : Promise.resolve(null),
            student.programId
                ? programService.getProgramById(student.programId).catch(() => null)
                : Promise.resolve(null),
            student.batchId
                ? batchService.getBatchById(student.batchId).catch(() => null)
                : Promise.resolve(null),
            student.sessionId
                ? sessionService.getSessionById(student.sessionId).catch(() => null)
                : Promise.resolve(null),
        ]);

        return {
            student,
            department: deptData,
            program: progData,
            batch: batchData,
            session: sessData
        };
    } catch (error) {
        console.error("Error fetching student profile:", error);
        throw new Error("Failed to fetch student profile data");
    }
}
