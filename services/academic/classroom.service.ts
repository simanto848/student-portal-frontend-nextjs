import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Classroom } from './types';

export const classroomService = {
    getAllClassrooms: async (): Promise<Classroom[]> => {
        try {
            const response = await api.get('/academic/classrooms');
            return extractArrayData<Classroom>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getClassroomById: async (id: string): Promise<Classroom> => {
        try {
            const response = await api.get(`/academic/classrooms/${id}`);
            return extractItemData<Classroom>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createClassroom: async (data: Partial<Classroom>): Promise<Classroom> => {
        try {
            const response = await api.post('/academic/classrooms', data);
            return extractItemData<Classroom>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateClassroom: async (id: string, data: Partial<Classroom>): Promise<Classroom> => {
        try {
            const response = await api.patch(`/academic/classrooms/${id}`, data);
            return extractItemData<Classroom>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteClassroom: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/classrooms/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
