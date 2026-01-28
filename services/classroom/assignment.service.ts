import { classroomApi, handleClassroomApiError, extractClassroomArrayData, extractClassroomItemData } from './axios-instance';
import { Assignment, CreateAssignmentDto, UpdateAssignmentDto } from './types';

export const assignmentService = {
    /**
     * Create a new assignment (starts as draft)
     * Roles: super_admin, admin, program_controller, teacher
     */
    create: async (data: CreateAssignmentDto): Promise<Assignment> => {
        try {
            const response = await classroomApi.post('/assignments', data);
            return extractClassroomItemData<Assignment>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Upload files for an assignment
     * Roles: super_admin, admin, program_controller, teacher
     */
    upload: async (formData: FormData): Promise<any> => {
        try {
            const response = await classroomApi.post('/assignments/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // The backend returns the list of attachments directly or inside data
            // Based on ApiResponse.created(res, attachments, "Files uploaded"), it's likely response.data.data
            return extractClassroomArrayData(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * List all assignments in a workspace
     * Roles: super_admin, admin, program_controller, teacher, student
     * Note: Students only see published assignments
     */
    listByWorkspace: async (workspaceId: string): Promise<Assignment[]> => {
        try {
            const response = await classroomApi.get(`/assignments/${workspaceId}`);
            return extractClassroomArrayData<Assignment>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Get a specific assignment by ID
     * Roles: super_admin, admin, program_controller, teacher, student
     */
    getById: async (id: string): Promise<Assignment> => {
        try {
            const response = await classroomApi.get(`/assignments/item/${id}`);
            return extractClassroomItemData<Assignment>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Update an assignment
     * Roles: super_admin, admin, program_controller, teacher
     */
    update: async (id: string, data: UpdateAssignmentDto): Promise<Assignment> => {
        try {
            const response = await classroomApi.patch(`/assignments/${id}`, data);
            return extractClassroomItemData<Assignment>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Publish an assignment (makes it visible to students)
     * Roles: super_admin, admin, program_controller, teacher
     */
    publish: async (id: string): Promise<Assignment> => {
        try {
            const response = await classroomApi.post(`/assignments/${id}/publish`);
            return extractClassroomItemData<Assignment>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Close an assignment (no more submissions)
     * Roles: super_admin, admin, program_controller, teacher
     */
    close: async (id: string): Promise<Assignment> => {
        try {
            const response = await classroomApi.post(`/assignments/${id}/close`);
            return extractClassroomItemData<Assignment>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Delete an assignment (soft delete)
     * Roles: super_admin, admin, program_controller, teacher
     */
    delete: async (id: string): Promise<void> => {
        try {
            await classroomApi.delete(`/assignments/${id}`);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Download an attachment
     */
    downloadAttachment: async (assignmentId: string, attachmentId: string, filename: string): Promise<Blob> => {
        try {
            const response = await classroomApi.get(`/assignments/item/${assignmentId}/attachments/${attachmentId}/download`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw handleClassroomApiError(error);
        }
    }
};
