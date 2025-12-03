import { classroomApi, handleClassroomApiError, extractClassroomArrayData, extractClassroomItemData } from './axios-instance';
import { Rubric, CreateRubricDto, UpdateRubricDto } from './types';

export const rubricService = {
    /**
     * Create a new grading rubric
     * Roles: super_admin, admin, program_controller, teacher
     */
    create: async (data: CreateRubricDto): Promise<Rubric> => {
        try {
            const response = await classroomApi.post('/rubrics', data);
            return extractClassroomItemData<Rubric>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * List all rubrics in a workspace
     * Roles: super_admin, admin, program_controller, teacher
     * Note: Students do not have direct access to rubrics list
     */
    listByWorkspace: async (workspaceId: string): Promise<Rubric[]> => {
        try {
            const response = await classroomApi.get(`/rubrics/${workspaceId}`);
            return extractClassroomArrayData<Rubric>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Get a specific rubric by ID
     * Roles: super_admin, admin, program_controller, teacher
     */
    getById: async (id: string): Promise<Rubric> => {
        try {
            const response = await classroomApi.get(`/rubrics/item/${id}`);
            return extractClassroomItemData<Rubric>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Update a rubric
     * Roles: super_admin, admin, program_controller, teacher
     */
    update: async (id: string, data: UpdateRubricDto): Promise<Rubric> => {
        try {
            const response = await classroomApi.patch(`/rubrics/${id}`, data);
            return extractClassroomItemData<Rubric>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Delete a rubric (soft delete)
     * Roles: super_admin, admin, program_controller, teacher
     */
    delete: async (id: string): Promise<void> => {
        try {
            await classroomApi.delete(`/rubrics/${id}`);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },
};
