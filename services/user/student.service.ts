import { api, handleApiError } from "@/services/academic/axios-instance";

export type EnrollmentStatus =
    | "not_enrolled"
    | "enrolled"
    | "graduated"
    | "dropped_out"
    | "suspended"
    | "on_leave"
    | "transferred_out"
    | "transferred_in";

export interface Student {
    id: string;
    email: string;
    fullName: string;
    registrationNumber: string;
    departmentId: string;
    programId: string;
    batchId: string;
    sessionId: string;
    enrollmentStatus: EnrollmentStatus;
    currentSemester: number;
    admissionDate: string;
    expectedGraduationDate?: string;
    actualGraduationDate?: string;
    profile?: any; // We'll define StudentProfile in its own service
    lastLoginAt?: string;
    lastLoginIp?: string;
    createdAt?: string;
    updatedAt?: string;

    // Populated fields (optional)
    department?: any;
    program?: any;
    batch?: any;
    session?: any;
}

export interface StudentCreatePayload {
    email: string;
    fullName: string;
    departmentId: string;
    programId: string;
    batchId: string;
    sessionId: string;
    admissionDate?: string;
    studentProfile?: any; // Initial profile data
}

export interface StudentUpdatePayload {
    fullName?: string;
    departmentId?: string;
    programId?: string;
    batchId?: string;
    sessionId?: string;
    enrollmentStatus?: EnrollmentStatus;
    currentSemester?: number;
    admissionDate?: string;
    expectedGraduationDate?: string;
    actualGraduationDate?: string;
    profile?: any;
}

const normalize = (s: any): Student => ({
    id: s?.id || s?._id || "",
    email: s?.email || "",
    fullName: s?.fullName || "",
    registrationNumber: s?.registrationNumber || "",
    departmentId: s?.departmentId || "",
    programId: s?.programId || "",
    batchId: s?.batchId || "",
    sessionId: s?.sessionId || "",
    enrollmentStatus: s?.enrollmentStatus || "not_enrolled",
    currentSemester: s?.currentSemester || 1,
    admissionDate: s?.admissionDate || "",
    expectedGraduationDate: s?.expectedGraduationDate,
    actualGraduationDate: s?.actualGraduationDate,
    profile: s?.profile,
    lastLoginAt: s?.lastLoginAt,
    lastLoginIp: s?.lastLoginIp,
    createdAt: s?.createdAt,
    updatedAt: s?.updatedAt,
    department: s?.department,
    program: s?.program,
    batch: s?.batch,
    session: s?.session,
});

export const studentService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        departmentId?: string;
        programId?: string;
        batchId?: string;
        sessionId?: string;
        enrollmentStatus?: string;
    }): Promise<{
        students: Student[];
        pagination?: { page: number; limit: number; total: number };
    }> => {
        try {
            const res = await api.get("/user/students", { params });
            const data = res.data?.data || res.data;
            const students = Array.isArray(data.students)
                ? data.students.map(normalize)
                : Array.isArray(data)
                    ? data.map(normalize)
                    : [];
            return { students, pagination: data.pagination };
        } catch (e) {
            return handleApiError(e);
        }
    },

    getById: async (id: string): Promise<Student> => {
        try {
            const res = await api.get(`/user/students/${id}`);
            const data = res.data?.data || res.data;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },

    create: async (payload: StudentCreatePayload): Promise<Student> => {
        try {
            const res = await api.post("/user/students", payload);
            const data = res.data?.data || res.data;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },

    update: async (id: string, payload: StudentUpdatePayload): Promise<Student> => {
        try {
            const res = await api.patch(`/user/students/${id}`, payload);
            const data = res.data?.data || res.data;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },

    delete: async (id: string): Promise<{ message: string }> => {
        try {
            const res = await api.delete(`/user/students/${id}`);
            return res.data?.data || res.data;
        } catch (e) {
            return handleApiError(e);
        }
    },

    restore: async (id: string): Promise<Student> => {
        try {
            const res = await api.post(`/user/students/${id}/restore`);
            const data = res.data?.data || res.data;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },

    getDeleted: async (): Promise<Student[]> => {
        try {
            const res = await api.get("/user/students/deleted");
            const data = res.data?.data || res.data;
            return Array.isArray(data)
                ? data.map(normalize)
                : Array.isArray(data.students)
                    ? data.students.map(normalize)
                    : [];
        } catch (e) {
            return handleApiError(e);
        }
    },

    deletePermanently: async (id: string): Promise<{ message: string }> => {
        try {
            const res = await api.delete(`/user/students/${id}/permanently`);
            return res.data?.data || res.data;
        } catch (e) {
            return handleApiError(e);
        }
    },
};
