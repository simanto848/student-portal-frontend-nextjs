import { api, handleApiError } from "../academic/axios-instance";

export interface CourseGrade {
    id: string;
    studentId: string;
    courseId: string;
    batchId: string;
    semester: number;
    academicYear: string;
    totalMarks: number;
    grade: string;
    gradePoint: number;
    status: 'draft' | 'submitted' | 'approved' | 'published' | 'returned';
    remarks?: string;
    calculatedAt: string;
    student?: any;
    course?: any;
    batch?: any;
}

export interface ResultWorkflow {
    id: string;
    gradeId: string;
    status: 'pending' | 'approved' | 'rejected' | 'returned';
    comments?: string;
    actionBy: string;
    actionAt: string;
    actionRole: string;
}

export const courseGradeService = {
    calculateGrade: async (data: { studentId: string, courseId: string, batchId: string }): Promise<CourseGrade> => {
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

    updateGrade: async (id: string, data: Partial<CourseGrade>): Promise<CourseGrade> => {
        try {
            const response = await api.put(`/enrollment/grades/${id}`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    publishGrade: async (id: string): Promise<CourseGrade> => {
        try {
            const response = await api.post(`/enrollment/grades/${id}/publish`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    unpublishGrade: async (id: string): Promise<CourseGrade> => {
        try {
            const response = await api.post(`/enrollment/grades/${id}/unpublish`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    listGrades: async (params?: any): Promise<{ grades: CourseGrade[], pagination: any }> => {
        try {
            const response = await api.get('/enrollment/grades', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getGrade: async (id: string): Promise<CourseGrade> => {
        try {
            const response = await api.get(`/enrollment/grades/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getStudentSemesterGrades: async (studentId: string, semester: number): Promise<CourseGrade[]> => {
        try {
            const response = await api.get(`/enrollment/grades/student/${studentId}/semester/${semester}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    calculateSemesterGPA: async (studentId: string, semester: number): Promise<any> => {
        try {
            const response = await api.get(`/enrollment/grades/student/${studentId}/semester/${semester}/gpa`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    calculateCGPA: async (studentId: string): Promise<any> => {
        try {
            const response = await api.get(`/enrollment/grades/student/${studentId}/cgpa`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // Workflow
    getWorkflow: async (params?: any): Promise<ResultWorkflow[]> => {
        try {
            const response = await api.get('/enrollment/grades/workflow', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    submitToCommittee: async (data: { gradeIds: string[], comments?: string }): Promise<any> => {
        try {
            const response = await api.post('/enrollment/grades/workflow/submit', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    approveByCommittee: async (id: string, data: { comments?: string }): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/approve`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    returnToTeacher: async (id: string, data: { comments: string }): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/return`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    publishResult: async (id: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/publish`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    requestReturn: async (id: string, data: { reason: string }): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/grades/workflow/${id}/request-return`, data);
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
    },

    getCourseGradeStats: async (params?: any): Promise<any> => {
        try {
            const response = await api.get('/enrollment/grades/stats/course', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};
