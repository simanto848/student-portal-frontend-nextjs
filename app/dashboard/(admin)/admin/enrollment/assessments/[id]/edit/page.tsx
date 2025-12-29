"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AssessmentForm } from "@/components/enrollment/AssessmentForm";
import { assessmentService, Assessment } from "@/services/enrollment/assessment.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function EditAssessmentPage() {
    const params = useParams();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchAssessment(params.id as string);
        }
    }, [params.id]);

    const fetchAssessment = async (id: string) => {
        try {
            const data = await assessmentService.getById(id);
            setAssessment(data);
        } catch (error) {
            toast.error("Failed to load assessment details");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>
            </DashboardLayout>
        );
    }

    if (!assessment) {
        return (
            <DashboardLayout>
                <div className="text-center p-8 text-muted-foreground">Assessment not found</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Edit Assessment</h2>
                    <p className="text-muted-foreground">Modify assessment details.</p>
                </div>
                <AssessmentForm initialData={assessment} isEditing={true} />
            </div>
        </DashboardLayout>
    );
}
