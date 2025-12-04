"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { InstructorAssignmentForm } from "@/components/enrollment/InstructorAssignmentForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateInstructorAssignmentPage() {
    const router = useRouter();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Assign Instructor</h1>
                        <p className="text-muted-foreground">Assign a teacher to a course batch</p>
                    </div>
                </div>

                <InstructorAssignmentForm />
            </div>
        </DashboardLayout>
    );
}
