"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { InstructorAssignmentForm } from "@/components/enrollment/InstructorAssignmentForm";
import { UserPlus } from "lucide-react";

export default function InstructorCreateClient() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Assign Faculty"
                subtitle="Allocate a teacher to a course batch for the current session"
                icon={UserPlus}
                onBack={() => router.back()}
            />

            <InstructorAssignmentForm />
        </div>
    );
}
