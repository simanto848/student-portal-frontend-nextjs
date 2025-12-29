"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Flag,
    MessageSquare,
    Users,
    CheckCircle,
    AlertTriangle,
    Clock,
    TrendingUp,
    TrendingDown,
    Eye,
    Shield,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    Filter,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const reportsTrend = [
    { day: "Mon", reports: 12, resolved: 10 },
    { day: "Tue", reports: 18, resolved: 15 },
    { day: "Wed", reports: 8, resolved: 12 },
    { day: "Thu", reports: 22, resolved: 18 },
    { day: "Fri", reports: 15, resolved: 14 },
    { day: "Sat", reports: 5, resolved: 8 },
    { day: "Sun", reports: 3, resolved: 5 },
];

const reportCategories = [
    { name: "Inappropriate Content", value: 35, color: "hsl(0, 84%, 60%)" },
    { name: "Spam", value: 28, color: "hsl(38, 92%, 50%)" },
    { name: "Harassment", value: 18, color: "hsl(258, 90%, 66%)" },
    { name: "Copyright", value: 12, color: "hsl(199, 89%, 48%)" },
    { name: "Other", value: 7, color: "hsl(215, 16%, 47%)" },
];

const resolutionTime = [
    { hour: "0-1h", count: 45 },
    { hour: "1-4h", count: 32 },
    { hour: "4-8h", count: 18 },
    { hour: "8-24h", count: 12 },
    { hour: ">24h", count: 5 },
];

const pendingReports = [
    { id: 1, type: "content", title: "Inappropriate quiz question", reporter: "John D.", priority: "high", time: "10m ago" },
    { id: 2, type: "spam", title: "Repetitive forum posts", reporter: "Sarah M.", priority: "medium", time: "25m ago" },
    { id: 3, type: "harassment", title: "Offensive comment on discussion", reporter: "Mike R.", priority: "high", time: "45m ago" },
    { id: 4, type: "copyright", title: "Copied material in assignment", reporter: "Lisa K.", priority: "low", time: "1h ago" },
    { id: 5, type: "spam", title: "Promotional links in bio", reporter: "Tom H.", priority: "medium", time: "2h ago" },
];

const recentActions = [
    { id: 1, action: "Warning Issued", target: "User @jake_92", reason: "Inappropriate language", time: "15m ago", moderator: "You" },
    { id: 2, action: "Content Removed", target: "Post #4521", reason: "Spam content", time: "32m ago", moderator: "You" },
    { id: 3, action: "Account Suspended", target: "User @spammer123", reason: "Multiple violations", time: "1h ago", moderator: "Alex M." },
    { id: 4, action: "Report Dismissed", target: "Post #4518", reason: "No violation found", time: "2h ago", moderator: "You" },
];

const supportQueue = [
    { id: 1, user: "Emily Chen", issue: "Can't access course materials", status: "waiting", time: "5m" },
    { id: 2, user: "David Kim", issue: "Quiz submission error", status: "in_progress", time: "12m" },
    { id: 3, user: "Rachel Green", issue: "Account recovery help", status: "waiting", time: "18m" },
    { id: 4, user: "Mark Wilson", issue: "Grade discrepancy", status: "waiting", time: "25m" },
];

const ModeratorDashboard = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Moderation Center</h1>
                        <p className="mt-1 text-muted-foreground">
                            Content review and user support dashboard
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm">
                            <Flag className="h-4 w-4 mr-2" />
                            Review Queue (15)
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending Reports</p>
                                    <p className="text-2xl font-bold text-foreground">15</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-red-500" />
                                        <span className="text-xs text-red-500">+5 from yesterday</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                                    <Flag className="h-6 w-6 text-red-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Messages to Review</p>
                                    <p className="text-2xl font-bold text-foreground">7</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingDown className="h-3 w-3 text-emerald-500" />
                                        <span className="text-xs text-emerald-500">-3 from yesterday</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Support Queue</p>
                                    <p className="text-2xl font-bold text-foreground">4</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="h-3 w-3 text-amber-500" />
                                        <span className="text-xs text-amber-500">Avg wait: 15m</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Resolved Today</p>
                                    <p className="text-2xl font-bold text-foreground">28</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                                        <span className="text-xs text-emerald-500">92% resolution rate</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reports Trend */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Weekly Reports Overview</CardTitle>
                            <CardDescription>New reports vs resolved</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={reportsTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                                color: "#0f172a"
                                            }}
                                        />
                                        <Line type="monotone" dataKey="reports" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} name="New Reports" />
                                        <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} name="Resolved" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resolution Time */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Resolution Time Distribution</CardTitle>
                            <CardDescription>How quickly reports are resolved</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={resolutionTime}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                                color: "#0f172a"
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Reports & Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Reports */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Pending Reports</CardTitle>
                                <Button variant="outline" size="sm" className="text-slate-600 border-slate-200">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingReports.map((report) => (
                                    <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${report.priority === "high" ? "bg-red-50 text-red-500" :
                                                report.priority === "medium" ? "bg-amber-50 text-amber-500" : "bg-slate-200 text-slate-500"
                                                }`}>
                                                {report.type === "content" && <AlertCircle className="h-5 w-5" />}
                                                {report.type === "spam" && <XCircle className="h-5 w-5" />}
                                                {report.type === "harassment" && <AlertTriangle className="h-5 w-5" />}
                                                {report.type === "copyright" && <Shield className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{report.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Reported by {report.reporter} • {report.time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={
                                                report.priority === "high" ? "bg-red-50 text-red-600 border-red-200" :
                                                    report.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                        "bg-slate-50 text-slate-600 border-slate-200"
                                            }>
                                                {report.priority}
                                            </Badge>
                                            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Review</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Report Categories */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Report Categories</CardTitle>
                            <CardDescription>Distribution this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={reportCategories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {reportCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-4">
                                {reportCategories.map((cat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-xs text-muted-foreground">{cat.name}</span>
                                        </div>
                                        <span className="text-xs font-medium text-foreground">{cat.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Actions & Support Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Actions */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Actions</CardTitle>
                                <Button variant="ghost" size="sm" className="text-slate-500">Activity Log</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActions.map((action) => (
                                    <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${action.action.includes("Warning") ? "bg-amber-100 text-amber-600" :
                                            action.action.includes("Removed") ? "bg-red-100 text-red-600" :
                                                action.action.includes("Suspended") ? "bg-red-100 text-red-600" :
                                                    "bg-emerald-100 text-emerald-600"
                                            }`}>
                                            {action.action.includes("Warning") && <AlertTriangle className="h-4 w-4" />}
                                            {action.action.includes("Removed") && <XCircle className="h-4 w-4" />}
                                            {action.action.includes("Suspended") && <Shield className="h-4 w-4" />}
                                            {action.action.includes("Dismissed") && <CheckCircle className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs border-slate-200 text-slate-600 bg-white">{action.action}</Badge>
                                                <span className="text-xs text-muted-foreground">by {action.moderator}</span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground mt-1">{action.target}</p>
                                            <p className="text-xs text-muted-foreground">{action.reason} • {action.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support Queue */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Support Queue</CardTitle>
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                    {supportQueue.length} waiting
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {supportQueue.map((ticket) => (
                                    <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarImage src="/placeholder.svg" />
                                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                                    {ticket.user.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{ticket.user}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.issue}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <Badge variant="outline" className={
                                                    ticket.status === "in_progress" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                        "bg-amber-50 text-amber-600 border-amber-200"
                                                }>
                                                    {ticket.status === "in_progress" ? "In Progress" : "Waiting"}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">{ticket.time}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ModeratorDashboard;
