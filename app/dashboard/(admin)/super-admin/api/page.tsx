"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, ApiStats } from "@/services/system.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, RefreshCw, Key, Shield, TrendingUp, Clock, Zap, Activity } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function ApiManagementPage() {
    const [stats, setStats] = useState<ApiStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await systemService.getApiStats();
            setStats(data);
        } catch (error) {
            toast.error("Failed to fetch API stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
                        <p className="text-muted-foreground">Monitor API usage, endpoints, and performance</p>
                    </div>
                    <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests (24h)</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.requests.total.toLocaleString()}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-500">
                                    {((stats?.requests.success || 0) / (stats?.requests.total || 1) * 100).toFixed(1)}% success
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.latency.avg}ms</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                P95: {stats?.latency.p95}ms | P99: {stats?.latency.p99}ms
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.errorRate}%</div>
                            <Progress value={stats?.errorRate || 0} max={5} className="h-2 mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.activeServices} / {stats?.totalServices}</div>
                            <p className="text-xs text-green-500 mt-1">All services responding</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Endpoint Performance Table */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Endpoint Performance</CardTitle>
                                    <CardDescription>Top endpoints by traffic volume</CardDescription>
                                </div>
                                {stats?.updatedAt && (
                                    <span className="text-xs text-muted-foreground">
                                        Updated: {new Date(stats.updatedAt).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Endpoint</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead className="text-right">Calls</TableHead>
                                        <TableHead className="text-right">Latency</TableHead>
                                        <TableHead className="text-right">Errors</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && !stats ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stats?.endpoints.map((ep, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Badge variant="outline" className={
                                                        ep.method === "GET" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                            ep.method === "POST" ? "bg-green-50 text-green-700 border-green-200" :
                                                                ep.method === "PUT" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                                    "bg-red-50 text-red-700 border-red-200"
                                                    }>{ep.method}</Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs max-w-[200px] truncate" title={ep.path}>
                                                    {ep.path}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{ep.service}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{ep.calls.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={ep.avgLatency > 150 ? "text-yellow-600" : "text-green-600"}>
                                                        {ep.avgLatency}ms
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={ep.errorRate > 1 ? "text-red-600 font-medium" : "text-green-600"}>
                                                        {ep.errorRate}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* API Access */}
                    <Card>
                        <CardHeader>
                            <CardTitle>API Access</CardTitle>
                            <CardDescription>Configured integrations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Frontend App</p>
                                        <p className="text-xs text-muted-foreground">localhost:3000</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-full">
                                        <Key className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Gateway</p>
                                        <p className="text-xs text-muted-foreground">localhost:8000</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 p-2 rounded-full">
                                        <Globe className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Mobile App</p>
                                        <p className="text-xs text-muted-foreground">Not configured</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">Pending</Badge>
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                                <Key className="h-4 w-4 mr-2" />
                                Generate API Key
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
