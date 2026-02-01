"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, DatabaseStats, DatabaseInfo } from "@/services/system.service";
import { Database, HardDrive, Share2, Activity, RefreshCw, FolderOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function DatabaseStatusPage() {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDbName, setSelectedDbName] = useState<string>("");

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await systemService.getDatabaseStats();
            setStats(data);
            // Select the first database by default if none selected
            if (!selectedDbName && data.databases && data.databases.length > 0) {
                // Prefer user service db or first one
                const defaultDb = data.databases.find(db => db.name.includes("user")) || data.databases[0];
                setSelectedDbName(defaultDb.name);
            }
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

    const selectedDb = stats?.databases?.find(db => db.name === selectedDbName);

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
                    <div className="flex items-center gap-4">
                        {stats?.databases && (
                            <Select value={selectedDbName} onValueChange={setSelectedDbName}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select Database" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stats.databases.map((db) => (
                                        <SelectItem key={db.name} value={db.name}>
                                            <div className="flex items-center gap-2">
                                                <Database className="h-4 w-4 text-muted-foreground" />
                                                <span>{db.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Global Cluster Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Global Status</CardTitle>
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
                            <CardTitle className="text-sm font-medium">Cluster Operations</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats ? (stats.operations.reads + stats.operations.writes + stats.operations.updates + stats.operations.deletes).toLocaleString() : 0} ops
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total operations since restart
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Selected DB Size</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{selectedDb?.storageSize || "N/A"}</div>
                            <p className="text-xs text-muted-foreground">
                                Data Size: {selectedDb?.dataSize || "N/A"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Collections</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{selectedDb?.collections || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Objects: {selectedDb?.objects.toLocaleString() || 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Operation Distribution</CardTitle>
                            <CardDescription>Global breakdown of database operations</CardDescription>
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

                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Collection Details - {selectedDbName}</CardTitle>
                            <CardDescription>Detailed statistics for collections in {selectedDbName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[200px]">Collection Name</TableHead>
                                            <TableHead className="text-right">Documents</TableHead>
                                            <TableHead className="text-right">Size</TableHead>
                                            <TableHead className="text-right">Storage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedDb?.collectionDetails?.length ? (
                                            selectedDb.collectionDetails.map((col) => (
                                                <TableRow key={col.name}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <FolderOpen className="h-4 w-4 text-blue-500" />
                                                            {col.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{col.count.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">{col.size}</TableCell>
                                                    <TableCell className="text-right">{col.storageSize}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No collections found in this database.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
