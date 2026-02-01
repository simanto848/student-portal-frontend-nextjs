"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, ActivityLog } from "@/services/system.service";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Search, 
    Filter, 
    RefreshCw, 
    AlertTriangle, 
    Info,
    Server,
    Clock,
    User,
    X,
    FileText,
    Download,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { cn } from "@/lib/utils";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SERVICES = [
    { value: "all", label: "All Services", icon: Server },
    { value: "USER", label: "User Service", icon: User },
    { value: "ACADEMIC", label: "Academic", icon: FileText },
    { value: "LIBRARY", label: "Library", icon: FileText },
    { value: "ENROLLMENT", label: "Enrollment", icon: FileText },
    { value: "CLASSROOM", label: "Classroom", icon: FileText },
    { value: "NOTIFICATION", label: "Notification", icon: FileText },
    { value: "COMMUNICATION", label: "Communication", icon: FileText },
    { value: "GATEWAY", label: "Gateway", icon: Server },
];

const LEVELS = [
    { value: "all", label: "All Levels", color: "slate" },
    { value: "info", label: "Info", color: "blue" },
    { value: "warn", label: "Warning", color: "amber" },
    { value: "error", label: "Error", color: "red" },
];

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await systemService.getLogs({
                service: serviceFilter === "all" ? undefined : serviceFilter,
                level: levelFilter === "all" ? undefined : levelFilter,
                search: search || undefined
            });
            setLogs(data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    }, [search, serviceFilter, levelFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const getLevelBadge = (level: string) => {
        const styles = {
            error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
            warn: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
            info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
        };
        
        const icons = {
            error: <AlertTriangle className="h-3 w-3 mr-1" />,
            warn: <AlertTriangle className="h-3 w-3 mr-1" />,
            info: <Info className="h-3 w-3 mr-1" />
        };

        return (
            <Badge variant="outline" className={cn("font-medium text-xs capitalize", styles[level as keyof typeof styles] || styles.info)}>
                {icons[level as keyof typeof icons]}
                {level}
            </Badge>
        );
    };

    const getServiceBadge = (service: string) => {
        return (
            <Badge variant="outline" className="font-mono text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                {service}
            </Badge>
        );
    };

    const stats = {
        total: logs.length,
        errors: logs.filter(l => l.level === 'error').length,
        warnings: logs.filter(l => l.level === 'warn').length,
        info: logs.filter(l => l.level === 'info').length
    };

    const toggleExpand = (logId: string) => {
        setExpandedLog(expandedLog === logId ? null : logId);
    };

    const clearFilters = () => {
        setSearch("");
        setServiceFilter("all");
        setLevelFilter("all");
    };

    const hasActiveFilters = search || serviceFilter !== "all" || levelFilter !== "all";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title="Activity Logs"
                subtitle="System audit trail and event history"
                icon={FileText}
                extraActions={
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 border-slate-200 dark:border-slate-700"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button 
                            onClick={fetchLogs} 
                            variant="outline" 
                            size="sm"
                            className="gap-2 border-slate-200 dark:border-slate-700"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Logs"
                    value={stats.total}
                    icon={FileText}
                    className="border-l-4 border-l-slate-400"
                    iconClassName="text-slate-500"
                    iconBgClassName="bg-slate-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Errors"
                    value={stats.errors}
                    icon={AlertTriangle}
                    className="border-l-4 border-l-red-500"
                    iconClassName="text-red-500"
                    iconBgClassName="bg-red-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Warnings"
                    value={stats.warnings}
                    icon={AlertTriangle}
                    className="border-l-4 border-l-amber-500"
                    iconClassName="text-amber-500"
                    iconBgClassName="bg-amber-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Info"
                    value={stats.info}
                    icon={Info}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-500"
                    iconBgClassName="bg-blue-500/10"
                    loading={loading}
                />
            </div>

            {/* Filters Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-slate-500" />
                            <CardTitle className="text-lg">Filter Logs</CardTitle>
                        </div>
                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={clearFilters}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <Select value={serviceFilter} onValueChange={setServiceFilter}>
                            <SelectTrigger className="w-full lg:w-[200px] border-slate-200 dark:border-slate-700">
                                <Server className="h-4 w-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Service" />
                            </SelectTrigger>
                            <SelectContent>
                                {SERVICES.map(service => (
                                    <SelectItem key={service.value} value={service.value}>
                                        <div className="flex items-center gap-2">
                                            <service.icon className="h-4 w-4" />
                                            {service.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={levelFilter} onValueChange={setLevelFilter}>
                            <SelectTrigger className="w-full lg:w-[180px] border-slate-200 dark:border-slate-700">
                                <AlertTriangle className="h-4 w-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                {LEVELS.map(level => (
                                    <SelectItem key={level.value} value={level.value}>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                level.color === "red" && "bg-red-500",
                                                level.color === "amber" && "bg-amber-500",
                                                level.color === "blue" && "bg-blue-500",
                                                level.color === "slate" && "bg-slate-400"
                                            )} />
                                            {level.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search logs by message, user, or service..."
                                className="pl-10 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-slate-600"
                                    onClick={() => setSearch("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs List */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">System Events</CardTitle>
                            <Badge variant="secondary" className="font-mono">
                                {logs.length} entries
                            </Badge>
                        </div>
                    </div>
                    <CardDescription>
                        View and analyze recent system activities and events
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"
                                />
                                <p className="text-slate-500 animate-pulse">Loading logs...</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"
                                >
                                    <FileText className="h-8 w-8 text-slate-400" />
                                </motion.div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                                    No logs found
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                    {hasActiveFilters 
                                        ? "No logs match your current filters. Try adjusting your search criteria."
                                        : "No system logs available at this time."}
                                </p>
                                {hasActiveFilters && (
                                    <Button 
                                        variant="outline" 
                                        onClick={clearFilters}
                                        className="mt-4 gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                <AnimatePresence>
                                    {logs.map((log, index) => (
                                        <motion.div
                                            key={log._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={cn(
                                                "group p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                                                expandedLog === log._id && "bg-slate-50 dark:bg-slate-800/50"
                                            )}
                                            onClick={() => toggleExpand(log._id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="mt-0.5 shrink-0">
                                                    {getLevelBadge(log.level)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {getServiceBadge(log.service)}
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpand(log._id);
                                                            }}
                                                        >
                                                            {expandedLog === log._id ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <p className={cn(
                                                        "text-sm text-slate-700 dark:text-slate-300",
                                                        expandedLog !== log._id && "truncate"
                                                    )}>
                                                        {log.message}
                                                    </p>
                                                    {log.user && (
                                                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                            <User className="h-3 w-3" />
                                                            <span>User: {log.user}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Expanded Details */}
                                                    <AnimatePresence>
                                                        {expandedLog === log._id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                                        <div>
                                                                            <span className="text-slate-500 block mb-1">Log ID</span>
                                                                            <span className="font-mono text-slate-700 dark:text-slate-300">{log._id}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500 block mb-1">Service</span>
                                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{log.service}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500 block mb-1">Level</span>
                                                                            <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{log.level}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500 block mb-1">Timestamp</span>
                                                                            <span className="font-mono text-slate-700 dark:text-slate-300">
                                                                                {new Date(log.timestamp).toISOString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
