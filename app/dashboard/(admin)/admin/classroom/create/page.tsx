import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateWorkspaceClient } from "../fragments/CreateWorkspaceClient";
import { academicService } from "@/services/academic.service";

export const metadata = {
    title: "Forge Workspace | Admin Dashboard",
    description: "Initialize a new academic environment",
};

export default async function CreateWorkspacePage() {
    const [courses, batches, departments, programs, sessions] = await Promise.all([
        academicService.getAllCourses(),
        academicService.getAllBatches(),
        academicService.getAllDepartments(),
        academicService.getAllPrograms(),
        academicService.getAllSessions()
    ]);

    return (
        <DashboardLayout>
            <CreateWorkspaceClient
                courses={courses}
                batches={batches}
                departments={departments}
                programs={programs}
                sessions={sessions}
            />
        </DashboardLayout>
    );
}
