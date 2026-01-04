"use client";

import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { batchService } from "@/services/academic/batch.service";
import { courseService } from "@/services/academic/course.service";
import { studentService } from "@/services/user/student.service";
import { sessionService } from "@/services/academic/session.service";
import { teacherService } from "@/services/teacher.service";
import { EnrollmentManagementClient } from "./fragments/EnrollmentManagementClient";
import { Metadata } from "next";
import { requireUser } from "@/lib/auth/userAuth";

export const metadata: Metadata = {
    title: "Presence Lifecycle | Guardian Intelligence",
    description: "Manage student enrollments and academic presence across all streams.",
};

export default async function EnrollmentsPage() {
    // requireUser('/login');

    // Initial data fetching on server
    const data = await enrollmentService.listEnrollments({});
    const rawEnrollments = data.enrollments || [];

    // Fetch all unique IDs for enrichment
    const studentIds = [...new Set(rawEnrollments.map((e) => e.studentId))];
    const batchIds = [...new Set(rawEnrollments.map((e) => e.batchId))];
    const courseIds = [...new Set(rawEnrollments.map((e) => e.courseId))];
    const sessionIds = [...new Set(rawEnrollments.map((e) => e.sessionId))];
    const instructorIds = [...new Set(rawEnrollments.map((e) => e.instructorId).filter(Boolean) as string[])];

    // Parallel fetching
    const [
        studentsRes,
        batchesRes,
        coursesRes,
        sessionsRes,
        teachersRes,
        allCourses,
        allBatches,
        allStudents
    ] = await Promise.all([
        Promise.all(studentIds.map(id => studentService.getById(id).catch(() => null))),
        Promise.all(batchIds.map(id => batchService.getBatchById(id).catch(() => null))),
        Promise.all(courseIds.map(id => courseService.getCourseById(id).catch(() => null))),
        Promise.all(sessionIds.map(id => sessionService.getSessionById(id).catch(() => null))),
        Promise.all(instructorIds.map(id => teacherService.getTeacherById(id).catch(() => null))),
        courseService.getAllCourses().catch(() => []),
        batchService.getAllBatches().catch(() => []),
        studentService.getAll().then(res => res.students).catch(() => [])
    ]);

    // Create lookup maps
    const studentsMap = new Map(studentsRes.filter(Boolean).map((s: any) => [s.id, s]));
    const batchesMap = new Map(batchesRes.filter(Boolean).map((b: any) => [b.id, b]));
    const coursesMap = new Map(coursesRes.filter(Boolean).map((c: any) => [c.id, c]));
    const sessionsMap = new Map(sessionsRes.filter(Boolean).map((s: any) => [s.id, s]));
    const teachersMap = new Map(teachersRes.filter(Boolean).map((t: any) => [t.id, t]));

    // Enrich enrollments
    const enrichedEnrollments = rawEnrollments.map((enrollment) => ({
        ...enrollment,
        student: studentsMap.get(enrollment.studentId) || null,
        batch: batchesMap.get(enrollment.batchId) || null,
        course: coursesMap.get(enrollment.courseId) || null,
        session: sessionsMap.get(enrollment.sessionId) || null,
        instructor: enrollment.instructorId ? teachersMap.get(enrollment.instructorId) || null : null,
    }));

    return (
        <EnrollmentManagementClient
            initialEnrollments={enrichedEnrollments}
            courses={allCourses}
            batches={allBatches}
            students={allStudents}
        />
    );
}
