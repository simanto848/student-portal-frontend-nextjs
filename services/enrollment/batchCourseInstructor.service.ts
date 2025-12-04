import { api, handleApiError } from "../academic/axios-instance";

export interface BatchCourseInstructor {
    id: string;
    batchId: string;
    courseId: string;
    instructorId: string;
    status: 'active' | 'inactive';
    assignedAt: string;
    assignedBy?: string;
    batch?: any;
    course?: any;
    instructor?: any;
}

export interface AssignInstructorDto {
    batchId: string;
    courseId: string;
    instructorId: string;
    status?: 'active' | 'inactive';
}

export const batchCourseInstructorService = {
    assignInstructor: async (data: AssignInstructorDto): Promise<BatchCourseInstructor> => {
        try {
            const response = await api.post('/enrollment/batch-course-instructors', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    listAssignments: async (params?: any): Promise<{ assignments: BatchCourseInstructor[], pagination: any }> => {
        try {
            const response = await api.get('/enrollment/batch-course-instructors', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getInstructorCourses: async (instructorId: string): Promise<BatchCourseInstructor[]> => {
        try {
            const response = await api.get(`/enrollment/batch-course-instructors/instructor/${instructorId}/courses`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getCourseInstructors: async (params?: { courseId?: string, batchId?: string }): Promise<BatchCourseInstructor[]> => {
        try {
            const response = await api.get('/enrollment/batch-course-instructors/course/instructors', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getAssignment: async (id: string): Promise<BatchCourseInstructor> => {
        try {
            const response = await api.get(`/enrollment/batch-course-instructors/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    updateAssignment: async (id: string, data: Partial<BatchCourseInstructor>): Promise<BatchCourseInstructor> => {
        try {
            const response = await api.put(`/enrollment/batch-course-instructors/${id}`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    deleteAssignment: async (id: string): Promise<void> => {
        try {
            await api.delete(`/enrollment/batch-course-instructors/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    }
};
