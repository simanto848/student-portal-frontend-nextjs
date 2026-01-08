"use server";

import { notificationService, NotificationItem } from "@/services/notification/notification.service";
import { batchCourseInstructorService } from "@/services/enrollment/batchCourseInstructor.service";
import { requireUser } from "@/lib/auth/userAuth";

export async function getTeacherNotifications(params: { limit?: number; page?: number } = {}) {
    try {
        await requireUser();
        const response = await notificationService.list({
            limit: params.limit || 50,
            page: params.page || 1,
            mine: true
        });

        // Handle different response formats
        if (Array.isArray(response)) return response;
        if (response && Array.isArray((response as any).notifications)) return (response as any).notifications;
        if (response && Array.isArray((response as any).items)) return (response as any).items;
        if (response && Array.isArray((response as any).data)) return (response as any).data;

        return [];
    } catch (error) {
        console.error("Error fetching teacher notifications:", error);
        return [];
    }
}

export async function getTeacherSentNotifications(params: { limit?: number; page?: number } = {}) {
    try {
        await requireUser();
        const response = await notificationService.getSent({
            limit: params.limit || 50,
            page: params.page || 1
        });

        // Handle different response formats
        if (Array.isArray(response)) return response;
        if (response && Array.isArray((response as any).notifications)) return (response as any).notifications;
        if (response && Array.isArray((response as any).items)) return (response as any).items;
        if (response && Array.isArray((response as any).data)) return (response as any).data;

        return [];
    } catch (error) {
        console.error("Error fetching sent notifications:", error);
        return [];
    }
}

export async function getNotificationStats() {
    try {
        await requireUser();
        const response = await notificationService.list({ limit: 100, mine: true });

        let notifications: NotificationItem[] = [];
        if (Array.isArray(response)) notifications = response;
        else if (response && Array.isArray((response as any).notifications)) notifications = (response as any).notifications;
        else if (response && Array.isArray((response as any).items)) notifications = (response as any).items;
        else if (response && Array.isArray((response as any).data)) notifications = (response as any).data;

        const stats = {
            total: notifications.length,
            unread: notifications.filter((n) => n.status === "sent" || !n.isRead).length,
            read: notifications.filter((n) => n.status === "read" || n.isRead).length,
        };

        return stats;
    } catch (error) {
        console.error("Error fetching notification stats:", error);
        return { unread: 0, total: 0 };
    }
}

export async function getNotificationTargetOptions() {
    try {
        const user = await requireUser();

        const [instructorAssignments, scope] = await Promise.all([
            batchCourseInstructorService.getInstructorCourses(user.id),
            notificationService.getMyScope().catch((err) => {
                console.error("Failed to get my scope:", err);
                return null;
            }),
        ]);

        console.log("Notification target options:", {
            user: { id: user.id, role: user.role, isDepartmentHead: (user as any).isDepartmentHead },
            assignments: instructorAssignments?.length,
            scope: scope
        });

        return {
            assignments: instructorAssignments || [],
            scope: scope || { canSend: false, options: [] }
        };
    } catch (error) {
        console.error("Error fetching target options:", error);
        return { assignments: [], scope: { canSend: false, options: [] } };
    }
}
