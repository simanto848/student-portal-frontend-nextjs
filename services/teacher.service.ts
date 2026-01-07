import { academicApi as api, handleApiError, extractArrayData, extractItemData } from './academic/axios-instance';

export interface Teacher {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    designation?: string;
    departmentId?: string;
    status?: boolean;
    registrationNumber?: string;
}

export const teacherService = {
    getAllTeachers: async (): Promise<Teacher[]> => {
        try {
            // The gateway proxies /api/user to the user service
            const response = await api.get('/user/teachers');
            const apiData = response.data;

            // Case 1: { data: { teachers: [...] } }
            if (apiData?.data?.teachers) {
                const teachers = apiData.data.teachers;
                if (Array.isArray(teachers)) {
                    return teachers.map((teacher: any) => ({
                        ...teacher,
                        id: teacher._id || teacher.id
                    }));
                }
            }

            // Case 2: { data: [...] }
            if (Array.isArray(apiData?.data)) {
                return apiData.data.map((teacher: any) => ({
                    ...teacher,
                    id: teacher._id || teacher.id
                }));
            }

            // Case 3: [...]
            if (Array.isArray(apiData)) {
                return apiData.map((teacher: any) => ({
                    ...teacher,
                    id: teacher._id || teacher.id
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching teachers:", error);
            return handleApiError(error);
        }
    },
    getTeacherById: async (id: string): Promise<Teacher> => {
        try {
            const response = await api.get(`/user/teachers/${id}`);
            const data = extractItemData<any>(response);
            return { ...data, id: data._id || data.id };
        } catch (error) {
            return handleApiError(error);
        }
    }
};
