"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Search, Check, MoreHorizontal } from "lucide-react";
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

export default function RolesPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const roles = [
        {
            id: "super_admin",
            name: "Super Admin",
            users: 3,
            description: "Full system access with all permissions.",
            type: "System",
            permissions: ["all"]
        },
        {
            id: "admin",
            name: "Administrator",
            users: 15,
            description: "Institute-level management access.",
            type: "Institute",
            permissions: ["academic_manage", "user_manage", "report_view"]
        },
        {
            id: "moderator",
            name: "Moderator",
            users: 8,
            description: "Content moderation and user support.",
            type: "Support",
            permissions: ["content_moderate", "ticket_resolve"]
        },
        {
            id: "teacher",
            name: "Teacher",
            users: 450,
            description: "Course management and grading.",
            type: "Academic",
            permissions: ["course_view", "grade_edit"]
        },
        {
            id: "student",
            name: "Student",
            users: 12500,
            description: "Standard student access.",
            type: "Academic",
            permissions: ["course_view"]
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground">Configure roles and permission levels</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Role
                    </Button>
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
                                {roles.map((role) => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
