import { assessmentService } from "@/services/enrollment/assessment.service";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AssessmentDetailClient } from "../fragments/AssessmentDetailClient";

export const metadata = {
    title: "Guardian Intelligence | Assessment Evaluation",
    description: "In-depth analysis and grading of academic assessments",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AssessmentDetailsPage({ params }: PageProps) {
    const { id } = await params;

    try {
        const [assessment, submissions] = await Promise.all([
            assessmentService.getById(id),
            assessmentService.getAssessmentSubmissions(id)
        ]);

        if (!assessment) {
            return (
                <DashboardLayout>
                    <div className="text-center p-20 grayscale opacity-40">
                        <p className="text-sm font-black uppercase tracking-widest text-slate-500">Assessment intelligence not found</p>
                    </div>
                </DashboardLayout>
            );
        }

        return (
            <DashboardLayout>
                <AssessmentDetailClient
                    assessment={assessment}
                    submissions={submissions || []}
                />
            </DashboardLayout>
        );
    } catch (error) {
        return (
            <DashboardLayout>
                <div className="text-center p-20">
                    <p className="text-red-500 font-bold">Failed to load assessment data. Please try again later.</p>
                </div>
            </DashboardLayout>
        );
    }
}
