import { academicApi as api, handleApiError } from "../academic/axios-instance";

export interface Attendance {
    id: string;
    enrollmentId: string;
    studentId: string;
    courseId: string;
    batchId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
    student?: any;
    course?: any;
    batch?: any;
    markedAt?: string;
}

export interface BulkAttendancePayload {
    courseId: string;
    batchId: string;
    date: string;
    attendances: {
        studentId: string;
        status: 'present' | 'absent' | 'late' | 'excused';
        remarks?: string;
    }[];
}

export interface AttendanceStats {
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
}

export const attendanceService = {
    markAttendance: async (data: Partial<Attendance>): Promise<Attendance> => {
        try {
            const response = await api.post('/enrollment/attendance', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    bulkMarkAttendance: async (data: BulkAttendancePayload): Promise<any> => {
        try {
            const response = await api.post('/enrollment/attendance/bulk', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    updateAttendance: async (id: string, data: Partial<Attendance>): Promise<Attendance> => {
        try {
            const response = await api.put(`/enrollment/attendance/${id}`, data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    deleteAttendance: async (id: string): Promise<void> => {
        try {
            await api.delete(`/enrollment/attendance/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },

    listAttendance: async (params?: any): Promise<{ attendance: Attendance[], pagination: any }> => {
        try {
            const response = await api.get('/enrollment/attendance', { params });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getAttendance: async (id: string): Promise<Attendance> => {
        try {
            const response = await api.get(`/enrollment/attendance/${id}`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getStudentStats: async (studentId: string, courseId: string): Promise<AttendanceStats> => {
        try {
            const response = await api.get(`/enrollment/attendance/student/${studentId}/course/${courseId}/stats`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getCourseReport: async (courseId: string, batchId: string): Promise<any> => {
        try {
            const response = await api.get(`/enrollment/attendance/course/${courseId}/batch/${batchId}/report`);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};
