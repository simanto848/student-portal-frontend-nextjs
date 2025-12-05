import { api, handleApiError } from "../academic/axios-instance";

export interface CourseGrade {
    id: string;
    studentId: string;
    enrollmentId: string;
    courseId: string;
    batchId: string;
    semester: number;
    totalMarksObtained: number;
    totalMarks: number;
    grade?: string;
    gradePoint?: number;
    remarks?: string;
    status: 'pending' | 'calculated' | 'finalized' | 'published';
    workflowStatus?: 'draft' | 'submitted' | 'approved' | 'returned' | 'return_requested' | 'return_approved';
    isPublished: boolean;
    student?: any;
    course?: any;
    batch?: any;
    enrollment?: any;
}

export interface GradeStats {
    average: number;
    highest: number;
    lowest: number;
    gradeDistribution: Record<string, number>;
}

export const courseGradeService = {
    // Grade Operations
    calculate: async (data: Partial<CourseGrade>): Promise<CourseGrade> => {
        try {
            const response = await api.post('/enrollment/grades', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    autoCalculate: async (enrollmentId: string): Promise<CourseGrade> => {
        try {
            const response = await api.post(`/enrollment/grades/auto-calculate/${enrollmentId}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    update: async (id: string, data: Partial<CourseGrade>): Promise<CourseGrade> => {
        try {
            const response = await api.put(`/enrollment/grades/${id}`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    publish: async (id: string): Promise<CourseGrade> => {
        try {
            const response = await api.post(`/enrollment/grades/${id}/publish`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    unpublish: async (id: string): Promise<CourseGrade> => {
        try {
            const response = await api.post(`/enrollment/grades/${id}/unpublish`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/enrollment/grades/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },

    list: async (params?: any): Promise<{ grades: CourseGrade[], pagination: any }> => {
        try {
            const response = await api.get('/enrollment/grades', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getById: async (id: string): Promise<CourseGrade> => {
        try {
            const response = await api.get(`/enrollment/grades/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getStudentSemesterGrades: async (studentId: string, semester: string): Promise<CourseGrade[]> => {
        try {
            const response = await api.get(`/enrollment/grades/student/${studentId}/semester/${semester}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    calculateSemesterGPA: async (studentId: string, semester: string): Promise<{ gpa: number }> => {
        try {
            const response = await api.get(`/enrollment/grades/student/${studentId}/semester/${semester}/gpa`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    calculateCGPA: async (studentId: string): Promise<{ cgpa: number }> => {
        try {
            const response = await api.get(`/enrollment/grades/student/${studentId}/cgpa`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getStats: async (): Promise<GradeStats> => {
        try {
            const response = await api.get('/enrollment/grades/stats/course');
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // Workflow Operations
    submitToCommittee: async (id: string): Promise<any> => {
        try {
            const response = await api.post('/enrollment/grades/workflow/submit', { gradeId: id });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    approveByCommittee: async (id: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/approve`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    returnToTeacher: async (id: string, message: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/return`, { message });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    requestReturn: async (id: string, reason: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/request-return`, { reason });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    approveReturnRequest: async (id: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/approve-return`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};
