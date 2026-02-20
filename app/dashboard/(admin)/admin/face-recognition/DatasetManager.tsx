"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export function DatasetManager() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = () => {
        setLoading(true);
        fetch("http://localhost:5000/api/students")
            .then(res => res.json())
            .then(data => {
                setStudents(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast.error("Failed to connect to AI server");
            });
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm(`Are you sure you want to delete the facial data for student ${id}? This requires a subsequent model retraining to take effect.`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/delete_student/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchStudents();
            } else {
                toast.error(data.error || "Failed to delete student");
            }
        } catch (error) {
            toast.error("Network error deleting student dataset.");
            console.error(error);
        }
    };

    return (
        <Card className="border-amber-100 shadow-sm">
            <CardHeader className="border-b border-amber-50 bg-amber-50/20">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Users className="w-5 h-5 text-amber-600" />
                    Enrolled Datasets
                </CardTitle>
                <CardDescription>View and manage the students whose facial data is currently registered in the system.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="text-center py-12 text-slate-400 font-medium animate-pulse">Fetching datasets from API...</div>
                ) : students.length === 0 ? (
                    <div className="text-center py-16 m-6 text-amber-600 bg-amber-50/50 rounded-xl border border-dashed border-amber-200">
                        <Users className="h-10 w-10 mx-auto text-amber-300 mb-3" />
                        <p className="font-semibold">No individuals enrolled yet</p>
                        <p className="text-sm mt-1 opacity-80 max-w-sm mx-auto">Start enrolling students through the Smart Attendance scanner feature to capture their datasets.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-100">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-semibold text-slate-600">Registration ID</TableHead>
                                    <TableHead className="font-semibold text-slate-600">Name</TableHead>
                                    <TableHead className="font-semibold text-slate-600">Department</TableHead>
                                    <TableHead className="font-semibold text-slate-600 w-48">Enrolled Date</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-600 w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.ID} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-mono text-xs font-semibold text-slate-500 bg-slate-50/50">{student.ID}</TableCell>
                                        <TableCell className="font-bold text-slate-700">{student.Name}</TableCell>
                                        <TableCell className="text-slate-600">
                                            {student.Department ? (
                                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">{student.Department}</span>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm font-medium">
                                            {new Date(student.EnrolledAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(student.ID)}
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                                title="Delete dataset"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
