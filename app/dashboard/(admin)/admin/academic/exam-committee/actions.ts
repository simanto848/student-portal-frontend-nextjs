"use server";

import { createFormAction } from "@/lib/formAction";
import { revalidatePath } from "next/cache";

const revalidateExamCommittee = () => revalidatePath("/dashboard/admin/academic/exam-committee");

const transformExamCommitteeData = (formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());

    const data: any = {};
    Object.entries(rawData).forEach(([key, value]) => {
        let cleanKey = key;
        if (/^\d+_/.test(key)) {
            cleanKey = key.replace(/^\d+_/, '');
        } else if (key.includes('.')) {
            cleanKey = key.split('.').pop() || key;
        }
        data[cleanKey] = value;
    });

    return {
        ...data,
        status: data.status === "true" || data.status === true,
        batchId: data.batchId === "null" || data.batchId === "" ? null : data.batchId,
    };
};

export async function addCommitteeMemberAction(state: any, formData: FormData) {
    return await createFormAction(
        {
            method: "post",
            endpoint: "/academic/exam-committees",
            transformData: transformExamCommitteeData,
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
            transformData: transformExamCommitteeData,
            onSuccess: revalidateExamCommittee,
        },
        state,
        formData
    );
}