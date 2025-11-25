import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { Session } from './types';

export const sessionService = {
    getAllSessions: async (): Promise<Session[]> => {
        try {
            const response = await api.get('/academic/sessions');
            return extractArrayData<Session>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getSessionById: async (id: string): Promise<Session> => {
        try {
            const response = await api.get(`/academic/sessions/${id}`);
            return extractItemData<Session>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createSession: async (data: Partial<Session>): Promise<Session> => {
        try {
            const response = await api.post('/academic/sessions', data);
            return extractItemData<Session>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateSession: async (id: string, data: Partial<Session>): Promise<Session> => {
        try {
            const response = await api.patch(`/academic/sessions/${id}`, data);
            return extractItemData<Session>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteSession: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/sessions/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
