import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Batch } from './types';

export const batchService = {
    getAllBatches: async (): Promise<Batch[]> => {
        try {
            const response = await api.get('/academic/batches');
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
};
