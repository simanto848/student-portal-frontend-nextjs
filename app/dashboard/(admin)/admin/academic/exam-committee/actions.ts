"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateExamCommittee = () => revalidatePath("/dashboard/admin/academic/exam-committee");

export async function addCommitteeMemberAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/exam-committees",
            onSuccess: revalidateExamCommittee,
        },
        state,
        formData
    );
}

export async function updateCommitteeMemberAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "patch",
            endpoint: `/academic/exam-committees/${id}`,
            onSuccess: revalidateExamCommittee,
        },
        state,
        formData
    );
}

export async function removeCommitteeMemberAction(id: string, state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "delete",
            endpoint: `/academic/exam-committees/${id}`,
            onSuccess: revalidateExamCommittee,
        },
        state,
        formData
    );
}
