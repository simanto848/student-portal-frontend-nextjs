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

export interface Address {
  street?: string;
  city?: string;
  country?: string;
}

export interface Guardian {
  name?: string;
  cell?: string;
  occupation?: string;
  relation?: string;
}

export interface Parent {
  name?: string;
  cell?: string;
}

export interface Profile {
  id: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  fatherName?: string;
  motherName?: string;
  studentMobile?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  nationality?: string;
  nidOrPassportNo?: string;
  religion?: string;
  permanentAddress?: Address;
  mailingAddress?: Address;
  father?: Parent;
  mother?: Parent;
  guardian?: Guardian;
  emergencyContact?: Guardian;
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
  isBlocked: boolean;
  blockReason?: string;
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
      fatherName: (s.profile as any).fatherName, // Keeping for backward compatibility if used
      motherName: (s.profile as any).motherName, // Keeping for backward compatibility if used
      studentMobile: (s.profile as any).studentMobile,
      dateOfBirth: (s.profile as any).dateOfBirth,
      gender: (s.profile as any).gender,
      bloodGroup: (s.profile as any).bloodGroup,
      nationality: (s.profile as any).nationality,
      nidOrPassportNo: (s.profile as any).nidOrPassportNo,
      religion: (s.profile as any).religion,
      permanentAddress: (s.profile as any).permanentAddress,
      mailingAddress: (s.profile as any).mailingAddress,
      father: (s.profile as any).father,
      mother: (s.profile as any).mother,
      guardian: (s.profile as any).guardian,
      emergencyContact: (s.profile as any).emergencyContact,
    }
    : undefined,
  isBlocked: !!s?.isBlocked,
  blockReason: s?.blockReason as string | undefined,
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
      // The backend /deleted endpoint seems to be returning active students or is broken.
      // Based on the UI label "Suspended", we will fetch students with enrollmentStatus="suspended".
      const res = await api.get("/user/students", { params: { enrollmentStatus: "suspended" } });
      const data = res.data?.data || res.data;
      const students = Array.isArray(data.students)
        ? data.students.map(normalize)
        : Array.isArray(data)
          ? data.map(normalize)
          : [];
      return students;
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
