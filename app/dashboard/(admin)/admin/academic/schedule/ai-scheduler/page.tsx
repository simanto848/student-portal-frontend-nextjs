"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import AISchedulerClient from "../fragments/AISchedulerClient";

export default function AISchedulerPage() {
    return (
        <DashboardLayout>
            <AISchedulerClient />
        </DashboardLayout>
    );
}