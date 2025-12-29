"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, MapPin, Users, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrganizationsPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const organizations = [
        {
            id: "1",
            name: "Main Campus",
            type: "Campus",
            location: "New York, NY",
            departments: 12,
            staff: 450,
            students: 12000,
            status: "Active"
        },
        {
            id: "2",
            name: "Engineering Wing",
            type: "Faculty",
            location: "Building B",
            departments: 5,
            staff: 120,
            students: 3500,
            status: "Active"
        },
        {
            id: "3",
            name: "Medical School",
            type: "Faculty",
            location: "North Campus",
            departments: 8,
            staff: 200,
            students: 1800,
            status: "Active"
        },
        {
            id: "4",
            name: "Remote Learning Center",
            type: "Virtual",
            location: "Online",
            departments: 2,
            staff: 45,
            students: 5000,
            status: "Maintenance"
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                        <p className="text-muted-foreground">Manage campuses, faculties, and departments</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Organization
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search organizations..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => (
                        <Card key={org.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{org.name}</CardTitle>
                                        <CardDescription>{org.type}</CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                        <DropdownMenuItem>Manage Departments</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 text-sm text-muted-foreground mt-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {org.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {org.staff} Staff • {org.students.toLocaleString()} Students
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <Badge variant="secondary" className="font-normal">
                                        {org.departments} Departments
                                    </Badge>
                                    <Badge variant={org.status === 'Active' ? 'default' : 'secondary'} className={org.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                        {org.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
