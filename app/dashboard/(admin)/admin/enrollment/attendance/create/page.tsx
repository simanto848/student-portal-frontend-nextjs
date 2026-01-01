import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AttendanceCreateClient } from "../fragments/AttendanceCreateClient";

export const metadata = {
    title: "Guardian Intelligence | Presence Capture",
    description: "Synchronize and record student presence signatures for analytical modeling",
};

export default async function CreateAttendancePage() {
    try {
        const [courses, batches] = await Promise.all([
            courseService.getAllCourses(),
            batchService.getAllBatches()
        ]);

        return (
            <DashboardLayout>
                <AttendanceCreateClient
                    courses={courses || []}
                    batches={batches || []}
                />
            </DashboardLayout>
        );
    } catch (error) {
        return (
            <DashboardLayout>
                <div className="text-center p-20 grayscale opacity-40">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-500">Failed to initialize capture environment</p>
                </div>
            </DashboardLayout>
        );
    }
}
