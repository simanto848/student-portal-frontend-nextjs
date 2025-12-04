import { classroomApi, handleClassroomApiError, extractClassroomArrayData, extractClassroomItemData } from './axios-instance';
import { Workspace, CreateWorkspaceDto, UpdateWorkspaceDto } from './types';

export const workspaceService = {
    /**
     * Create or access a workspace for a course/batch
     * Roles: super_admin, admin, program_controller, teacher
     */
    create: async (data: CreateWorkspaceDto): Promise<Workspace> => {
        try {
            const response = await classroomApi.post('/workspaces', data);
            return extractClassroomItemData<Workspace>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * List all workspaces for the authenticated user
     * Roles: super_admin, admin, program_controller, teacher, student
     */
    listMine: async (): Promise<Workspace[]> => {
        console.log('workspaceService.listMine called');
        try {
            const response = await classroomApi.get('/workspaces');
            return extractClassroomArrayData<Workspace>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Get a specific workspace by ID
     * Roles: super_admin, admin, program_controller, teacher, student
     */
    getById: async (id: string): Promise<Workspace> => {
        try {
            const response = await classroomApi.get(`/workspaces/${id}`);
            return extractClassroomItemData<Workspace>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Update workspace settings or details
     * Roles: super_admin, admin, program_controller, teacher
     */
    update: async (id: string, data: UpdateWorkspaceDto): Promise<Workspace> => {
        try {
            const response = await classroomApi.patch(`/workspaces/${id}`, data);
            return extractClassroomItemData<Workspace>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Delete a workspace (soft delete)
     * Roles: super_admin, admin
     */
    delete: async (id: string): Promise<void> => {
        try {
            await classroomApi.delete(`/workspaces/${id}`);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Sync roster from enrollment service (now automatic)
     * Roles: super_admin, admin, program_controller, teacher
     */
    syncRoster: async (id: string): Promise<void> => {
        try {
            await classroomApi.post(`/workspaces/${id}/sync-roster`);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },
};
