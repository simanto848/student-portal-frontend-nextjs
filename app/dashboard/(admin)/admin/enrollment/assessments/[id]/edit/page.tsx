import { assessmentService } from "@/services/enrollment/assessment.service";
import { AssessmentForm } from "@/components/enrollment/AssessmentForm";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Guardian Intelligence | Assessment Calibration",
    description: "Refine and adjust assessment parameters for optimal evaluation",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditAssessmentPage({ params }: PageProps) {
    const { id } = await params;

    try {
        const assessment = await assessmentService.getById(id);

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
                <div className="space-y-10 pb-20">
                    <div className="flex items-center gap-6">
                        <Link
                            href={`/dashboard/admin/enrollment/assessments/${id}`}
                            className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Calibration</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Edit {assessment.title}</h1>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-2 overflow-hidden">
                            <AssessmentForm initialData={assessment} isEditing={true} />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    } catch (error) {
        return (
            <DashboardLayout>
                <div className="text-center p-20">
                    <p className="text-red-500 font-bold">Failed to load assessment for editing. Please try again later.</p>
                </div>
            </DashboardLayout>
        );
    }
}
