"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assessmentService, AssessmentType } from "@/services/enrollment/assessment.service";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function AssessmentTypesPage() {
    const router = useRouter();
    const [types, setTypes] = useState<AssessmentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setIsLoading(true);
        try {
            const data = await assessmentService.listTypes();
            setTypes(data || []);
        } catch (error) {
            toast.error("Failed to fetch assessment types");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this assessment type?")) return;
        try {
            await assessmentService.deleteType(id);
            toast.success("Assessment type deleted");
            fetchTypes();
        } catch (error) {
            toast.error("Failed to delete assessment type");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Assessment Types</h1>
                        <p className="text-muted-foreground">Manage assessment categories (e.g., Quiz, Midterm)</p>
                    </div>
                    <Button className="bg-[#3e6253] hover:bg-[#2c463b]">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Type
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Default Weightage</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {types.length > 0 ? (
                                        types.map((type) => (
                                            <TableRow key={type.id}>
                                                <TableCell className="font-medium">{type.name}</TableCell>
                                                <TableCell>{type.weightage}%</TableCell>
                                                <TableCell>{type.description || "-"}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${type.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {type.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No assessment types found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
