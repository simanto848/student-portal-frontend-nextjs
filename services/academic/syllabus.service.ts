import { academicApi as api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { CourseSyllabus } from './types';

export const syllabusService = {
    getAllSyllabi: async (): Promise<CourseSyllabus[]> => {
        try {
            const response = await api.get('/academic/courses/syllabus');
            return extractArrayData<CourseSyllabus>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getSyllabusById: async (id: string): Promise<CourseSyllabus> => {
        try {
            const response = await api.get(`/academic/courses/syllabus/${id}`);
            return extractItemData<CourseSyllabus>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createSyllabus: async (data: Partial<CourseSyllabus>): Promise<CourseSyllabus> => {
        try {
            const response = await api.post('/academic/courses/syllabus', data);
            return extractItemData<CourseSyllabus>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateSyllabus: async (id: string, data: Partial<CourseSyllabus>): Promise<CourseSyllabus> => {
        try {
            const response = await api.patch(`/academic/courses/syllabus/${id}`, data);
            return extractItemData<CourseSyllabus>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteSyllabus: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/syllabus/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
    approveSyllabus: async (id: string): Promise<CourseSyllabus> => {
        try {
            const response = await api.post(`/academic/courses/syllabus/${id}/approve`);
            return extractItemData<CourseSyllabus>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    publishSyllabus: async (id: string): Promise<CourseSyllabus> => {
        try {
            const response = await api.post(`/academic/courses/syllabus/${id}/publish`);
            return extractItemData<CourseSyllabus>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
