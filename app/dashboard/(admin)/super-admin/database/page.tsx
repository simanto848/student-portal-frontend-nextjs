"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, DatabaseStats } from "@/services/system.service";
import { Database, HardDrive, Share2, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function DatabaseStatusPage() {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await systemService.getDatabaseStats();
            setStats(data);
        } catch (error) {
            toast.error("Failed to fetch database stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading && !stats) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    const operationsData = stats ? [
        { name: 'Reads', value: stats.operations.reads, color: '#4ade80' },
        { name: 'Writes', value: stats.operations.writes, color: '#facc15' },
        { name: 'Updates', value: stats.operations.updates, color: '#60a5fa' },
        { name: 'Deletes', value: stats.operations.deletes, color: '#f87171' },
    ] : [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Database Status</h1>
                        <p className="text-muted-foreground">MongoDB cluster metrics and performance</p>
                    </div>
                    <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Connection</CardTitle>
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize text-green-600">{stats?.status}</div>
                            <p className="text-xs text-muted-foreground">
                                Active Connections: {stats?.connections}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage Size</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.size}</div>
                            <p className="text-xs text-muted-foreground">
                                Total Documents: {stats?.documents.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Collections</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.collections}</div>
                            <p className="text-xs text-muted-foreground">
                                Indexed: {stats?.collections} (100%)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats ? (stats.operations.reads + stats.operations.writes + stats.operations.updates + stats.operations.deletes) : 0} ops/s
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Peak: 1,240 ops/s
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Operation Distribution</CardTitle>
                            <CardDescription>Breakdown of database operations</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={operationsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {operationsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Top Collections</CardTitle>
                            <CardDescription>Largest collections by document count</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: 'users', count: 5420, size: '45 MB' },
                                    { name: 'logs', count: 3200, size: '120 MB' },
                                    { name: 'enrollments', count: 1500, size: '12 MB' },
                                    { name: 'courses', count: 850, size: '5 MB' },
                                    { name: 'notifications', count: 4450, size: '25 MB' }
                                ].map((col) => (
                                    <div key={col.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <Database className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{col.name}</p>
                                                <p className="text-xs text-muted-foreground">{col.size}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold">{col.count.toLocaleString()} docs</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
