"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    ArrowUpRight,
    FileCheck,
    BarChart3,
    Building,
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

const enrollmentData = [
    { month: "Jul", students: 2100, teachers: 85 },
    { month: "Aug", students: 2200, teachers: 88 },
    { month: "Sep", students: 2350, teachers: 92 },
    { month: "Oct", students: 2380, teachers: 94 },
    { month: "Nov", students: 2420, teachers: 95 },
    { month: "Dec", students: 2450, teachers: 96 },
];

const departmentPerformance = [
    { name: "Mathematics", students: 520, avgScore: 78, courses: 12 },
    { name: "Science", students: 480, avgScore: 82, courses: 15 },
    { name: "English", students: 450, avgScore: 75, courses: 10 },
    { name: "History", students: 320, avgScore: 80, courses: 8 },
    { name: "Arts", students: 280, avgScore: 88, courses: 6 },
    { name: "Technology", students: 400, avgScore: 85, courses: 11 },
];

const attendanceByDay = [
    { day: "Mon", attendance: 94 },
    { day: "Tue", attendance: 96 },
    { day: "Wed", attendance: 92 },
    { day: "Thu", attendance: 95 },
    { day: "Fri", attendance: 88 },
];

const courseDistribution = [
    { name: "Active", value: 62, color: "hsl(142, 71%, 45%)" },
    { name: "Upcoming", value: 18, color: "hsl(234, 89%, 59%)" },
    { name: "Completed", value: 45, color: "hsl(215, 16%, 47%)" },
    { name: "Draft", value: 8, color: "hsl(38, 92%, 50%)" },
];

const pendingApprovals = [
    { id: 1, type: "Course", title: "Advanced Biology Lab", by: "Dr. Sarah Chen", date: "2 hours ago" },
    { id: 2, type: "Leave", title: "Leave Request - Dec 26-28", by: "Prof. Michael Brown", date: "4 hours ago" },
    { id: 3, type: "Event", title: "Science Fair 2024", by: "Ms. Emily Davis", date: "1 day ago" },
    { id: 4, type: "Budget", title: "Lab Equipment Purchase", by: "Dr. Robert Wilson", date: "1 day ago" },
];

const topTeachers = [
    { name: "Dr. Sarah Chen", department: "Science", rating: 4.9, students: 156 },
    { name: "Prof. James Miller", department: "Mathematics", rating: 4.8, students: 142 },
    { name: "Ms. Emily Davis", department: "Arts", rating: 4.8, students: 98 },
    { name: "Dr. Robert Wilson", department: "Technology", rating: 4.7, students: 134 },
];

const upcomingEvents = [
    { title: "Parent-Teacher Conference", date: "Dec 28", time: "2:00 PM", type: "meeting" },
    { title: "Winter Break Starts", date: "Dec 22", time: "All Day", type: "holiday" },
    { title: "Staff Training Session", date: "Jan 3", time: "9:00 AM", type: "training" },
    { title: "New Semester Begins", date: "Jan 8", time: "8:00 AM", type: "academic" },
    { title: "Quarterly Review", date: "Jan 12", time: "9:00 AM", type: "business" },
];

const AdminDashboard = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Institution Dashboard</h1>
                        <p className="mt-1 text-muted-foreground">
                            Lincoln High School • 2024-2025 Academic Year
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Reports
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Approvals (8)
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-600 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Students</p>
                                    <p className="text-2xl font-bold text-foreground">2,450</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">+30 this month</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-indigo-600 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Teachers</p>
                                    <p className="text-2xl font-bold text-foreground">96</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600">+2 this month</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-600 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Courses</p>
                                    <p className="text-2xl font-bold text-foreground">62</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-muted-foreground">Across 6 departments</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avg Attendance</p>
                                    <p className="text-2xl font-bold text-foreground">93%</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingDown className="h-3 w-3 text-amber-500" />
                                        <span className="text-xs text-amber-500">-2% from last week</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enrollment Trends */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Enrollment Trends</CardTitle>
                            <CardDescription>Student and teacher growth over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={enrollmentData}>
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
                                        <Line yAxisId="left" type="monotone" dataKey="students" stroke="hsl(234, 89%, 59%)" strokeWidth={2} dot={{ fill: "hsl(234, 89%, 59%)" }} />
                                        <Line yAxisId="right" type="monotone" dataKey="teachers" stroke="hsl(168, 76%, 42%)" strokeWidth={2} dot={{ fill: "hsl(168, 76%, 42%)" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weekly Attendance */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Weekly Attendance</CardTitle>
                            <CardDescription>Average daily attendance percentage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendanceByDay}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                        <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Bar dataKey="attendance" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Department Performance & Course Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Department Performance */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle>Department Performance</CardTitle>
                            <CardDescription>Students, courses, and average scores by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {departmentPerformance.map((dept, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Building className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{dept.name}</p>
                                                <p className="text-sm text-muted-foreground">{dept.courses} courses • {dept.students} students</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-foreground">{dept.avgScore}%</p>
                                                <p className="text-xs text-muted-foreground">Avg Score</p>
                                            </div>
                                            <Progress value={dept.avgScore} className="w-20 h-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Course Distribution */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Course Status</CardTitle>
                            <CardDescription>Distribution by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={courseDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {courseDistribution.map((entry, index) => (
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
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {courseDistribution.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-muted-foreground">{item.name}</span>
                                        <span className="text-xs font-medium text-foreground ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Approvals, Teachers & Events */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Approvals */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Pending Approvals</CardTitle>
                                <Badge variant="outline" className="bg-amber-100 text-amber-600 border-amber-200">
                                    {pendingApprovals.length} pending
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingApprovals.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                            </div>
                                            <p className="text-sm font-medium text-foreground mt-1 truncate">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.by} • {item.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Teachers */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Top Teachers</CardTitle>
                                <Button variant="ghost" size="sm">View All</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topTeachers.map((teacher, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src="/placeholder.svg" />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                                {teacher.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{teacher.name}</p>
                                            <p className="text-xs text-muted-foreground">{teacher.department}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-foreground">⭐ {teacher.rating}</p>
                                            <p className="text-xs text-muted-foreground">{teacher.students} students</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Upcoming Events</CardTitle>
                                <Button variant="ghost" size="sm">Calendar</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingEvents.map((event, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className={`h-10 w-10 rounded-lg flex flex-col items-center justify-center ${event.type === "holiday" ? "bg-green-100 text-green-700" :
                                            event.type === "meeting" ? "bg-blue-100 text-blue-700" :
                                                event.type === "training" ? "bg-amber-100 text-amber-700" : "bg-muted text-foreground"
                                            }`}>
                                            <span className="text-xs font-bold">{event.date.split(" ")[0]}</span>
                                            <span className="text-[10px] opacity-80">{event.date.split(" ")[1]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                                            <p className="text-xs text-muted-foreground">{event.time}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
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

export default AdminDashboard;
