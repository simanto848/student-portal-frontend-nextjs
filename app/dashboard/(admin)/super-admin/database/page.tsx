"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, DatabaseStats } from "@/services/system.service";
import { 
    Database, 
    HardDrive, 
    Share2, 
    Activity, 
    RefreshCw, 
    FolderOpen, 
    Layers,
    Server,
    TrendingUp,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip, 
    Legend
} from 'recharts';

export default function DatabaseStatusPage() {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDbName, setSelectedDbName] = useState<string>("");

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await systemService.getDatabaseStats();
            setStats(data);
            
            // Select the first database by default if none selected
            if (!selectedDbName && data.databases && data.databases.length > 0) {
                const defaultDb = data.databases.find(db => db.name.includes("user")) || data.databases[0];
                setSelectedDbName(defaultDb.name);
            }
        } catch (err) {
            console.error("Failed to fetch database stats:", err);
            toast.error("Failed to fetch database stats");
        } finally {
            setLoading(false);
        }
    }, [selectedDbName]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const selectedDb = stats?.databases?.find(db => db.name === selectedDbName);

    const operationsData = stats ? [
        { name: 'Reads', value: stats.operations.reads, color: '#10b981', icon: FileText },
        { name: 'Writes', value: stats.operations.writes, color: '#f59e0b', icon: Activity },
        { name: 'Updates', value: stats.operations.updates, color: '#3b82f6', icon: RefreshCw },
        { name: 'Deletes', value: stats.operations.deletes, color: '#ef4444', icon: HardDrive },
    ] : [];

    const totalOperations = stats ? 
        stats.operations.reads + stats.operations.writes + stats.operations.updates + stats.operations.deletes : 0;

    const getStatusColor = (status?: string) => {
        if (!status) return "slate";
        if (status.toLowerCase().includes("connected") || status.toLowerCase().includes("ok")) return "green";
        if (status.toLowerCase().includes("degraded")) return "amber";
        return "red";
    };

    const statusColor = getStatusColor(stats?.status);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title="Database Status"
                subtitle="MongoDB cluster metrics, performance monitoring, and collection statistics"
                icon={Database}
                extraActions={
                    <div className="flex items-center gap-2">
                        {stats?.databases && stats.databases.length > 0 && (
                            <Select value={selectedDbName} onValueChange={setSelectedDbName}>
                                <SelectTrigger className="w-[200px] border-slate-200 dark:border-slate-700">
                                    <Database className="h-4 w-4 mr-2 text-slate-500" />
                                    <SelectValue placeholder="Select Database" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stats.databases.map((db) => (
                                        <SelectItem key={db.name} value={db.name}>
                                            <div className="flex items-center gap-2">
                                                <Database className="h-4 w-4 text-slate-500" />
                                                <span>{db.name}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {db.collections} cols
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button 
                            onClick={fetchStats} 
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
                    title="Cluster Status"
                    value={stats?.status ? stats.status.charAt(0).toUpperCase() + stats.status.slice(1) : "Unknown"}
                    icon={Share2}
                    className={cn(
                        "border-l-4",
                        statusColor === "green" ? "border-l-green-500" : 
                        statusColor === "amber" ? "border-l-amber-500" : "border-l-red-500"
                    )}
                    iconClassName={cn(
                        statusColor === "green" ? "text-green-500" : 
                        statusColor === "amber" ? "text-amber-500" : "text-red-500"
                    )}
                    iconBgClassName={cn(
                        statusColor === "green" ? "bg-green-500/10" : 
                        statusColor === "amber" ? "bg-amber-500/10" : "bg-red-500/10"
                    )}
                    description={`${stats?.connections || 0} active connections`}
                    loading={loading}
                />
                <StatsCard
                    title="Total Operations"
                    value={totalOperations.toLocaleString()}
                    icon={Activity}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-500"
                    iconBgClassName="bg-blue-500/10"
                    description="Since last restart"
                    loading={loading}
                />
                <StatsCard
                    title="Storage Size"
                    value={selectedDb?.storageSize || "N/A"}
                    icon={HardDrive}
                    className="border-l-4 border-l-purple-500"
                    iconClassName="text-purple-500"
                    iconBgClassName="bg-purple-500/10"
                    description={`Data: ${selectedDb?.dataSize || "N/A"}`}
                    loading={loading}
                />
                <StatsCard
                    title="Collections"
                    value={selectedDb?.collections || 0}
                    icon={Layers}
                    className="border-l-4 border-l-indigo-500"
                    iconClassName="text-indigo-500"
                    iconBgClassName="bg-indigo-500/10"
                    description={`${selectedDb?.objects.toLocaleString() || 0} documents`}
                    loading={loading}
                />
            </div>

            {/* Operations Chart & Collection Details */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Operations Distribution */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-slate-500" />
                            Operation Distribution
                        </CardTitle>
                        <CardDescription>
                            Global breakdown of database operations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {stats && totalOperations > 0 ? (
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={operationsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {operationsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                                borderRadius: '8px', 
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={36}
                                            iconType="circle"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <div className="text-center">
                                    <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No operation data available</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Operation Stats */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {operationsData.map((op) => (
                                <div key={op.name} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div 
                                        className="h-3 w-3 rounded-full shrink-0" 
                                        style={{ backgroundColor: op.color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500">{op.name}</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {op.value.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Collection Details */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FolderOpen className="h-5 w-5 text-slate-500" />
                                <CardTitle className="text-lg">
                                    Collection Details - {selectedDbName || "Select Database"}
                                </CardTitle>
                            </div>
                            {selectedDb && (
                                <Badge variant="outline" className="font-mono">
                                    {selectedDb.collections} collections
                                </Badge>
                            )}
                        </div>
                        <CardDescription>
                            Detailed statistics for collections in {selectedDbName || "selected database"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            {selectedDb?.collectionDetails?.length ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {selectedDb.collectionDetails.map((col, index) => (
                                        <motion.div
                                            key={col.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {col.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {col.count.toLocaleString()} documents
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-right">
                                                <div>
                                                    <p className="text-xs text-slate-500">Size</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                                                        {col.size}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Storage</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                                                        {col.storageSize}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <FolderOpen className="h-16 w-16 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                                        No collections found
                                    </h3>
                                    <p className="text-slate-500 max-w-sm">
                                        {selectedDbName 
                                            ? "No collections available in this database."
                                            : "Please select a database to view collections."}
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Database Overview */}
            {stats?.databases && stats.databases.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-slate-500" />
                            <CardTitle className="text-lg">Database Overview</CardTitle>
                        </div>
                        <CardDescription>
                            Summary of all databases in the cluster
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[300px]">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {stats.databases.map((db, index) => (
                                    <motion.div
                                        key={db.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                                            selectedDbName === db.name && "bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-indigo-500"
                                        )}
                                        onClick={() => setSelectedDbName(db.name)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {db.name}
                                                    </p>
                                                    {selectedDbName === db.name && (
                                                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                            Selected
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {db.collections} collections • {db.objects.toLocaleString()} objects
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-right">
                                            <div>
                                                <p className="text-xs text-slate-500">Storage</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                                                    {db.storageSize}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Data Size</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                                                    {db.dataSize}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
