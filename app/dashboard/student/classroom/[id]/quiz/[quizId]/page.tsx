"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { Suspense } from "react";
import QuizAttemptClient from "./fragments/QuizAttemptClient";

export default function TakeQuizPage() {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<DashboardSkeleton />}>
                <QuizAttemptClient />
            </Suspense>
        </div>
    );
}
