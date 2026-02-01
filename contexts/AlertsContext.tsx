"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { SystemAlert } from "@/services/system.service";

interface AlertsContextType {
    alerts: SystemAlert[];
    unreadCount: number;
    refreshCount: () => Promise<void>;
    dismissAlert: (id: string) => void;
    dismissAll: () => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    // Load dismissed IDs from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("dismissedAlerts");
        if (stored) {
            try {
                setDismissedIds(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse dismissed alerts", e);
            }
        }
    }, []);

    const refreshCount = useCallback(async () => {
        if (user?.role === 'super_admin') {
            try {
                // Dynamically import service
                const { systemService } = await import("@/services/system.service");
                const fetchedAlerts = await systemService.getAlerts();

                // Filter out dismissed alerts
                // We need to use function form or ref if dismissedIds changes often, 
                // but since this is inside useCallback dependent on user, we need access to latest dismissedIds.
                // However, adding dismissedIds to dependency array causes loop if not careful.
                // We'll use a functional update approach or read from ref if needed. 
                // Actually, let's just use the current dismissedIds state in the filtering by passing it or doing logic in setAlerts.

                // Better approach: Update state with unfiltered, then derive filtered for validation? 
                // No, we want to hide them.

                setAlerts(prev => {
                    // We actually need the latest dismissedIds here. 
                    // But we can't access it easily without dependency.
                    // So let's rely on the effect below to filter.
                    return fetchedAlerts;
                });

            } catch (error) {
                console.error("Failed to fetch alerts count", error);
            }
        }
    }, [user]);

    // Apply filter whenever alerts or dismissedIds change
    const visibleAlerts = React.useMemo(() => {
        return alerts.filter(a => !dismissedIds.includes(a.id));
    }, [alerts, dismissedIds]);

    useEffect(() => {
        setUnreadCount(visibleAlerts.length);
    }, [visibleAlerts]);

    const dismissAlert = useCallback((id: string) => {
        setDismissedIds(prev => {
            const next = [...prev, id];
            localStorage.setItem("dismissedAlerts", JSON.stringify(next));
            return next;
        });
    }, []);

    const dismissAll = useCallback(() => {
        // Add all current visible alert IDs to dismissed
        const idsToDismiss = visibleAlerts.map(a => a.id);
        setDismissedIds(prev => {
            const next = [...prev, ...idsToDismiss];
            // unique
            const unique = Array.from(new Set(next));
            localStorage.setItem("dismissedAlerts", JSON.stringify(unique));
            return unique;
        });
    }, [visibleAlerts]);

    useEffect(() => {
        refreshCount();
        const interval = setInterval(refreshCount, 60000);
        return () => clearInterval(interval);
    }, [refreshCount]);

    return (
        <AlertsContext.Provider value={{
            alerts: visibleAlerts,
            unreadCount,
            refreshCount,
            dismissAlert,
            dismissAll
        }}>
            {children}
        </AlertsContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertsContext);
    if (context === undefined) {
        throw new Error("useAlerts must be used within an AlertsProvider");
    }
    return context;
}
