import { api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { CourseSchedule } from './types';

export const scheduleService = {
    getAllSchedules: async (): Promise<CourseSchedule[]> => {
        try {
            const response = await api.get('/academic/schedules');
            return extractArrayData<CourseSchedule>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getScheduleById: async (id: string): Promise<CourseSchedule> => {
        try {
            const response = await api.get(`/academic/schedules/${id}`);
            return extractItemData<CourseSchedule>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    createSchedule: async (data: Partial<CourseSchedule>): Promise<CourseSchedule> => {
        try {
            const response = await api.post('/academic/schedules', data);
            return extractItemData<CourseSchedule>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    updateSchedule: async (id: string, data: Partial<CourseSchedule>): Promise<CourseSchedule> => {
        try {
            const response = await api.patch(`/academic/schedules/${id}`, data);
            return extractItemData<CourseSchedule>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    deleteSchedule: async (id: string): Promise<void> => {
        try {
            await api.delete(`/academic/schedules/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getScheduleByBatch: async (batchId: string): Promise<CourseSchedule[]> => {
        try {
            const response = await api.get(`/academic/schedules/batch/${batchId}`);
            return extractArrayData<CourseSchedule>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
    getScheduleByTeacher: async (teacherId: string): Promise<CourseSchedule[]> => {
        try {
            const response = await api.get(`/academic/schedules/teacher/${teacherId}`);
            return extractArrayData<CourseSchedule>(response);
        } catch (error) {
            return handleApiError(error);
        }
    },
};
