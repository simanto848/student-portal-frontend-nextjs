import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminDetailClient } from "../fragments/AdminDetailClient";
import { adminService } from "@/services/user/admin.service";
import { adminProfileService } from "@/services/user/adminProfile.service";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Guardian Intelligence | Admin Details",
    description: "Deep dive into administrator authority and metrics",
};

interface AdminDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminDetailsPage({ params }: AdminDetailsPageProps) {
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
                <AdminDetailClient
                    admin={admin}
                    profile={profile}
                />
            </DashboardLayout>
        );
    } catch (error) {
        console.error(`Critical failure in AdminDetailsPage for ID ${id}:`, error);
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 italic uppercase">INTELLIGENCE BREACH</h1>
                        <p className="text-slate-500 font-bold mt-2">The requested administrative intelligence is currently encrypted or unreachable.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }
}
