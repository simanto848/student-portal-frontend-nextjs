"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { InstructorAssignmentForm } from "@/components/enrollment/InstructorAssignmentForm";
import { Button } from "@/components/ui/button";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditInstructorAssignmentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [assignment, setAssignment] = useState<BatchCourseInstructor | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchAssignment();
        }
    }, [id]);

    const fetchAssignment = async () => {
        try {
            const data = await batchCourseInstructorService.getAssignment(id);
            setAssignment(data);
        } catch (error) {
            toast.error("Failed to fetch assignment details");
            router.push("/dashboard/admin/enrollment/instructors");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!assignment) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Edit Assignment</h1>
                        <p className="text-muted-foreground">Update instructor assignment details</p>
                    </div>
                </div>

                <InstructorAssignmentForm initialData={assignment} isEditing={true} />
            </div>
        </DashboardLayout>
    );
}
