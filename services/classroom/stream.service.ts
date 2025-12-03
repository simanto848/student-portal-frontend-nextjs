import { classroomApi, handleClassroomApiError, extractClassroomArrayData } from './axios-instance';
import { StreamItem } from './types';

export const streamService = {
    /**
     * Get activity stream for a workspace
     * Roles: super_admin, admin, program_controller, teacher, student
     * Returns chronological list of activities (assignments, materials, announcements, etc.)
     */
    listByWorkspace: async (workspaceId: string): Promise<StreamItem[]> => {
        try {
            const response = await classroomApi.get(`/stream/${workspaceId}`);
            return extractClassroomArrayData<StreamItem>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },
};
