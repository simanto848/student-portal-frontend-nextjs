import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { batchService } from "@/services/academic/batch.service";
import { courseService } from "@/services/academic/course.service";
import { studentService } from "@/services/user/student.service";
import { EnrollmentManagementClient } from "./fragments/EnrollmentManagementClient";
import { Metadata } from "next";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata: Metadata = {
    title: "Presence Lifecycle | Guardian Intelligence",
    description: "Manage student enrollments and academic presence across all streams.",
};

export default async function EnrollmentsPage() {
    await requireUser('/login', [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const [enrollmentData, allCourses, allBatches, allStudentsRes] = await Promise.all([
        enrollmentService.listEnrollments({}).catch(() => ({ enrollments: [] })),
        courseService.getAllCourses().catch(() => []),
        batchService.getAllBatches().catch(() => []),
        studentService.getAll().catch(() => ({ students: [] }))
    ]);

    const enrichedEnrollments = enrollmentData.enrollments || [];
    const allStudents = allStudentsRes.students || [];

    return (
        <EnrollmentManagementClient
            initialEnrollments={enrichedEnrollments}
            courses={allCourses}
            batches={allBatches}
            students={allStudents}
        />
    );
}
