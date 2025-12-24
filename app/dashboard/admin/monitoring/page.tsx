"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealth } from "@/components/dashboard/widgets/SystemHealth";
import { MetricsDashboard } from "@/components/dashboard/widgets/MetricsDashboard";
import { AlertsDashboard } from "@/components/dashboard/widgets/AlertsDashboard";
import { Activity, AlertTriangle, BarChart3, Server } from "lucide-react";

export default function MonitoringPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
                        System Monitoring
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor system health, performance metrics, and alerts
                    </p>
                </div>

                <Tabs defaultValue="health" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                        <TabsTrigger value="health" className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            Health
                        </TabsTrigger>
                        <TabsTrigger value="metrics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Metrics
                        </TabsTrigger>
                        <TabsTrigger value="alerts" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Alerts
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="health" className="space-y-4">
                        <SystemHealth />
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-4">
                        <MetricsDashboard />
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4">
                        <AlertsDashboard />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
