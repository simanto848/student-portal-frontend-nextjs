"use server";

import { createFormAction } from "@/lib/formAction";
import { assessmentSchema } from "@/lib/validations/academic";
import { revalidatePath } from "next/cache";
import { assessmentService } from "@/services/enrollment/assessment.service";

const revalidateAssessments = (id?: string) => {
    revalidatePath("/dashboard/admin/enrollment/assessments");
    if (id) {
        revalidatePath(`/dashboard/admin/enrollment/assessments/${id}`);
    }
};

const transformAssessmentData = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    return {
        ...data,
        totalMarks: data.totalMarks ? Number(data.totalMarks) : undefined,
        passingMarks: data.passingMarks ? Number(data.passingMarks) : undefined,
        weightPercentage: data.weightPercentage ? Number(data.weightPercentage) : undefined,
    };
};

export async function createAssessmentAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/enrollment/assessments",
            schema: assessmentSchema,
            transformData: transformAssessmentData,
            onSuccess: () => revalidateAssessments(),
        },
        state,
        formData
    );
}

export async function updateAssessmentAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "put",
            endpoint: `/enrollment/assessments/${id}`,
            schema: assessmentSchema,
            transformData: transformAssessmentData,
            onSuccess: () => revalidateAssessments(id),
        },
        state,
        formData
    );
}

export async function deleteAssessmentAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/enrollment/assessments/${id}`,
            onSuccess: () => revalidateAssessments(),
        },
        state,
        formData
    );
}

export async function publishAssessmentAction(id: string) {
    try {
        await assessmentService.publish(id);
        revalidateAssessments(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to publish assessment" };
    }
}

export async function closeAssessmentAction(id: string) {
    try {
        await assessmentService.close(id);
        revalidateAssessments(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to close assessment" };
    }
}

export async function markGradedAction(id: string) {
    try {
        await assessmentService.markGraded(id);
        revalidateAssessments(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to mark as graded" };
    }
}

export async function gradeSubmissionAction(id: string, assessmentId: string, data: { obtainedMarks: number; feedback?: string }) {
    try {
        await assessmentService.gradeSubmission(id, data);
        revalidateAssessments(assessmentId);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to grade submission" };
    }
}
