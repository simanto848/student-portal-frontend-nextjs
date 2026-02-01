"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    TrendingUp,
    TrendingDown,
    CheckCircle,
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

export default function AdminDashboard() {
    return (
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
                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
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
                            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
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
                            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
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
                            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                                <p className="text-2xl font-bold text-foreground">93%</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <TrendingDown className="h-3 w-3 text-orange-500" />
                                    <span className="text-xs text-orange-500">-2% from last week</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enrollment Trends */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
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
                <Card className="shadow-sm hover:shadow-md transition-shadow">
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
                <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Department Performance</CardTitle>
                        <CardDescription>Students, courses, and average scores by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {departmentPerformance.map((dept, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
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
                <Card className="shadow-sm hover:shadow-md transition-shadow">
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
        </div>
    );
}
