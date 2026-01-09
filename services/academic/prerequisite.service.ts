import { academicApi as api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { CoursePrerequisite } from './types';

export const prerequisiteService = {
    getAllPrerequisites: async (): Promise<CoursePrerequisite[]> => {
        try {
            const response = await api.get('/academic/courses/prerequisites');
            return extractArrayData<CoursePrerequisite>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getPrerequisiteById: async (id: string): Promise<CoursePrerequisite> => {
        try {
            const response = await api.get(`/academic/courses/prerequisites/${id}`);
            return extractItemData<CoursePrerequisite>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createPrerequisite: async (data: Partial<CoursePrerequisite>): Promise<CoursePrerequisite> => {
        try {
            const response = await api.post('/academic/courses/prerequisites', data);
            return extractItemData<CoursePrerequisite>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updatePrerequisite: async (id: string, data: Partial<CoursePrerequisite>): Promise<CoursePrerequisite> => {
        try {
            const response = await api.patch(`/academic/courses/prerequisites/${id}`, data);
            return extractItemData<CoursePrerequisite>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deletePrerequisite: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/courses/prerequisites/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
