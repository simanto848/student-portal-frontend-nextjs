import { academicApi as api, handleApiError } from "@/services/academic/axios-instance";

export type EnrollmentStatus =
  | "not_enrolled"
  | "enrolled"
  | "graduated"
  | "dropped_out"
  | "suspended"
  | "on_leave"
  | "transferred_out"
  | "transferred_in";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  fatherName?: string;
  motherName?: string;
}

export interface Student {
  id: string;
  email: string;
  fullName: string;
  registrationNumber: string;
  departmentId: string;
  programId: string;
  batchId: string;
  sessionId: string;
  // populated fields
  department?: any;
  program?: any;
  batch?: any;
  session?: any;
  enrollmentStatus: EnrollmentStatus;
  currentSemester: number;
  admissionDate: string;
  expectedGraduationDate?: string;
  actualGraduationDate?: string;
  profile?: Profile;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCreatePayload {
  email: string;
  fullName: string;
  departmentId: string;
  programId: string;
  batchId: string;
  sessionId: string;
  admissionDate?: string;
  studentProfile?: any;
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

const normalize = (s: Record<string, unknown>): Student => ({
  id: (s?.id as string) || (s?._id as string) || "",
  email: (s?.email as string) || "",
  fullName: (s?.fullName as string) || "",
  registrationNumber: (s?.registrationNumber as string) || "",
  departmentId: (s?.departmentId as string) || "",
  programId: (s?.programId as string) || "",
  batchId: (s?.batchId as string) || "",
  sessionId: (s?.sessionId as string) || "",
  department: s?.department,
  program: s?.program,
  batch: s?.batch,
  session: s?.session,
  currentSemester: (s?.currentSemester as number) || 1,
  enrollmentStatus: (s?.enrollmentStatus as EnrollmentStatus) || "not_enrolled",
  admissionDate: (s?.admissionDate as string) || "",
  profile: s?.profile
    ? {
        id: (s.profile as any)._id || (s.profile as any).id,
        firstName: (s.profile as any).firstName,
        lastName: (s.profile as any).lastName,
        profilePicture: (s.profile as any).profilePicture,
        fatherName: (s.profile as any).fatherName,
        motherName: (s.profile as any).motherName,
      }
    : undefined,
  createdAt: s?.createdAt as string | undefined,
  updatedAt: s?.updatedAt as string | undefined,
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
    shift?: "day" | "evening";
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

  create: async (
    payload: StudentCreatePayload | FormData
  ): Promise<Student> => {
    try {
      const res = await api.post("/user/students", payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  update: async (
    id: string,
    payload: StudentUpdatePayload | FormData
  ): Promise<Student> => {
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
