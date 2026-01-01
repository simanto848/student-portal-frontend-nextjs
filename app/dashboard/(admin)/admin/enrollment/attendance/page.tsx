import { attendanceService } from "@/services/enrollment/attendance.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AttendanceManagementClient } from "./fragments/AttendanceManagementClient";

export const metadata = {
    title: "Guardian Intelligence | Presence Analysis",
    description: "In-depth tracking and analysis of student attendance signatures",
};

export default async function AttendancePage() {
    try {
        const [attendanceData, courses, batches] = await Promise.all([
            attendanceService.listAttendance(),
            courseService.getAllCourses(),
            batchService.getAllBatches()
        ]);

        const attendance = Array.isArray(attendanceData)
            ? attendanceData
            : (attendanceData as any).attendance || [];

        return (
            <DashboardLayout>
                <AttendanceManagementClient
                    initialAttendance={attendance}
                    courses={courses || []}
                    batches={batches || []}
                />
            </DashboardLayout>
        );
    } catch (error) {
        return (
            <DashboardLayout>
                <div className="text-center p-20 grayscale opacity-40">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-500">Failed to load presence data</p>
                </div>
            </DashboardLayout>
        );
    }
}
