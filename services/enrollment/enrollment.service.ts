import { api, handleApiError } from "../academic/axios-instance";

export interface Enrollment {
    id: string;
    studentId: string;
    batchId: string;
    courseId: string;
    semester: number;
    academicYear: string;
    status: 'enrolled' | 'completed' | 'dropped' | 'failed';
    enrollmentDate: string;
    completionDate?: string;
    gradeId?: string;
    createdAt?: string;
    updatedAt?: string;
    student?: any;
    batch?: any;
    course?: any;
}

export interface CreateEnrollmentDto {
    studentId: string;
    batchId: string;
    sessionId: string;
    semester: number;
}

export interface BatchSemesterCourse {
    courseId: string;
    sessionCourseId: string;
    semester: number;
    instructorId?: string;
    instructorAssigned: boolean;
    assignmentId?: string;
    // Populated fields
    course?: any;
    instructor?: any;
}

export interface BulkEnrollDto {
    batchId: string;
    courseIds: string[];
    semester: number;
    academicYear: string;
}

export const enrollmentService = {
    getBatchSemesterCourses: async (batchId: string, semester: number): Promise<BatchSemesterCourse[]> => {
        try {
            const response = await api.get(`/enrollment/enrollments/batch/${batchId}/semester/${semester}/courses`);
            return response.data.data || [];
        } catch (error) {
            return handleApiError(error);
        }
    },

    enrollStudent: async (data: CreateEnrollmentDto): Promise<any> => {
        try {
            const response = await api.post('/enrollment/enrollments', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    bulkEnroll: async (data: BulkEnrollDto): Promise<any> => {
        try {
            const response = await api.post('/enrollment/enrollments/bulk', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    completeBatchSemester: async (batchId: string, semester: number): Promise<any> => {
        try {
            const response = await api.post('/enrollment/enrollments/complete-semester', { batchId, semester });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    progressBatchSemester: async (batchId: string): Promise<any> => {
        try {
            const response = await api.post(`/enrollment/enrollments/batch/${batchId}/progress-semester`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    listEnrollments: async (params?: any): Promise<{ enrollments: Enrollment[], pagination: any }> => {
        try {
            const response = await api.get('/enrollment/enrollments', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getStudentSemesterEnrollments: async (studentId: string, semester: number): Promise<Enrollment[]> => {
        try {
            const response = await api.get(`/enrollment/enrollments/student/${studentId}/semester/${semester}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getEnrollment: async (id: string): Promise<Enrollment> => {
        try {
            const response = await api.get(`/enrollment/enrollments/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    updateEnrollment: async (id: string, data: Partial<Enrollment>): Promise<Enrollment> => {
        try {
            const response = await api.put(`/enrollment/enrollments/${id}`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    deleteEnrollment: async (id: string): Promise<void> => {
        try {
            await api.delete(`/enrollment/enrollments/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    }
};
