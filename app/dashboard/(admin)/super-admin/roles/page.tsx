"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Search, MoreHorizontal, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { systemService, DatabaseStats } from "@/services/system.service";

export default function RolesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await systemService.getDatabaseStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const roles = [
        {
            id: "super_admin",
            name: "Super Admin",
            users: stats?.counts?.admins || 0, // Mapped to admins for now
            description: "Full system access with all permissions.",
            type: "System",
            permissions: ["all"]
        },
        {
            id: "admin",
            name: "Administrator",
            users: stats?.counts?.admins || 0,
            description: "Institute-level management access.",
            type: "Institute",
            permissions: ["academic_manage", "user_manage", "report_view"]
        },
        {
            id: "teacher",
            name: "Teacher",
            users: stats?.counts?.teachers || 0,
            description: "Course management and grading.",
            type: "Academic",
            permissions: ["course_view", "grade_edit"]
        },
        {
            id: "staff",
            name: "Staff",
            users: stats?.counts?.staff || 0,
            description: "Operational support and administration.",
            type: "Support",
            permissions: ["content_moderate", "ticket_resolve"]
        },
        {
            id: "student",
            name: "Student",
            users: stats?.counts?.students || 0,
            description: "Standard student access.",
            type: "Academic",
            permissions: ["course_view"]
        }
    ];

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground">Configure roles and permission levels</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Role
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search roles..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Roles</CardTitle>
                        <CardDescription>Existing roles and their assignment counts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Assigned Users</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
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
                                ) : (
                                    filteredRoles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-primary/10 p-1.5 rounded-full">
                                                        <Shield className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="font-medium">{role.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{role.type}</Badge>
                                            </TableCell>
                                            <TableCell>{role.users.toLocaleString()}</TableCell>
                                            <TableCell className="text-muted-foreground">{role.description}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Permissions</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
