import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EditClassroomClient } from "../../fragments/EditClassroomClient";
import { workspaceService } from "@/services/classroom/workspace.service";
import { teacherService } from "@/services/teacher.service";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Edit Workspace | Admin Dashboard",
    description: "Reconfigure academic infrastructure parameters",
};

export default async function EditWorkspacePage({ params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const [workspace, teachers] = await Promise.all([
            workspaceService.getById(id),
            teacherService.getAllTeachers().catch(() => [])
        ]);

        if (!workspace) return notFound();

        return (
            <DashboardLayout>
                <EditClassroomClient
                    workspace={workspace}
                    teachers={teachers}
                />
            </DashboardLayout>
        );

    } catch (error) {
        console.error("Critical error in EditWorkspacePage:", error);
        return notFound();
    }
}
