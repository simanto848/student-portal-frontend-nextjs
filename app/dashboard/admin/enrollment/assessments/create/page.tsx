"use client";

import { AssessmentForm } from "@/components/enrollment/AssessmentForm";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function CreateAssessmentPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Create Assessment</h2>
                    <p className="text-muted-foreground">Add a new assessment, quiz, or exam for a course.</p>
                </div>
                <AssessmentForm />
            </div>
        </DashboardLayout>
    );
}
