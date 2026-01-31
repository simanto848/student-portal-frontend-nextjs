/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { attendanceService, Attendance, AttendanceStats } from "@/services/enrollment/attendance.service";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";

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

        const [attendanceResponse, enrollmentsResponse] = await Promise.all([
            attendanceService.listAttendance({ studentId }),
            enrollmentService.listEnrollments({ studentId })
        ]);

        const attendance = Array.isArray(attendanceResponse) ? attendanceResponse : (attendanceResponse?.attendance || []);
        let enrollments = Array.isArray(enrollmentsResponse) ? enrollmentsResponse : (enrollmentsResponse?.enrollments || []);
        if (enrollments.length === 0 && attendance.length > 0) {
            const uniqueCourseIds = [...new Set(attendance.map((a: any) => a.courseId).filter(Boolean))];
            const syntheticEnrollments: Enrollment[] = [];

            const sampleAttendanceForBatch = attendance[0];
            let currentSemester = 1;
            let sessionId = '';

            if (sampleAttendanceForBatch?.batchId) {
                try {
                    const batch = await batchService.getBatchById(sampleAttendanceForBatch.batchId);
                    if (batch) {
                        currentSemester = batch.currentSemester || 1;
                        sessionId = typeof batch.sessionId === 'object'
                            ? ((batch.sessionId as any).id || (batch.sessionId as any)._id || '')
                            : (batch.sessionId || '');
                    }
                } catch {}
            }

            for (const courseId of uniqueCourseIds) {
                try {
                    const course = await courseService.getCourseById(courseId);
                    const sampleAttendance = attendance.find((a: any) => a.courseId === courseId);
                    if (course && sampleAttendance) {
                        syntheticEnrollments.push({
                            id: `synthetic-${courseId}`,
                            studentId,
                            batchId: sampleAttendance.batchId || '',
                            courseId: courseId,
                            sessionId: sessionId,
                            semester: currentSemester,
                            status: 'active',
                            enrollmentDate: new Date().toISOString(),
                            course: course,
                        } as Enrollment);
                    }
                } catch {
                    const sampleAttendance = attendance.find((a: any) => a.courseId === courseId);
                    if (sampleAttendance) {
                        syntheticEnrollments.push({
                            id: `synthetic-${courseId}`,
                            studentId,
                            batchId: sampleAttendance.batchId || '',
                            courseId: courseId,
                            sessionId: sessionId,
                            semester: currentSemester,
                            status: 'active',
                            enrollmentDate: new Date().toISOString(),
                            course: {
                                id: courseId,
                                name: 'Course',
                                code: 'N/A',
                            },
                        } as Enrollment);
                    }
                }
            }

            enrollments = syntheticEnrollments;
        }

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
