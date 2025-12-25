"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Building2,
    Users,
    Server,
    Activity,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Database,
    Cpu,
    HardDrive,
    Globe,
    Shield,
    Zap,
    ArrowUpRight,
    RefreshCw,
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

export default function SuperAdminDashboard() {
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

    const roleDistribution = [
        { name: "Students", value: 24500, color: "hsl(234, 89%, 59%)" },
        { name: "Teachers", value: 1850, color: "hsl(168, 76%, 42%)" },
        { name: "Admins", value: 280, color: "hsl(38, 92%, 50%)" },
        { name: "Moderators", value: 45, color: "hsl(199, 89%, 48%)" },
        { name: "Super Admins", value: 5, color: "hsl(0, 84%, 60%)" },
    ];

    const recentAlerts = [
        { id: 1, type: "critical", message: "Database connection pool reaching limit", time: "5m ago", org: "System" },
        { id: 2, type: "warning", message: "High API response time detected", time: "12m ago", org: "Lincoln HS" },
        { id: 3, type: "info", message: "New organization registered", time: "28m ago", org: "Oak Valley Academy" },
        { id: 4, type: "success", message: "Backup completed successfully", time: "1h ago", org: "System" },
        { id: 5, type: "warning", message: "Storage usage above 80%", time: "2h ago", org: "Metro University" },
    ];

    const organizations = [
        { name: "Lincoln High School", users: 2450, status: "active", growth: 12 },
        { name: "Metro University", users: 8200, status: "active", growth: 8 },
        { name: "Oak Valley Academy", users: 890, status: "pending", growth: 0 },
        { name: "Central Tech Institute", users: 3100, status: "active", growth: -3 },
        { name: "Riverside College", users: 4500, status: "active", growth: 15 },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a3d32]">System Overview</h1>
                        <p className="text-muted-foreground mt-1">
                            Complete platform monitoring and control center
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="destructive">
                            <Shield className="h-4 w-4 mr-2" />
                            Security Scan
                        </Button>
                    </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Organizations</p>
                                    <p className="text-2xl font-bold text-foreground">92</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">+18% this month</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-bold text-foreground">28,680</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">+2,450 this month</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
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

                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                                    <p className="text-2xl font-bold text-foreground">7</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                        <span className="text-xs text-yellow-600">2 critical, 5 warnings</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Resources & Growth */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Resources */}
                    <Card>
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
                                    <div className="text-center p-3 rounded-lg bg-gray-50">
                                        <Cpu className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                                        <p className="text-2xl font-bold text-foreground">52%</p>
                                        <p className="text-xs text-muted-foreground">CPU Usage</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-gray-50">
                                        <Database className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                                        <p className="text-2xl font-bold text-foreground">65%</p>
                                        <p className="text-xs text-muted-foreground">Memory</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-gray-50">
                                        <HardDrive className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
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
                                                    backgroundColor: "white",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f633" />
                                            <Area type="monotone" dataKey="memory" stroke="#10b981" fill="#10b98133" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organization Growth */}
                    <Card>
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
                                                backgroundColor: "white",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Line yAxisId="left" type="monotone" dataKey="organizations" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                                        <Line yAxisId="right" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts & Organizations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Alerts */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Alerts</CardTitle>
                                <Button variant="ghost" size="sm">View All</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${alert.type === "critical" ? "bg-red-100" :
                                            alert.type === "warning" ? "bg-yellow-100" :
                                                alert.type === "success" ? "bg-green-100" : "bg-blue-100"
                                            }`}>
                                            {alert.type === "critical" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                            {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                            {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                                            {alert.type === "info" && <Activity className="h-4 w-4 text-blue-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{alert.message}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">{alert.org}</span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground">{alert.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organizations */}
                    <Card className="lg:col-span-2">
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
                                {organizations.map((org, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{org.name}</p>
                                                <p className="text-sm text-muted-foreground">{org.users.toLocaleString()} users</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className={
                                                org.status === "active" ? "bg-green-100 text-green-600 border-green-200" :
                                                    "bg-yellow-100 text-yellow-600 border-yellow-200"
                                            }>
                                                {org.status}
                                            </Badge>
                                            {org.growth !== 0 && (
                                                <div className={`flex items-center gap-1 ${org.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {org.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                    <span className="text-sm font-medium">{Math.abs(org.growth)}%</span>
                                                </div>
                                            )}
                                            <Button variant="ghost" size="icon">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Role Distribution</CardTitle>
                        <CardDescription>Breakdown of users across all organizations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={roleDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {roleDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {roleDistribution.map((role, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                                            <span className="text-sm text-foreground">{role.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-foreground">{role.value.toLocaleString()}</span>
                                            <Progress
                                                value={(role.value / 28680) * 100}
                                                className="w-24 h-2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
