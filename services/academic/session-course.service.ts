import { academicApi as api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { SessionCourse } from './types';

export const sessionCourseService = {
    getAllSessionCourses: async (params?: any): Promise<SessionCourse[]> => {
        try {
            const response = await api.get('/academic/session-courses', { params });
            return extractArrayData<SessionCourse>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getSessionCourseById: async (id: string): Promise<SessionCourse> => {
        try {
            const response = await api.get(`/academic/session-courses/${id}`);
            return extractItemData<SessionCourse>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createSessionCourse: async (data: Partial<SessionCourse>): Promise<SessionCourse> => {
        try {
            const response = await api.post('/academic/session-courses', data);
            return extractItemData<SessionCourse>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateSessionCourse: async (id: string, data: Partial<SessionCourse>): Promise<SessionCourse> => {
        try {
            const response = await api.patch(`/academic/session-courses/${id}`, data);
            return extractItemData<SessionCourse>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteSessionCourse: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/session-courses/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getBatchSessionCourses: async (batchId: string): Promise<SessionCourse[]> => {
        try {
            const response = await api.get(`/academic/session-courses/batch/${batchId}`);
            return extractArrayData<SessionCourse>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    // Student-accessible endpoint to get session courses for their batch
    getMyBatchSessionCourses: async (batchId: string): Promise<SessionCourse[]> => {
        try {
            const response = await api.get(`/academic/session-courses/my-batch/${batchId}`);
            return extractArrayData<SessionCourse>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    syncSessionCourses: async (data: { sessionId: string; departmentId: string; semester: number; courseIds: string[] }): Promise<SessionCourse[]> => {
        try {
            const response = await api.post('/academic/session-courses/sync', data);
            return extractArrayData<SessionCourse>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
