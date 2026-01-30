/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { attendanceService, Attendance, AttendanceStats } from "@/services/enrollment/attendance.service";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";

// Types for action responses
export interface AttendanceActionResponse {
    success: boolean;
    data?: Attendance[];
    error?: string;
}

export interface EnrollmentsActionResponse {
    success: boolean;
    data?: Enrollment[];
    error?: string;
}

export interface AttendanceStatsActionResponse {
    success: boolean;
    data?: AttendanceStats;
    error?: string;
}

/**
 * Fetch attendance records for a specific student
 */
export async function getStudentAttendance(studentId: string): Promise<AttendanceActionResponse> {
    try {
        if (!studentId) {
            return { success: false, error: "Student ID is required" };
        }

        const response = await attendanceService.listAttendance({ studentId });
        const attendance = Array.isArray(response) ? response : (response?.attendance || []);

        return { success: true, data: attendance };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Failed to fetch attendance data"
        };
    }
}

/**
 * Fetch enrollments for a specific student
 */
export async function getStudentEnrollments(studentId: string): Promise<EnrollmentsActionResponse> {
    try {
        if (!studentId) {
            return { success: false, error: "Student ID is required" };
        }

        const response = await enrollmentService.listEnrollments({ studentId });
        const enrollments = Array.isArray(response) ? response : (response?.enrollments || []);

        return { success: true, data: enrollments };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Failed to fetch enrollment data"
        };
    }
}

/**
 * Fetch attendance statistics for a student in a specific course
 */
export async function getAttendanceStats(
    studentId: string,
    courseId: string
): Promise<AttendanceStatsActionResponse> {
    try {
        if (!studentId || !courseId) {
            return { success: false, error: "Student ID and Course ID are required" };
        }

        const stats = await attendanceService.getStudentStats(studentId, courseId);
        return { success: true, data: stats };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Failed to fetch attendance statistics"
        };
    }
}

/**
 * Fetch all attendance and enrollment data for a student
 * Combined action for efficiency
 */
export async function getStudentAttendanceData(studentId: string): Promise<{
    success: boolean;
    attendance?: Attendance[];
    enrollments?: Enrollment[];
    error?: string;
}> {
    try {
        if (!studentId) {
            return { success: false, error: "Student ID is required" };
        }

        // Fetch both in parallel
        const [attendanceResponse, enrollmentsResponse] = await Promise.all([
            attendanceService.listAttendance({ studentId }),
            enrollmentService.listEnrollments({ studentId })
        ]);

        const attendance = Array.isArray(attendanceResponse) ? attendanceResponse : (attendanceResponse?.attendance || []);
        const enrollments = Array.isArray(enrollmentsResponse) ? enrollmentsResponse : (enrollmentsResponse?.enrollments || []);

        return {
            success: true,
            attendance,
            enrollments
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Failed to fetch attendance data"
        };
    }
}
