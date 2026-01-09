import { academicApi as api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Program, Batch } from './types';

export const programService = {
    getAllPrograms: async (): Promise<Program[]> => {
        try {
            const response = await api.get('/academic/programs');
            return extractArrayData<Program>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getProgramById: async (id: string): Promise<Program> => {
        try {
            const response = await api.get(`/academic/programs/${id}`);
            return extractItemData<Program>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createProgram: async (data: Partial<Program>): Promise<Program> => {
        try {
            const response = await api.post('/academic/programs', data);
            return extractItemData<Program>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateProgram: async (id: string, data: Partial<Program>): Promise<Program> => {
        try {
            const response = await api.patch(`/academic/programs/${id}`, data);
            return extractItemData<Program>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteProgram: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/programs/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getBatchesByProgram: async (programId: string): Promise<Batch[]> => {
        try {
            const response = await api.get(`/academic/programs/${programId}/batches`);
            return extractArrayData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
