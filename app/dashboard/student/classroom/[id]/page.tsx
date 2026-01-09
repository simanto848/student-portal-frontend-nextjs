"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ClassroomDetailsClient from "./fragments/ClassroomDetailsClient";

export default function StudentClassroomDetailPage() {
    return (
        <DashboardLayout>
            <ClassroomDetailsClient />
        </DashboardLayout>
    );
}
