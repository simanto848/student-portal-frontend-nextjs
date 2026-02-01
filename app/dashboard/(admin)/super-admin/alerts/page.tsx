"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, SystemAlert } from "@/services/system.service";
import {
    AlertCircle,
    AlertTriangle,
    Info,
    CheckCircle,
    RefreshCw,
    Search,
    X,
    Filter,
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/contexts/AlertsContext";

const AlertsContent = () => {
    // Remove local alerts state, use context
    // const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [loading, setLoading] = useState(false); // Context handles fetching, but we can simulate loading if needed, or query context status (not exposed yet)
    // Actually, context loads initially. We can use alerts.length check or add loading state to context later. 
    // For now, assume loaded if not empty or just display.
    // If context logic doesn't expose loading, we might see empty initially.

    // Better: let's expose loading from context?
    // For now, let's just assume data arrives.

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const { alerts, refreshCount, dismissAlert, dismissAll } = useAlerts();

    // No local fetch needed, context handles it.
    // However, user can click "Refresh".
    const handleRefresh = async () => {
        setLoading(true);
        await refreshCount();
        setLoading(false);
    };

    const handleDismiss = (id: string) => {
        dismissAlert(id);
        toast.success("Alert dismissed");
    };

    const handleMarkAllRead = () => {
        dismissAll();
        toast.success("All alerts cleared");
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || alert.type === activeTab;
        return matchesSearch && matchesTab;
    });

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertCircle className="h-5 w-5 text-destructive" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'critical': return "border-destructive/20 bg-destructive/5 hover:bg-destructive/10";
            case 'warning': return "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10";
            case 'success': return "border-green-500/20 bg-green-500/5 hover:bg-green-500/10";
            default: return "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10";
        }
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'critical': return "destructive";
            case 'warning': return "secondary"; // Or custom styling if available
            case 'success': return "default";   // Usually unused for badges but ok
            default: return "secondary";
        }
    };

    const counts = {
        all: alerts.length,
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Alerts</h1>
                        <Badge variant="outline" className="px-2 py-0.5 h-6">
                            {alerts.length} Active
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Monitor critical system events, warnings, and notifications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleRefresh} variant="outline" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh Status
                    </Button>
                    <Button
                        onClick={handleMarkAllRead}
                        variant="secondary"
                        className="gap-2"
                        disabled={alerts.length === 0}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Mark All Read
                    </Button>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-4 md:w-auto">
                        <TabsTrigger value="all" className="gap-2">
                            All <span className="ml-1 text-xs bg-muted-foreground/10 px-1.5 rounded-full">{counts.all}</span>
                        </TabsTrigger>
                        <TabsTrigger value="critical" className="gap-2">
                            Critical <span className="ml-1 text-xs bg-destructive/10 text-destructive px-1.5 rounded-full">{counts.critical}</span>
                        </TabsTrigger>
                        <TabsTrigger value="warning" className="gap-2">
                            Warning <span className="ml-1 text-xs bg-amber-500/10 text-amber-600 px-1.5 rounded-full">{counts.warning}</span>
                        </TabsTrigger>
                        <TabsTrigger value="info" className="gap-2">
                            Info <span className="ml-1 text-xs bg-blue-500/10 text-blue-600 px-1.5 rounded-full">{counts.info}</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search alerts..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground animate-pulse">Scanning system status...</p>
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No alerts found</h3>
                            <p className="text-muted-foreground mt-1 max-w-sm">
                                {searchQuery
                                    ? `No results matching "${searchQuery}" in ${activeTab} category.`
                                    : "Your system is running smoothly. No active alerts to display."}
                            </p>
                            {searchQuery && (
                                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                                    Clear Search
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={cn(
                                    "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
                                    getAlertStyles(alert.type)
                                )}
                            >
                                <div className="mt-1 shrink-0">
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-foreground capitalize text-sm md:text-base">
                                                {alert.type} Alert
                                            </h4>
                                            {alert.type === 'critical' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive text-destructive-foreground uppercase tracking-wider">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-md border border-border/50">
                                            {alert.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                                        {alert.message}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/80 -mr-2 -mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDismiss(alert.id)}
                                    title="Dismiss Alert"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Dismiss</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SystemAlertsPage() {
    return (
        <DashboardLayout>
            <AlertsContent />
        </DashboardLayout>
    );
}
