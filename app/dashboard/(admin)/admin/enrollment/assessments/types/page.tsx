"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { assessmentService, AssessmentType } from "@/services/enrollment/assessment.service";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function AssessmentTypesPage() {
    const [types, setTypes] = useState<AssessmentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingType, setEditingType] = useState<AssessmentType | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        weightPercentage: 0,
        description: "",
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const data = await assessmentService.listTypes();
            setTypes(data);
        } catch (error) {
            toast.error("Failed to load assessment types");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (type?: AssessmentType) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                code: (type as any).code || "",
                weightPercentage: type.weightPercentage || 0,
                description: type.description || "",
            });
        } else {
            setEditingType(null);
            setFormData({
                name: "",
                code: "",
                weightPercentage: 0,
                description: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingType) {
                await assessmentService.updateType(editingType.id, formData);
                toast.success("Assessment type updated");
            } else {
                await assessmentService.createType(formData);
                toast.success("Assessment type created");
            }
            setIsDialogOpen(false);
            fetchTypes();
        } catch (error: any) {
            toast.error(error.message || "Failed to save assessment type");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this type?")) return;
        try {
            await assessmentService.deleteType(id);
            toast.success("Assessment type deleted");
            fetchTypes();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete assessment type");
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Assessment Types</h2>
                        <p className="text-muted-foreground">Manage the types of assessments available in the system.</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-[#3e6253] hover:bg-[#2c463b]">
                        <Plus className="mr-2 h-4 w-4" /> Add Type
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Default Weightage</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {types.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No assessment types found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    types.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell>{(type as any).code || "-"}</TableCell>
                                            <TableCell>{type.weightPercentage}%</TableCell>
                                            <TableCell>{type.description || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(type)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(type.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingType ? "Edit Assessment Type" : "Create Assessment Type"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Quiz, Midterm, Final"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., QUIZ, MID, FINAL"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weightPercentage">Default Weightage (%)</Label>
                                <Input
                                    id="weightPercentage"
                                    type="number"
                                    value={formData.weightPercentage}
                                    onChange={(e) => setFormData({ ...formData, weightPercentage: Number(e.target.value) })}
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingType ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
