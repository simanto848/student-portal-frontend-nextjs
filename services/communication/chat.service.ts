import { api, handleApiError } from "../academic/axios-instance";

export interface ChatGroup {
    id: string;
    type: 'batch' | 'course' | 'direct';
    name: string;
    description?: string;
    batchId?: string;
    courseId?: string;
    members: string[];
    lastMessage?: Message;
    updatedAt: string;
}

export interface Message {
    id: string;
    chatGroupId: string;
    senderId: string;
    senderModel: 'Student' | 'Teacher' | 'Admin';
    content: string;
    attachments?: string[];
    readBy: string[];
    createdAt: string;
    sender?: {
        id: string;
        fullName: string;
        avatar?: string;
    };
}

export const chatService = {
    getOrCreateCourseChatGroup: async (data: { batchId: string, courseId: string, sessionId: string, instructorId: string }): Promise<ChatGroup> => {
        try {
            const response = await api.post('/communication/groups/course', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getMessages: async (chatGroupId: string, limit = 50, skip = 0): Promise<Message[]> => {
        try {
            const response = await api.get(`/communication/${chatGroupId}/messages`, { params: { limit, skip } });
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    sendMessage: async (data: { chatGroupId: string, chatGroupType: string, content: string }): Promise<Message> => {
        try {
            const response = await api.post('/communication/send', data);
            return response.data.data;
        } catch (error) {
            return handleApiError(error);
        }
    }
};
