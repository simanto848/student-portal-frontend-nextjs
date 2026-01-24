"use client";

import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared";
import { AttendanceContent } from "./fragments/AttendanceContent";

export default function AttendancePage() {
  return (
    <Suspense fallback={<DashboardSkeleton layout="hero-table" rowCount={8} withLayout={false} />}>
      <AttendanceContent />
    </Suspense>
  );
}
