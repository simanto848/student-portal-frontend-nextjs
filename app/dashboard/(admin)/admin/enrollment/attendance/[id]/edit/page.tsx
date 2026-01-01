import { attendanceService } from "@/services/enrollment/attendance.service";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AttendanceEditClient } from "../../fragments/AttendanceEditClient";

export const metadata = {
    title: "Guardian Intelligence | Presence Calibration",
    description: "Refine and adjust student presence signatures for optimal analytical accuracy",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditAttendancePage({ params }: PageProps) {
    const { id } = await params;

    try {
        const attendance = await attendanceService.getAttendance(id);

        if (!attendance) {
            return (
                <DashboardLayout>
                    <div className="text-center p-20 grayscale opacity-40">
                        <p className="text-sm font-black uppercase tracking-widest text-slate-500">Attendance record not found</p>
                    </div>
                </DashboardLayout>
            );
        }

        return (
            <DashboardLayout>
                <AttendanceEditClient attendance={attendance} />
            </DashboardLayout>
        );
    } catch (error) {
        return (
            <DashboardLayout>
                <div className="text-center p-20 grayscale opacity-40">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-500">Failed to load record for calibration</p>
                </div>
            </DashboardLayout>
        );
    }
}
