"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { courseGradeService, ResultWorkflow } from "@/services/enrollment/courseGrade.service";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GradeWorkflowPage() {
    const router = useRouter();
    const [workflowItems, setWorkflowItems] = useState<ResultWorkflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWorkflow();
    }, []);

    const fetchWorkflow = async () => {
        setIsLoading(true);
        try {
            const data = await courseGradeService.getWorkflow({ status: 'pending' });
            setWorkflowItems(data || []);
        } catch (error) {
            toast.error("Failed to fetch grade workflow items");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm("Are you sure you want to approve this grade?")) return;
        try {
            await courseGradeService.approveByCommittee(id, { comments: "Approved by Admin" });
            toast.success("Grade approved");
            fetchWorkflow();
        } catch (error) {
            toast.error("Failed to approve grade");
        }
    };

    const handleReturn = async (id: string) => {
        const reason = prompt("Enter reason for returning:");
        if (!reason) return;

        try {
            await courseGradeService.returnToTeacher(id, { comments: reason });
            toast.success("Grade returned to teacher");
            fetchWorkflow();
        } catch (error) {
            toast.error("Failed to return grade");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Grade Workflow</h1>
                        <p className="text-muted-foreground">Review and approve pending grades</p>
                    </div>
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
                                        <TableHead>Student</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workflowItems.length > 0 ? (
                                        workflowItems.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.grade?.student?.fullName}
                                                </TableCell>
                                                <TableCell>{item.grade?.course?.name}</TableCell>
                                                <TableCell>
                                                    <span className="font-bold">{item.grade?.grade}</span> ({item.grade?.totalMarks})
                                                </TableCell>
                                                <TableCell>{item.actionBy}</TableCell>
                                                <TableCell>{format(new Date(item.actionAt), "MMM d, yyyy HH:mm")}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(item.id)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReturn(item.id)}>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Return
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No pending grades for review
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
