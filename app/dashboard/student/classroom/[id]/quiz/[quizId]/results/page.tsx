"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { Suspense } from "react";
import QuizResultsClient from "./fragments/QuizResultsClient";

export default function QuizResultsPage() {
    return (
        <DashboardLayout>
            <div className="min-h-screen">
                <Suspense fallback={<DashboardSkeleton />}>
                    <QuizResultsClient />
                </Suspense>
            </div>
        </DashboardLayout>
    );
}
