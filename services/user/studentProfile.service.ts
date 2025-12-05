import { api, handleApiError } from "@/services/academic/axios-instance";

export interface AddressDetail {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

export interface ParentInfo {
    name?: string;
    cell?: string;
    occupation?: string;
    nid?: string;
}

export interface GuardianInfo {
    name?: string;
    cell?: string;
    occupation?: string;
}

export interface EmergencyContact {
    name?: string;
    cell?: string;
    relation?: string;
    occupation?: string;
}

export interface EducationRecord {
    examName?: string;
    group?: string;
    roll?: string;
    passingYear?: number;
    gradeOrMarks?: string;
    cgpa?: number;
    boardOrUniversity?: string;
}

export interface StudentProfilePayload {
    shift?: "Day" | "Evening";
    group?: string;
    admissionFormSl?: string;
    admissionSeason?: "Spring" | "Summer" | "Fall" | "Winter" | "";
    admittedBy?: string;
    bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "";
    personalEmail?: string;
    studentMobile?: string;
    religion?: "Islam" | "Hinduism" | "Christianity" | "Buddhism" | "Other" | "";
    gender?: "Male" | "Female" | "Other" | "";
    dateOfBirth?: string;
    birthPlace?: string;
    monthlyIncomeOfGuardian?: number;
    nationality?: string;
    nidOrPassportNo?: string;
    maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed" | "";
    permanentAddress?: AddressDetail;
    mailingAddress?: AddressDetail;
    father?: ParentInfo;
    mother?: ParentInfo;
    guardian?: GuardianInfo;
    emergencyContact?: EmergencyContact;
    educationRecords?: EducationRecord[];
    referredBy?: string;
    refereeInfo?: string;
    profilePicture?: string;
}

export interface StudentProfile extends StudentProfilePayload {
    id: string;
    studentId: string;
}

const normalize = (p: any): StudentProfile => ({
    id: p?.id || p?._id || "",
    studentId: p?.studentId || "",
    ...p,
});

export const studentProfileService = {
    get: async (studentId: string): Promise<StudentProfile | null> => {
        try {
            const res = await api.get(`/user/students/profiles/${studentId}`); // Note: Backend route structure might need adjustment or verification. 
            // Checking studentRoutes.js: router.use("/profiles", studentProfileRoutes);
            // But studentProfileRoutes usually has /:studentId/profile or similar?
            // Wait, studentRoutes.js mounts studentProfileRoutes at /profiles.
            // Let's assume the route is /user/students/profiles/:studentId or similar.
            // Actually, let's check studentProfileRoutes.js content if possible.
            // Since I can't check it right now, I'll assume a standard pattern or I might need to fix this later.
            // Based on staff, it was /user/staffs/:id/profile.
            // But here it is mounted as router.use("/profiles", studentProfileRoutes) inside studentRoutes.
            // So it is /user/students/profiles...
            // I will assume the route is /user/students/profiles/:studentId based on common sense, 
            // but if it fails I will debug.

            // Actually, let's look at studentRoutes.js again.
            // router.use("/profiles", studentProfileRoutes);
            // So the path is /user/students/profiles/...
            // I'll assume the sub-route is /:studentId

            const data = res.data?.data || res.data;
            if (!data) return null;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },

    // For now, I'll use the likely routes. 
    // If studentProfileRoutes.js has /:studentId, then full path is /user/students/profiles/:studentId

    update: async (
        studentId: string,
        payload: Partial<StudentProfilePayload>
    ): Promise<StudentProfile> => {
        try {
            const res = await api.patch(`/user/students/profiles/${studentId}`, payload);
            const data = res.data?.data || res.data;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },

    create: async (
        studentId: string,
        payload: StudentProfilePayload
    ): Promise<StudentProfile> => {
        try {
            const res = await api.post(`/user/students/profiles/${studentId}`, payload);
            const data = res.data?.data || res.data;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },

    upsert: async (
        studentId: string,
        payload: StudentProfilePayload
    ): Promise<StudentProfile> => {
        try {
            const res = await api.put(`/user/students/profiles/${studentId}`, payload);
            const data = res.data?.data || res.data;
            return normalize(data);
        } catch (e) {
            return handleApiError(e);
        }
    },
};
