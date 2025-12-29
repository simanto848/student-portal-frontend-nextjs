"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, ApiStats } from "@/services/system.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, RefreshCw, Key, Shield } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
                        <p className="text-muted-foreground">Monitor API usage, keys, and performance</p>
                    </div>
                    <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.requests.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-500 font-medium">99.2%</span> success rate (24h)
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.latency.avg}ms</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                P95: {stats?.latency.p95}ms
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
                            <Key className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                3 expiring soon
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Endpoint Performance Table */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Endpoint Performance</CardTitle>
                            <CardDescription>Top endpoints by traffic volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Path</TableHead>
                                        <TableHead>Calls (24h)</TableHead>
                                        <TableHead>Error Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                                        </TableRow>
                                    ) : stats?.endpoints.map((ep, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Badge variant="outline">{ep.method}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{ep.path}</TableCell>
                                            <TableCell>{ep.calls.toLocaleString()}</TableCell>
                                            <TableCell className={parseFloat(ep.errorRate) > 1 ? "text-red-500 font-bold" : "text-green-600"}>
                                                {ep.errorRate}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* API Keys Management (Mock UI) */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>API Access</CardTitle>
                            <CardDescription>Manage third-party access</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Mobile App</p>
                                        <p className="text-xs text-muted-foreground">Read/Write</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-full">
                                        <Shield className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Payment Gateway</p>
                                        <p className="text-xs text-muted-foreground">Webhook</p>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                            </div>
                            <Button variant="outline" className="w-full mt-4">Generate New Key</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
