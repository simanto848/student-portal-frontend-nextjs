"use client";
import { useEffect, useState } from "react";
import { systemService, DatabaseStats } from "@/services/system.service";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Users,
    Server,
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Database,
    Cpu,
    HardDrive,
    Globe,
    Shield,
    Zap,
    RefreshCw,
    ArrowUpRight,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Progress } from "@/components/ui/progress";

const systemMetrics = [
    { time: "00:00", cpu: 45, memory: 62, requests: 1200 },
    { time: "04:00", cpu: 32, memory: 58, requests: 800 },
    { time: "08:00", cpu: 68, memory: 71, requests: 3200 },
    { time: "12:00", cpu: 82, memory: 78, requests: 4500 },
    { time: "16:00", cpu: 75, memory: 74, requests: 3800 },
    { time: "20:00", cpu: 58, memory: 68, requests: 2100 },
    { time: "Now", cpu: 52, memory: 65, requests: 1800 },
];

const organizationGrowth = [
    { month: "Jul", organizations: 45, users: 12000 },
    { month: "Aug", organizations: 52, users: 14500 },
    { month: "Sep", organizations: 58, users: 16200 },
    { month: "Oct", organizations: 67, users: 19800 },
    { month: "Nov", organizations: 78, users: 24100 },
    { month: "Dec", organizations: 92, users: 28500 },
];

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dbStats, orgs, systemAlerts] = await Promise.all([
                systemService.getDatabaseStats(),
                systemService.getOrganizations(),
                systemService.getAlerts()
            ]);
            setStats(dbStats);
            setOrganizations(orgs);
            setAlerts(systemAlerts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
                        <p className="text-muted-foreground mt-1">
                            Complete platform monitoring and control center
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button className="bg-destructive hover:bg-destructive/90">
                            <Shield className="h-4 w-4 mr-2" />
                            Security Scan
                        </Button>
                    </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-destructive shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Organizations</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {loading ? "..." : (stats?.counts?.organizations || 0)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">Active</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-destructive" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {loading ? "..." : (stats?.counts?.totalUsers?.toLocaleString() || 0)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">Registered</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-600 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">System Uptime</p>
                                    <p className="text-2xl font-bold text-foreground">99.98%</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">All systems operational</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                                    <Server className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {loading ? "..." : alerts.length}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                                        <span className="text-xs text-amber-500">System generated</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Resources & Growth */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Resources */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>System Resources</CardTitle>
                                    <CardDescription>Real-time server performance</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Healthy
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 rounded-lg bg-muted/50">
                                        <Cpu className="h-5 w-5 mx-auto text-primary mb-1" />
                                        <p className="text-2xl font-bold text-foreground">52%</p>
                                        <p className="text-xs text-muted-foreground">CPU Usage</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-muted/50">
                                        <Database className="h-5 w-5 mx-auto text-indigo-500 mb-1" />
                                        <p className="text-2xl font-bold text-foreground">65%</p>
                                        <p className="text-xs text-muted-foreground">Memory</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-muted/50">
                                        <HardDrive className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                                        <p className="text-2xl font-bold text-foreground">78%</p>
                                        <p className="text-xs text-muted-foreground">Storage</p>
                                    </div>
                                </div>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={systemMetrics}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="time" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Area type="monotone" dataKey="cpu" stroke="hsl(234, 89%, 59%)" fill="hsl(234, 89%, 59%)" fillOpacity={0.2} />
                                            <Area type="monotone" dataKey="memory" stroke="hsl(168, 76%, 42%)" fill="hsl(168, 76%, 42%)" fillOpacity={0.2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organization Growth */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Platform Growth</CardTitle>
                            <CardDescription>Organizations and user acquisition</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={organizationGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Line yAxisId="left" type="monotone" dataKey="organizations" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ fill: "hsl(0, 84%, 60%)" }} />
                                        <Line yAxisId="right" type="monotone" dataKey="users" stroke="hsl(234, 89%, 59%)" strokeWidth={2} dot={{ fill: "hsl(234, 89%, 59%)" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts & Organizations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Alerts */}
                    <Card className="lg:col-span-1 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Alerts</CardTitle>
                                <Button variant="ghost" size="sm">View All</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-4 text-muted-foreground">Loading alerts...</div>
                                ) : (
                                    alerts.length > 0 ? alerts.map((alert) => (
                                        <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${alert.type === "critical" ? "bg-destructive/10" :
                                                alert.type === "warning" ? "bg-amber-100" :
                                                    alert.type === "success" ? "bg-green-100" : "bg-blue-100"
                                                }`}>
                                                {alert.type === "critical" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                                {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                                                {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                {alert.type === "info" && <Activity className="h-4 w-4 text-blue-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{alert.message}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground">System</span>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 text-muted-foreground">No recent alerts</div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organizations */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Organizations Overview</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Manage All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-4 text-muted-foreground">Loading organizations...</div>
                                ) : (
                                    organizations.length > 0 ? organizations.map((org, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{org.name}</p>
                                                    <p className="text-sm text-muted-foreground">{org.users.toLocaleString()} users</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className={
                                                    org.status === "active" ? "bg-green-100 text-green-700 border-green-200" :
                                                        "bg-amber-100 text-amber-700 border-amber-200"
                                                }>
                                                    {org.status}
                                                </Badge>

                                                <Button variant="ghost" size="icon">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 text-muted-foreground">No organizations found</div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Distribution */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>User Role Distribution</CardTitle>
                        <CardDescription>Breakdown of users across all roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats?.breakdown || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="count"
                                            >
                                                {stats?.breakdown?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3">
                                    {stats?.breakdown?.map((role, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                                                <span className="text-sm text-foreground">{role.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-foreground">{role.count.toLocaleString()}</span>
                                                <Progress
                                                    value={(role.count / (stats.counts.totalUsers || 1)) * 100}
                                                    className="w-24 h-2"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
