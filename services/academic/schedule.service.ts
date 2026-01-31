import { academicApi as api, handleApiError, extractArrayData, extractItemData } from './axios-instance';
import { CourseSchedule, ScheduleProposal } from './types';

export interface ClassDurations {
    theory?: number;  // Duration in minutes
    lab?: number;
    project?: number;
}

export interface CustomTimeSlots {
    day?: {
        startTime?: string;  // "08:30"
        endTime?: string;    // "15:00"
        breakStart?: string; // "12:00"
        breakEnd?: string;   // "13:00"
    };
    evening?: {
        startTime?: string;  // "15:30"
        endTime?: string;    // "21:00"
        breakStart?: string;
        breakEnd?: string;
    };
}

export type DayOfWeek = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface ScheduleGenerationOptions {
    sessionId: string;
    departmentId?: string;
    batchIds?: string[];
    selectionMode?: 'single_batch' | 'multi_batch' | 'department' | 'all';
    classDurationMinutes?: number;  // Default class duration in minutes (default: 75 = 1h 15m)
    classDurations?: ClassDurations; // Duration per class type
    workingDays?: DayOfWeek[];      // e.g., ['Saturday', 'Sunday', 'Wednesday', 'Thursday']
    offDays?: DayOfWeek[];          // e.g., ['Monday', 'Tuesday', 'Friday']
    customTimeSlots?: CustomTimeSlots; // Custom start/end times for day and evening shifts
}

export interface ScheduleValidationResult {
    valid: boolean;
    errors: Array<string | { message: string; unassignedCourses?: unknown[] }>;
    warnings: string[];
    unassignedCourses: {
        batchId: string;
        batchName: string;
        courseId: string;
        courseCode: string;
        courseName: string;
        semester: number;
    }[];
}

export interface ScheduleGenerationResult {
    proposal: ScheduleProposal;
    stats: {
        scheduled: number;
        unscheduled: number;
        conflicts: Array<{ type: string; reason?: string }>;
        warnings: string[];
    };
}

export interface ConflictCheckResult {
    hasConflicts: boolean;
    count: number;
    conflicts: Array<{ type: string; schedule1: unknown; schedule2: unknown }>;
}

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

    /**
     * Validate prerequisites before generating schedule
     */
    validateSchedulePrerequisites: async (options: ScheduleGenerationOptions): Promise<ScheduleValidationResult> => {
        try {
            const response = await api.post('/academic/ai-schedules/validate', options);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Generate schedule automatically (supports batch selection modes)
     */
    generateSchedule: async (options: ScheduleGenerationOptions): Promise<ScheduleGenerationResult> => {
        try {
            const response = await api.post('/academic/ai-schedules/generate', options);
            return {
                proposal: response.data.data,
                stats: response.data.stats
            };
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string; unassignedCourses?: unknown[]; errors?: unknown[] } } };
            if (axiosError.response?.data?.unassignedCourses) {
                const validationError = new Error(axiosError.response.data.message || 'Validation failed') as Error & { unassignedCourses?: unknown[]; errors?: unknown[] };
                validationError.unassignedCourses = axiosError.response.data.unassignedCourses;
                validationError.errors = axiosError.response.data.errors;
                throw validationError;
            }
            return handleApiError(error);
        }
    },

    /**
     * Generate schedule using legacy AI (Gemini)
     */
    generateScheduleAI: async (sessionId: string, departmentId?: string): Promise<ScheduleProposal> => {
        try {
            const payload: { sessionId: string; departmentId?: string } = { sessionId };
            if (departmentId) payload.departmentId = departmentId;

            const response = await api.post('/academic/ai-schedules/generate-ai', payload);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Check for conflicts in existing schedules
     */
    checkConflicts: async (batchIds: string[], sessionId?: string): Promise<ConflictCheckResult> => {
        try {
            const response = await api.post('/academic/ai-schedules/check-conflicts', { batchIds, sessionId });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getProposals: async (sessionId: string): Promise<ScheduleProposal[]> => {
        try {
            const response = await api.get('/academic/ai-schedules/proposals', { params: { sessionId } });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getProposalById: async (id: string): Promise<ScheduleProposal> => {
        try {
            const response = await api.get(`/academic/ai-schedules/proposals/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    applyProposal: async (proposalId: string): Promise<{ success: boolean; schedulesCreated: number; message: string }> => {
        try {
            const response = await api.post(`/academic/ai-schedules/proposals/${proposalId}/apply`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    deleteProposal: async (proposalId: string): Promise<void> => {
        try {
            await api.delete(`/academic/ai-schedules/proposals/${proposalId}`);
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Close schedules for specific batches
     * Closed schedules won't conflict with new schedule generation
     */
    closeSchedulesForBatches: async (batchIds: string[]): Promise<{ success: boolean; closedCount: number; message: string }> => {
        try {
            const response = await api.post('/academic/ai-schedules/close-batches', { batchIds });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Close all schedules for a session
     */
    closeSchedulesForSession: async (sessionId: string): Promise<{ success: boolean; closedCount: number; message: string }> => {
        try {
            const response = await api.post('/academic/ai-schedules/close-session', { sessionId });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Reopen schedules for specific batches
     */
    reopenSchedulesForBatches: async (batchIds: string[]): Promise<{ success: boolean; reopenedCount: number; message: string }> => {
        try {
            const response = await api.post('/academic/ai-schedules/reopen-batches', { batchIds });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get schedule status summary (active, closed, archived counts)
     */
    getScheduleStatusSummary: async (batchIds?: string[]): Promise<{ active: number; closed: number; archived: number }> => {
        try {
            const params = batchIds ? { batchIds: batchIds.join(',') } : {};
            const response = await api.get('/academic/ai-schedules/status-summary', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get active schedules (for weekly recurring view)
     */
    getActiveSchedules: async (batchIds?: string[]): Promise<CourseSchedule[]> => {
        try {
            const params = batchIds ? { batchIds: batchIds.join(',') } : {};
            const response = await api.get('/academic/ai-schedules/active', { params });
            return extractArrayData<CourseSchedule>(response);
        } catch (error) {
            return handleApiError(error);
        }
    }
};
