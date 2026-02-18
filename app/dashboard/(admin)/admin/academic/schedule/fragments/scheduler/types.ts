import { Session, ScheduleProposal, Department, Batch, Classroom } from "@/services/academic/types";
import { ScheduleValidationResult } from "@/services/academic/schedule.service";

export type { Session, ScheduleProposal, Department, Batch, Classroom, ScheduleValidationResult };

export type SelectionMode = "all" | "department" | "multi_batch" | "single_batch";

export interface UnassignedCourse {
    batchId: string;
    batchName: string;
    courseId: string;
    courseCode: string;
    courseName: string;
    semester: number;
}

export interface ScheduleStatusSummary {
    active: number;
    closed: number;
    archived: number;
}

export interface UnscheduledCourse {
    courseCode: string;
    courseName: string;
    courseType: string;
    batchName: string;
    batchShift?: string;
    teacherName: string;
    reason: string;
}

/** Returns D-<name> for day shift, E-<name> for evening shift */
export const batchDisplayName = (name: string, shift?: string) =>
    `${shift === "evening" ? "E" : "D"}-${name}`;
