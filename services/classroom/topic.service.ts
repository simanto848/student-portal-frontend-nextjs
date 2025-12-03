import { classroomApi, handleClassroomApiError, extractClassroomArrayData, extractClassroomItemData } from './axios-instance';
import { Topic, CreateTopicDto, UpdateTopicDto } from './types';

export const topicService = {
    /**
     * Create a new topic for organizing content
     * Roles: super_admin, admin, program_controller, teacher
     */
    create: async (data: CreateTopicDto): Promise<Topic> => {
        try {
            const response = await classroomApi.post('/topics', data);
            return extractClassroomItemData<Topic>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * List all topics in a workspace
     * Roles: super_admin, admin, program_controller, teacher, student
     */
    listByWorkspace: async (workspaceId: string): Promise<Topic[]> => {
        try {
            const response = await classroomApi.get(`/topics/${workspaceId}`);
            return extractClassroomArrayData<Topic>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Update a topic (title, order)
     * Roles: super_admin, admin, program_controller, teacher
     */
    update: async (id: string, data: UpdateTopicDto): Promise<Topic> => {
        try {
            const response = await classroomApi.patch(`/topics/${id}`, data);
            return extractClassroomItemData<Topic>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Delete a topic (soft delete)
     * Roles: super_admin, admin, program_controller, teacher
     */
    delete: async (id: string): Promise<void> => {
        try {
            await classroomApi.delete(`/topics/${id}`);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },
};
