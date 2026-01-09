import { academicApi as api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Department, Program } from './types';

export const departmentService = {
    getAllDepartments: async (): Promise<Department[]> => {
        try {
            const response = await api.get('/academic/departments');
            return extractArrayData<Department>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getDepartmentById: async (id: string): Promise<Department> => {
        try {
            const response = await api.get(`/academic/departments/${id}`);
            return extractItemData<Department>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createDepartment: async (data: Partial<Department>): Promise<Department> => {
        try {
            const response = await api.post('/academic/departments', data);
            return extractItemData<Department>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
        try {
            const response = await api.patch(`/academic/departments/${id}`, data);
            return extractItemData<Department>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteDepartment: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/departments/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getProgramsByDepartment: async (departmentId: string): Promise<Program[]> => {
        try {
            const response = await api.get(`/academic/departments/${departmentId}/programs`);
            return extractArrayData<Program>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
