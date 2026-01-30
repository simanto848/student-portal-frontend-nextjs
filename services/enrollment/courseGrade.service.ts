import { academicApi as api, handleApiError } from "../academic/axios-instance";

export interface MarksBreakdown {
    final: {
        obtained: number;
        total: number;
    };
    inCourse: {
        obtained: number;
        total: number;
    };
    totalObtained: number;
    totalMarks: number;
}

export interface CourseGrade {
    id: string;
    _id?: string;
    studentId: string;
    enrollmentId: string;
    courseId: string;
    batchId: string;
    semester: number;
    totalMarksObtained: number;
    totalMarks: number;
    percentage?: number;
    grade?: string;
    letterGrade?: string;
    gradePoint?: number;
    remarks?: string;
    status: 'pending' | 'calculated' | 'finalized' | 'published';
    workflowStatus?: 'draft' | 'submitted' | 'approved' | 'returned' | 'return_requested' | 'return_approved';
    isPublished: boolean;
    marksBreakdown?: MarksBreakdown;
    student?: {
        fullName?: string;
        registrationNumber?: string;
    };
    course?: {
        id?: string;
        _id?: string;
        name?: string;
        code?: string;
        credit?: number;
        creditHour?: number;
        type?: string;
    };
    batch?: any;
    enrollment?: any;
}

export interface GradeStats {
    average: number;
    highest: number;
    lowest: number;
    gradeDistribution: Record<string, number>;
}

export interface ResultWorkflow {
    id: string;
    _id?: string;
    gradeId?: string;
    status: string;
    actionBy?: string;
    actionAt?: string;
    comments?: string;
    grade?: CourseGrade | any;
    batchId: string;
    courseId: string;
    semester: number;
    updatedAt: string;
    instructorId?: string;
    approvals?: any[];
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

    listWithMarksBreakdown: async (params?: any): Promise<{ grades: CourseGrade[], pagination: any }> => {
        try {
            const response = await api.get('/enrollment/grades', {
                params: { ...params, includeMarksBreakdown: 'true' }
            });
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
    getWorkflow: async (params?: any): Promise<ResultWorkflow[]> => {
        try {
            const response = await api.get('/enrollment/result-workflow', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getWorkflowById: async (id: string): Promise<ResultWorkflow> => {
        try {
            const response = await api.get(`/enrollment/committee-results/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    submitToCommittee: async (data: string | { courseId: string; batchId: string; semester: number }): Promise<any> => {
        try {
            const payload = typeof data === 'string'
                ? { gradeId: data }
                : data;
            const response = await api.post('/enrollment/result-workflow/submit', payload);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    approveByCommittee: async (id: string, data: { comment?: string, otp: string } | any = {}): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/result-workflow/${id}/approve`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    returnToTeacher: async (id: string, data: { comment: string, otp: string } | any): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/result-workflow/${id}/return-to-teacher`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    requestReturn: async (id: string, reason: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/result-workflow/${id}/request-return`, { reason });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    approveReturnRequest: async (id: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/result-workflow/${id}/approve-return`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    publishResult: async (id: string, otp: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/result-workflow/${id}/publish`, { otp });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // Bulk publish all approved results for a batch and semester
    bulkPublishResults: async (data: { batchId: string; semester: number; otp: string }): Promise<any> => {
        try {
            const response = await api.post('/enrollment/result-workflow/bulk-publish', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // Get summary of approved workflows for bulk publishing
    getApprovedSummary: async (): Promise<any> => {
        try {
            const response = await api.get('/enrollment/result-workflow/approved-summary');
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // New Methods for Course Final Marks Entry
    getMarkConfig: async (courseId: string): Promise<any> => {
        try {
            const response = await api.get(`/enrollment/grades/mark-config/${courseId}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    bulkSaveMarks: async (data: {
        courseId: string;
        batchId: string;
        semester: number;
        entries: any[];
    }): Promise<any> => {
        try {
            const response = await api.post('/enrollment/grades/bulk-entry', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};
