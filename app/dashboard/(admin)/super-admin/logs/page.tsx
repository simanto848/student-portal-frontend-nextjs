"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, ActivityLog } from "@/services/system.service";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await systemService.getLogs();
            setLogs(data);
            setFilteredLogs(data);
        } catch (error) {
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        const lowerSearch = search.toLowerCase();
        const filtered = logs.filter(log =>
            log.message.toLowerCase().includes(lowerSearch) ||
            log.service.toLowerCase().includes(lowerSearch) ||
            log.user.toLowerCase().includes(lowerSearch)
        );
        setFilteredLogs(filtered);
    }, [search, logs]);

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'error': return <Badge variant="destructive">Error</Badge>;
            case 'warn': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Warning</Badge>;
            default: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Info</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                    <p className="text-muted-foreground">System audit trail and event history</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>System Events</CardTitle>
                                <CardDescription>View recent system activities</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        className="pl-8 w-[250px]"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={fetchLogs}>
                                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>User</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No logs found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-mono text-xs">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell>{getLevelBadge(log.level)}</TableCell>
                                                <TableCell>{log.service}</TableCell>
                                                <TableCell className="max-w-[400px] truncate" title={log.message}>
                                                    {log.message}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{log.user}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
