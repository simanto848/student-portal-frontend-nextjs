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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, serviceFilter, levelFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await systemService.getLogs({
                service: serviceFilter === "all" ? undefined : serviceFilter,
                level: levelFilter === "all" ? undefined : levelFilter,
                search: search || undefined
            });
            setLogs(data);
        } catch (error) {
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    };

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
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>System Events</CardTitle>
                                <CardDescription>View recent system activities</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Services</SelectItem>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                                        <SelectItem value="LIBRARY">Library</SelectItem>
                                        <SelectItem value="ENROLLMENT">Enrollment</SelectItem>
                                        <SelectItem value="CLASSROOM">Classroom</SelectItem>
                                        <SelectItem value="NOTIFICATION">Notification</SelectItem>
                                        <SelectItem value="COMMUNICATION">Communication</SelectItem>
                                        <SelectItem value="GATEWAY">Gateway</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={levelFilter} onValueChange={setLevelFilter}>
                                    <SelectTrigger className="w-full sm:w-[120px]">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="warn">Warning</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full sm:w-auto">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        className="pl-8 w-full sm:w-[250px]"
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
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No logs found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log._id}>
                                                <TableCell className="font-mono text-xs">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell>{getLevelBadge(log.level)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono">
                                                        {log.service}
                                                    </Badge>
                                                </TableCell>
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
