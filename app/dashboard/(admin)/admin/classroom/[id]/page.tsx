import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClassroomDetailClient } from "../fragments/ClassroomDetailClient";
import { workspaceService } from "@/services/classroom/workspace.service";
import { streamService } from "@/services/classroom/stream.service";
import { assignmentService } from "@/services/classroom/assignment.service";
import { materialService } from "@/services/classroom/material.service";
import { academicService } from "@/services/academic.service";
import { teacherService } from "@/services/teacher.service";
import { studentService } from "@/services/user/student.service";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Classroom Detail | Admin Dashboard",
    description: "Orchestrate academic delivery at the workspace level",
};

export default async function WorkspaceDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const [workspace, assignmentsSettled, materialsSettled, streamSettled] = await Promise.all([
            workspaceService.getById(id),
            assignmentService.listByWorkspace(id),
            materialService.listByWorkspace(id),
            streamService.listByWorkspace(id)
        ]);

        if (!workspace) return notFound();

        const assignments = Array.isArray(assignmentsSettled) ? assignmentsSettled : [];
        const materials = Array.isArray(materialsSettled) ? materialsSettled : [];
        const stream = Array.isArray(streamSettled) ? streamSettled : [];

        // Parallel fetching for orchestration data
        const [course, batch, allTeachers, allStudentsRes] = await Promise.all([
            academicService.getCourseById(workspace.courseId).catch(() => null),
            academicService.getBatchById(workspace.batchId).catch(() => null),
            teacherService.getAllTeachers().catch(() => []),
            studentService.getAll({ limit: 1000 }).catch(() => ({ students: [] }))
        ]);

        const teachers = (allTeachers || []).filter((t: any) => workspace.teacherIds?.includes(t.id));
        const students = (allStudentsRes?.students || []).filter((s: any) => workspace.studentIds?.includes(s.id));

        return (
            <DashboardLayout>
                <ClassroomDetailClient
                    workspace={workspace}
                    course={course}
                    batch={batch}
                    teachers={teachers}
                    students={students}
                    assignments={assignments}
                    materials={materials}
                    stream={stream}
                />
            </DashboardLayout>
        );

    } catch (error) {
        console.error("Critical error in WorkspaceDetailsPage:", error);
        return notFound();
    }
}
