import { classroomApi, handleClassroomApiError, extractClassroomArrayData, extractClassroomItemData } from './axios-instance';
import { Material, CreateMaterialDto, UpdateMaterialDto } from './types';

export const materialService = {
    /**
     * Create a new material (file, link, or text)
     * Roles: super_admin, admin, program_controller, teacher
     */
    create: async (data: CreateMaterialDto): Promise<Material> => {
        try {
            const response = await classroomApi.post('/materials', data);
            return extractClassroomItemData<Material>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * List all materials in a workspace
     * Roles: super_admin, admin, program_controller, teacher, student
     * Students see only 'all' visibility materials
     */
    listByWorkspace: async (workspaceId: string): Promise<Material[]> => {
        try {
            const response = await classroomApi.get(`/materials/${workspaceId}`);
            return extractClassroomArrayData<Material>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Get a specific material by ID
     * Roles: super_admin, admin, program_controller, teacher, student
     */
    getById: async (id: string): Promise<Material> => {
        try {
            const response = await classroomApi.get(`/materials/item/${id}`);
            return extractClassroomItemData<Material>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Update a material
     * Roles: super_admin, admin, program_controller, teacher
     */
    update: async (id: string, data: UpdateMaterialDto): Promise<Material> => {
        try {
            const response = await classroomApi.patch(`/materials/${id}`, data);
            return extractClassroomItemData<Material>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Delete a material (soft delete)
     * Roles: super_admin, admin, program_controller, teacher
     */
    delete: async (id: string): Promise<void> => {
        try {
            await classroomApi.delete(`/materials/${id}`);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },
};
