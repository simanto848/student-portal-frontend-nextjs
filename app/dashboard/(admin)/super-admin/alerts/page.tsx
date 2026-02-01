"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertCircle,
    AlertTriangle,
    Info,
    CheckCircle,
    RefreshCw,
    Search,
    X,
    Bell,
    Clock,
    Shield,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/contexts/AlertsContext";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SystemAlertsPage() {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const { alerts, refreshCount, dismissAlert, dismissAll } = useAlerts();

    const handleRefresh = async () => {
        setLoading(true);
        await refreshCount();
        setTimeout(() => setLoading(false), 500);
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
            case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'critical': return "border-red-200 bg-red-50/80 dark:bg-red-900/10 dark:border-red-900/30 hover:bg-red-100/80 dark:hover:bg-red-900/20";
            case 'warning': return "border-amber-200 bg-amber-50/80 dark:bg-amber-900/10 dark:border-amber-900/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/20";
            case 'success': return "border-green-200 bg-green-50/80 dark:bg-green-900/10 dark:border-green-900/30 hover:bg-green-100/80 dark:hover:bg-green-900/20";
            default: return "border-blue-200 bg-blue-50/80 dark:bg-blue-900/10 dark:border-blue-900/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/20";
        }
    };

    const counts = {
        all: alerts.length,
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length
    };

    const hasCritical = counts.critical > 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title="System Alerts"
                subtitle="Monitor critical system events, warnings, and notifications"
                icon={Shield}
                extraActions={
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={handleRefresh} 
                            variant="outline" 
                            size="sm"
                            className="gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                        <Button
                            onClick={handleMarkAllRead}
                            size="sm"
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md"
                            disabled={alerts.length === 0}
                        >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Mark All Read</span>
                        </Button>
                    </div>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Alerts"
                    value={counts.all}
                    icon={Bell}
                    className="border-l-4 border-l-slate-400"
                    iconClassName="text-slate-500"
                    iconBgClassName="bg-slate-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Critical"
                    value={counts.critical}
                    icon={AlertCircle}
                    className="border-l-4 border-l-red-500"
                    iconClassName="text-red-500"
                    iconBgClassName="bg-red-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Warnings"
                    value={counts.warning}
                    icon={AlertTriangle}
                    className="border-l-4 border-l-amber-500"
                    iconClassName="text-amber-500"
                    iconBgClassName="bg-amber-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Info"
                    value={counts.info}
                    icon={Info}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-500"
                    iconBgClassName="bg-blue-500/10"
                    loading={loading}
                />
            </div>

            {/* Critical Alert Banner */}
            <AnimatePresence>
                {hasCritical && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
                    >
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800 dark:text-red-200">
                                {counts.critical} Critical Alert{counts.critical > 1 ? 's' : ''} Require Attention
                            </h3>
                            <p className="text-sm text-red-600 dark:text-red-300">
                                Critical system issues need immediate resolution
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("critical")}
                            className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                            View Critical
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters and Controls */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                            <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-slate-100 dark:bg-slate-900 p-1">
                                <TabsTrigger 
                                    value="all" 
                                    className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm"
                                >
                                    All 
                                    <Badge variant="secondary" className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                        {counts.all}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="critical" 
                                    className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-red-600"
                                >
                                    Critical 
                                    <Badge className="ml-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100">
                                        {counts.critical}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="warning" 
                                    className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-amber-600"
                                >
                                    Warning 
                                    <Badge className="ml-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100">
                                        {counts.warning}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="info" 
                                    className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                                >
                                    Info 
                                    <Badge className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100">
                                        {counts.info}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative w-full lg:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search alerts..."
                                className="pl-10 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-slate-600"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="border-slate-200 dark:border-slate-800">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"
                            />
                            <p className="text-slate-500 animate-pulse">Scanning system status...</p>
                        </CardContent>
                    </Card>
                ) : filteredAlerts.length === 0 ? (
                    <Card className="border-dashed border-slate-300 dark:border-slate-700 shadow-none bg-slate-50/50 dark:bg-slate-900/50">
                        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="h-20 w-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                            >
                                <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                            </motion.div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                No alerts found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                                {searchQuery
                                    ? `No results matching "${searchQuery}" in ${activeTab} category.`
                                    : "Your system is running smoothly. No active alerts to display."}
                            </p>
                            {searchQuery && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setSearchQuery("")}
                                    className="gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredAlerts.map((alert, index) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                        className={cn(
                                            "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
                                            getAlertStyles(alert.type)
                                        )}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                                                        {alert.type} Alert
                                                    </h4>
                                                    {alert.type === 'critical' && (
                                                        <Badge className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                                                            Urgent
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 bg-white/60 dark:bg-slate-950/30 px-2 py-1 rounded-md shrink-0">
                                                    <Clock className="h-3 w-3" />
                                                    {alert.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {alert.message}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 -mr-2 -mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0"
                                            onClick={() => handleDismiss(alert.id)}
                                            title="Dismiss Alert"
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Dismiss</span>
                                        </Button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
