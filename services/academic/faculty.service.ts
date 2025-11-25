import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Faculty, Department } from './types';

export const facultyService = {
    getAllFaculties: async (): Promise<Faculty[]> => {
        try {
            const response = await api.get('/academic/faculties');
            return extractArrayData<Faculty>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getFacultyById: async (id: string): Promise<Faculty> => {
        try {
            const response = await api.get(`/academic/faculties/${id}`);
            return extractItemData<Faculty>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createFaculty: async (data: Partial<Faculty>): Promise<Faculty> => {
        try {
            const response = await api.post('/academic/faculties', data);
            return extractItemData<Faculty>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateFaculty: async (id: string, data: Partial<Faculty>): Promise<Faculty> => {
        try {
            const response = await api.patch(`/academic/faculties/${id}`, data);
            return extractItemData<Faculty>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteFaculty: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/faculties/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getDepartmentsByFaculty: async (facultyId: string): Promise<Department[]> => {
        try {
            const response = await api.get(`/academic/faculties/${facultyId}/departments`);
            return extractArrayData<Department>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    assignDean: async (facultyId: string, deanId: string): Promise<Faculty> => {
        try {
            const response = await api.post(`/academic/faculties/${facultyId}/assign-dean`, { deanId });
            return extractItemData<Faculty>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    removeDean: async (facultyId: string): Promise<Faculty> => {
        try {
            const response = await api.delete(`/academic/faculties/${facultyId}/dean`);
            return extractItemData<Faculty>(response);
        } catch (error) {
            return handleApiError(error);
        }
    }
};
