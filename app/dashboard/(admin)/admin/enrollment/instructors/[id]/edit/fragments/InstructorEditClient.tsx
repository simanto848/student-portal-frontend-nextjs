"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { InstructorAssignmentForm } from "@/components/enrollment/InstructorAssignmentForm";
import { UserCog } from "lucide-react";

interface InstructorEditClientProps {
    id: string;
}

export default function InstructorEditClient({ id }: InstructorEditClientProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Assignment"
                subtitle="Update faculty allocation for this course batch"
                icon={UserCog}
                onBack={() => router.back()}
            />

            <InstructorAssignmentForm assignmentId={id} />
        </div>
    );
}
