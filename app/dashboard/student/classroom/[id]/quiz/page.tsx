"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHero } from "@/components/dashboard/shared/DashboardHero";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { Suspense } from "react";
import QuizListClient from "./fragments/QuizListClient";

export default function StudentQuizListPage() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<DashboardSkeleton />}>
                <QuizListClient />
            </Suspense>
        </div>
    );
}
