import { api, handleApiError } from "../academic/axios-instance";

export interface ChatGroup {
  id: string;
  type: "batch" | "course" | "direct";
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
  senderModel: "Student" | "Teacher" | "Admin";
  content: string;
  attachments?: string[];
  readBy: string[];
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  isPinned?: boolean;
  pinnedBy?: string;
}

export const chatService = {
  listMyChatGroups: async (): Promise<any[]> => {
    try {
      const response = await api.get("/communication/chats/groups/mine");
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getOrCreateCourseChatGroup: async (data: {
    batchId: string;
    courseId: string;
    sessionId: string;
    instructorId: string;
  }): Promise<ChatGroup> => {
    try {
      const response = await api.post(
        "/communication/chats/groups/course",
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getOrCreateBatchChatGroup: async (data: {
    batchId: string;
    counselorId: string;
  }): Promise<ChatGroup> => {
    try {
      const response = await api.post(
        "/communication/chats/groups/batch",
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getMessages: async (
    chatGroupId: string,
    limit = 50,
    skip = 0,
    search = "",
    filter = ""
  ): Promise<Message[]> => {
    try {
      const response = await api.get(
        `/communication/chats/${chatGroupId}/messages`,
        { params: { limit, skip, search, filter } }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getChatGroupDetails(chatGroupId: string): Promise<any> {
    try {
      const response = await api.get(
        `/communication/chats/groups/${chatGroupId}`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  sendMessage: async (data: {
    chatGroupId: string;
    chatGroupType: string;
    content: string;
  }): Promise<Message> => {
    try {
      const response = await api.post("/communication/chats/send", data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    try {
      const response = await api.put(
        `/communication/chats/messages/${messageId}`,
        { content }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await api.delete(`/communication/chats/messages/${messageId}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  pinMessage: async (messageId: string): Promise<Message> => {
    try {
      const response = await api.patch(
        `/communication/chats/messages/${messageId}/pin`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
