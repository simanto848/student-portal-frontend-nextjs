import { academicApi as api } from "@/services/academic/axios-instance";

export type TicketStatus = "open" | "in_progress" | "pending_user" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "account" | "technical" | "academic" | "payment" | "library" | "general" | "other";

export interface TicketMessage {
    sender: string;
    senderType: "user" | "moderator" | "admin" | "system";
    senderName: string;
    content: string;
    attachments?: {
        filename: string;
        url: string;
        mimeType?: string;
    }[];
    createdAt: string;
}

export interface InternalNote {
    note: string;
    addedBy: string;
    addedByName: string;
    createdAt: string;
}

export interface TicketRating {
    score: number;
    feedback?: string;
    ratedAt: string;
}

export interface SupportTicket {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdBy: string;
    createdByType: string;
    createdByName: string;
    createdByEmail: string;
    assignedTo?: {
        _id: string;
        fullName: string;
        email: string;
        role: string;
    };
    assignedToName?: string;
    messages: TicketMessage[];
    internalNotes?: InternalNote[];
    resolvedAt?: string;
    resolvedBy?: string;
    closedAt?: string;
    closedBy?: string;
    tags?: string[];
    rating?: TicketRating;
    createdAt: string;
    updatedAt: string;
}

export interface TicketStatistics {
    total: number;
    byStatus: {
        open: number;
        in_progress: number;
        pending_user: number;
        resolved: number;
        closed: number;
    };
    urgentOpen: number;
    unassigned: number;
}

export interface CreateTicketData {
    subject: string;
    description: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    tags?: string[];
}

export interface UpdateTicketData {
    subject?: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    status?: TicketStatus;
    tags?: string[];
}

export const supportTicketService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: TicketStatus;
        priority?: TicketPriority;
        category?: TicketCategory;
        assignedTo?: string;
    }) {
        const response = await api.get("/user/support-tickets", { params });
        return response.data.data;
    },

    async getById(id: string): Promise<SupportTicket> {
        const response = await api.get(`/user/support-tickets/${id}`);
        return response.data.data;
    },

    async create(data: CreateTicketData): Promise<SupportTicket> {
        const response = await api.post("/user/support-tickets", data);
        return response.data.data;
    },

    async update(id: string, data: UpdateTicketData): Promise<SupportTicket> {
        const response = await api.patch(`/user/support-tickets/${id}`, data);
        return response.data.data;
    },

    async assign(id: string, assigneeId: string): Promise<SupportTicket> {
        const response = await api.post(`/user/support-tickets/${id}/assign`, { assigneeId });
        return response.data.data;
    },

    async addMessage(id: string, content: string, attachments?: { filename: string; url: string; mimeType?: string }[]): Promise<SupportTicket> {
        const response = await api.post(`/user/support-tickets/${id}/messages`, { content, attachments });
        return response.data.data;
    },

    async addInternalNote(id: string, note: string): Promise<SupportTicket> {
        const response = await api.post(`/user/support-tickets/${id}/notes`, { note });
        return response.data.data;
    },

    async resolve(id: string): Promise<SupportTicket> {
        const response = await api.post(`/user/support-tickets/${id}/resolve`);
        return response.data.data;
    },

    async close(id: string): Promise<SupportTicket> {
        const response = await api.post(`/user/support-tickets/${id}/close`);
        return response.data.data;
    },

    async reopen(id: string): Promise<SupportTicket> {
        const response = await api.post(`/user/support-tickets/${id}/reopen`);
        return response.data.data;
    },

    async rate(id: string, score: number, feedback?: string): Promise<SupportTicket> {
        const response = await api.post(`/user/support-tickets/${id}/rate`, { score, feedback });
        return response.data.data;
    },

    async getStatistics(): Promise<TicketStatistics> {
        const response = await api.get("/user/support-tickets/statistics");
        return response.data.data;
    },

    async getMyTickets(): Promise<SupportTicket[]> {
        const response = await api.get("/user/support-tickets/my-tickets");
        return response.data.data;
    },
};

export default supportTicketService;
