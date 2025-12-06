import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Batch } from './types';

export const batchService = {
    getAllBatches: async (filters?: Record<string, any>): Promise<Batch[]> => {
        try {
            const response = await api.get('/academic/batches', { params: filters });
            return extractArrayData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getBatchById: async (id: string): Promise<Batch> => {
        try {
            const response = await api.get(`/academic/batches/${id}`);
            return extractItemData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createBatch: async (data: Partial<Batch>): Promise<Batch> => {
        try {
            const response = await api.post('/academic/batches', data);
            return extractItemData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateBatch: async (id: string, data: Partial<Batch>): Promise<Batch> => {
        try {
            const response = await api.patch(`/academic/batches/${id}`, data);
            return extractItemData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteBatch: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/batches/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
    assignCounselor: async (id: string, counselorId: string): Promise<Batch> => {
        try {
            const response = await api.post(`/academic/batches/${id}/assign-counselor`, { counselorId });
            return extractItemData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateSemester: async (id: string, currentSemester: number): Promise<Batch> => {
        try {
            const response = await api.patch(`/academic/batches/${id}/semester`, { currentSemester });
            return extractItemData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    assignClassRepresentative: async (id: string, studentId: string): Promise<Batch> => {
        try {
            const response = await api.post(`/academic/batches/${id}/cr`, { studentId });
            return extractItemData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    removeClassRepresentative: async (id: string): Promise<Batch> => {
        try {
            const response = await api.delete(`/academic/batches/${id}/cr`);
            return extractItemData<Batch>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
