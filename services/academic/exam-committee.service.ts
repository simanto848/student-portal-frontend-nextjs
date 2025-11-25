import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { ExamCommittee } from './types';

export const examCommitteeService = {
    getAllExamCommittees: async (): Promise<ExamCommittee[]> => {
        try {
            const response = await api.get('/academic/exam-committees');
            return extractArrayData<ExamCommittee>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getExamCommitteeById: async (id: string): Promise<ExamCommittee> => {
        try {
            const response = await api.get(`/academic/exam-committees/${id}`);
            return extractItemData<ExamCommittee>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createExamCommittee: async (data: Partial<ExamCommittee>): Promise<ExamCommittee> => {
        try {
            const response = await api.post('/academic/exam-committees', data);
            return extractItemData<ExamCommittee>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateExamCommittee: async (id: string, data: Partial<ExamCommittee>): Promise<ExamCommittee> => {
        try {
            const response = await api.patch(`/academic/exam-committees/${id}`, data);
            return extractItemData<ExamCommittee>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteExamCommittee: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/exam-committees/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
