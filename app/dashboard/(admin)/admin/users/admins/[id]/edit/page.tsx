import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminFormClient } from "../../fragments/AdminFormClient";
import { adminService } from "@/services/user/admin.service";
import { adminProfileService } from "@/services/user/adminProfile.service";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Modify Protocol | Guardian Calibration",
    description: "Recalibrate administrator authority and descriptive metadata.",
};

interface EditAdminPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditAdminPage({ params }: EditAdminPageProps) {
    const { id } = await params;

    try {
        const admin = await adminService.getById(id);

        if (!admin) {
            return notFound();
        }

        let profile = null;
        try {
            profile = await adminProfileService.get(id);
        } catch (error) {
            console.warn(`Profile fetching failure for admin ${id}:`, error);
        }

        return (
            <DashboardLayout>
                <AdminFormClient
                    admin={admin}
                    profile={profile}
                />
            </DashboardLayout>
        );
    } catch (error) {
        console.error(`Critical failure in EditAdminPage for ID ${id}:`, error);
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-4xl">
                        ⚠️
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 italic uppercase">SYNC BREACH</h1>
                        <p className="text-slate-500 font-bold mt-2">The administrative oracle is currently unresponsive. Protocol modification aborted.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }
}
