import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClassroomManagementClient } from "./fragments/ClassroomManagementClient";
import { workspaceService } from "@/services/classroom/workspace.service";
import { academicService } from "@/services/academic.service";

export const metadata = {
    title: "Classroom Workspaces | Admin Dashboard",
    description: "Orchestrate academic delivery across all departments",
};

export default async function AdminClassroomPage() {
    let enrichedWorkspaces: any[] = [];

    try {
        // Parallel fetching with error resilience
        const [workspacesData, coursesData, batchesData, departmentsData] = await Promise.allSettled([
            workspaceService.listMine(),
            academicService.getAllCourses(),
            academicService.getAllBatches(),
            academicService.getAllDepartments()
        ]);

        const rawWorkspaces = workspacesData.status === 'fulfilled' ? workspacesData.value : [];
        const courses = coursesData.status === 'fulfilled' ? coursesData.value : [];
        const batches = batchesData.status === 'fulfilled' ? batchesData.value : [];
        const departments = departmentsData.status === 'fulfilled' ? departmentsData.value : [];

        const workspaces = Array.from(new Map(rawWorkspaces.map(ws => [ws.id, ws])).values());

        enrichedWorkspaces = (workspaces || []).map(ws => {
            const course = courses.find((c: any) => c.id === ws.courseId);
            const batch = batches.find((b: any) => b.id === ws.batchId);
            const department = departments.find((d: any) => d.id === ws.departmentId);

            return {
                ...ws,
                courseName: course?.name || "Unknown Course",
                courseCode: course?.code || "N/A",
                batchName: batch?.name || "Unknown Batch",
                departmentName: department?.name || "Unknown Department",
                departmentId: typeof department === 'object' ? department?.id : department
            };
        });
    } catch (error) {
        console.error("Critical error in AdminClassroomPage:", error);
    }

    return (
        <DashboardLayout>
            <ClassroomManagementClient initialWorkspaces={enrichedWorkspaces as any} />
        </DashboardLayout>
    );
}
