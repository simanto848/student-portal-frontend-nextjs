import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Course } from './types';

export const courseService = {
    getAllCourses: async (): Promise<Course[]> => {
        try {
            const response = await api.get('/academic/courses');
            return extractArrayData<Course>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getCourseById: async (id: string): Promise<Course> => {
        try {
            const response = await api.get(`/academic/courses/${id}`);
            return extractItemData<Course>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createCourse: async (data: Partial<Course>): Promise<Course> => {
        try {
            const response = await api.post('/academic/courses', data);
            return extractItemData<Course>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
        try {
            const response = await api.patch(`/academic/courses/${id}`, data);
            return extractItemData<Course>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteCourse: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/courses/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
