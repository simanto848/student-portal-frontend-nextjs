"use server";

import { requireUser } from "@/lib/auth/userAuth";
import { academicApi } from "@/services/academic/axios-instance";
import { revalidatePath } from "next/cache";

export async function getExamCommitteeData() {
    const user = await requireUser();

    try {
        // 1. Identify the department this user is heading
        const departmentsRes = await academicApi.get("/academic/departments", {
            params: {
                departmentHeadId: user.id,
                limit: 1
            }
        });

        const departments = departmentsRes.data.data?.data || departmentsRes.data.data || [];
        const myDepartment = departments.length > 0 ? departments[0] : null;

        if (!myDepartment) {
            console.error(`Department Head not assigned to any department. User ID: ${user.id}`);
            return {
                members: [],
                teachers: [],
                departmentId: null
            };
        }

        const departmentId = myDepartment.id;

        // 2. Fetch data scoped to this department
        const [membersRes, teachersRes, batchesRes] = await Promise.all([
            academicApi.get("/academic/exam-committees", { params: { departmentId } }),
            academicApi.get("/user/teachers", { params: { departmentId, limit: 1000 } }),
            academicApi.get("/academic/batches", { params: { departmentId, limit: 1000 } })
        ]);

        console.log("DEBUG: Fetched Data for Dept:", departmentId);
        console.log("DEBUG: Members Count:", membersRes.data.data?.length);
        console.log("DEBUG: Teachers Response Status:", teachersRes.status);
        console.log("DEBUG: Teachers Data Length:", teachersRes.data.data?.teachers?.length || teachersRes.data.data?.length);

        let members = membersRes.data.data || [];
        // Manual filter if backend doesn't support filtering by departmentId yet
        if (Array.isArray(members)) {
            members = members.filter((m: any) => typeof m.departmentId === 'object' ? m.departmentId.id === departmentId : m.departmentId === departmentId);
        }

        let teachersDataRaw = teachersRes.data.data?.teachers || teachersRes.data.data || [];
        teachersDataRaw = Array.isArray(teachersDataRaw) ? teachersDataRaw : [];

        // Helper to normalize teacher object (_id -> id, profile -> first/last name)
        const normalizeTeacher = (t: any) => ({
            id: t.id || t._id,
            firstName: t.profile?.firstName || t.firstName || (t.fullName ? t.fullName.split(' ')[0] : "Unknown"),
            lastName: t.profile?.lastName || t.lastName || (t.fullName ? t.fullName.split(' ').slice(1).join(' ') : "Teacher"),
            email: t.email,
            departmentId: t.departmentId
        });

        let teachersData = teachersDataRaw.map(normalizeTeacher);

        const debugInfo = {
            resultCount: teachersData.length,
            rawCount: teachersDataRaw.length,
            status: teachersRes.status,
            deptIdUsed: departmentId
        };

        // Fallback: If no teachers found via filter, fetch all and manual filter
        if (teachersData.length === 0) {
            console.log("DEBUG: No teachers found with filter. Fetching all...");
            try {
                const allTeachersRes = await academicApi.get("/user/teachers", { params: { limit: 1000 } });
                const allTeachersRaw = allTeachersRes.data.data?.teachers || allTeachersRes.data.data || [];
                if (Array.isArray(allTeachersRaw)) {
                    // Check if manual filter works
                    const matched = allTeachersRaw.filter((t: any) => t.departmentId === departmentId);
                    console.log(`DEBUG: Manual Filter found ${matched.length} teachers out of ${allTeachersRaw.length}`);
                    if (matched.length > 0) {
                        teachersData = matched.map(normalizeTeacher);
                    }
                }
            } catch (err) {
                console.error("Fallback fetch failed", err);
            }
        }

        const batchesData = batchesRes.data.data?.data || batchesRes.data.data || [];

        return {
            members,
            teachers: teachersData,
            batches: Array.isArray(batchesData) ? batchesData : [],
            departmentId,
            debug: debugInfo
        };
    } catch (error) {
        console.error("Failed to fetch exam committee data:", error);
        return {
            members: [],
            teachers: [],
            departmentId: null
        };
    }
}

export async function addCommitteeMember(data: any) {
    await requireUser();
    try {
        await academicApi.post("/academic/exam-committees", data);
        revalidatePath("/dashboard/teacher/exam-committee");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Failed to add member" };
    }
}

export async function updateCommitteeMember(id: string, data: any) {
    await requireUser();
    try {
        await academicApi.patch(`/academic/exam-committees/${id}`, data);
        revalidatePath("/dashboard/teacher/exam-committee");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Failed to update member" };
    }
}

export async function removeCommitteeMember(id: string) {
    await requireUser();
    try {
        await academicApi.delete(`/academic/exam-committees/${id}`);
        revalidatePath("/dashboard/teacher/exam-committee");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Failed to remove member" };
    }
}

export async function getDeletedCommitteeMembers(departmentId: string) {
    await requireUser();
    try {
        const response = await academicApi.get("/academic/exam-committees/deleted", { params: { departmentId } });
        return { success: true, data: response.data.data || [] };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Failed to fetch deleted members" };
    }
}

export async function restoreCommitteeMember(id: string) {
    await requireUser();
    try {
        await academicApi.patch(`/academic/exam-committees/${id}/restore`);
        revalidatePath("/dashboard/teacher/exam-committee");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Failed to restore member" };
    }
}
