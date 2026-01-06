"use client";

import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/shared";
import { AttendanceContent } from "./fragments/AttendanceContent";

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton layout="hero-table" rowCount={8} withLayout={false} />}>
        <AttendanceContent />
      </Suspense>
    </DashboardLayout>
  );
}
