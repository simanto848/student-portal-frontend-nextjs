"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealth } from "@/components/dashboard/widgets/SystemHealth";
import { MetricsDashboard } from "@/components/dashboard/widgets/MetricsDashboard";
import { AlertsDashboard } from "@/components/dashboard/widgets/AlertsDashboard";
import { 
    Activity, 
    AlertTriangle, 
    BarChart3, 
    Server,
    RefreshCw,
    Bell,
    TrendingUp,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function MonitoringPage() {
    const [activeTab, setActiveTab] = useState("health");
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const handleRefresh = () => {
        setLastRefresh(new Date());
        // The widgets will auto-refresh via their own intervals
    };

    const tabs = [
        { 
            value: "health", 
            label: "Health", 
            icon: Server,
            description: "Real-time system health and service status",
            color: "blue"
        },
        { 
            value: "metrics", 
            label: "Metrics", 
            icon: BarChart3,
            description: "Performance metrics and gateway statistics",
            color: "green"
        },
        { 
            value: "alerts", 
            label: "Alerts", 
            icon: AlertTriangle,
            description: "System alerts and notifications",
            color: "amber"
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title="System Monitoring"
                subtitle="Comprehensive monitoring dashboard for system health, metrics, and alerts"
                icon={Activity}
                extraActions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                            <RefreshCw className="h-4 w-4" />
                            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                        </div>
                        <Button 
                            onClick={handleRefresh}
                            variant="outline" 
                            size="sm"
                            className="gap-2 border-slate-200 dark:border-slate-700"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                }
            />

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">System Health</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Monitoring</p>
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Metrics</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Real-time</p>
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        Live
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Alert System</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Active</p>
                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        5s Interval
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs 
                defaultValue="health" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
            >
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="p-2">
                        <TabsList className="grid w-full grid-cols-3 lg:w-[600px] bg-slate-100 dark:bg-slate-900 p-1">
                            {tabs.map((tab) => (
                                <TabsTrigger 
                                    key={tab.value}
                                    value={tab.value} 
                                    className={cn(
                                        "flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all",
                                        activeTab === tab.value && tab.color === "blue" && "data-[state=active]:text-blue-600",
                                        activeTab === tab.value && tab.color === "green" && "data-[state=active]:text-green-600",
                                        activeTab === tab.value && tab.color === "amber" && "data-[state=active]:text-amber-600"
                                    )}
                                >
                                    <tab.icon className={cn(
                                        "h-4 w-4",
                                        activeTab === tab.value && tab.color === "blue" && "text-blue-500",
                                        activeTab === tab.value && tab.color === "green" && "text-green-500",
                                        activeTab === tab.value && tab.color === "amber" && "text-amber-500"
                                    )} />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </CardContent>
                </Card>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <TabsContent value="health" className="space-y-4 mt-0">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    <CardTitle>System Health Monitor</CardTitle>
                                </div>
                                <CardDescription>
                                    Monitor the health status of all system services in real-time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <SystemHealth />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-4 mt-0">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-green-500" />
                                    <CardTitle>Performance Metrics</CardTitle>
                                </div>
                                <CardDescription>
                                    Gateway metrics, request statistics, and service performance data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <MetricsDashboard />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4 mt-0">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    <CardTitle>System Alerts</CardTitle>
                                </div>
                                <CardDescription>
                                    View and manage system alerts and notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <AlertsDashboard />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </motion.div>
            </Tabs>

            {/* Footer Info */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span>Auto-refresh active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                <span>Health: 5s • Metrics: 5s • Alerts: 10s</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span>Monitoring Dashboard v1.0</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
