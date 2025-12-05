"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { courseGradeService, ResultWorkflow } from "@/services/enrollment/courseGrade.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";

export default function GradingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [workflows, setWorkflows] = useState<ResultWorkflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchWorkflows();
        }
    }, [user?.id]);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const data = await courseGradeService.getWorkflow();
            setWorkflows(data || []);
        } catch (error) {
            console.error("Fetch workflow error:", error);
            toast.error("Failed to load grading workflow");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'submitted': return <Badge className="bg-blue-500">Submitted</Badge>;
            case 'returned': return <Badge className="bg-red-500">Returned</Badge>;
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Grading Workflow</h1>
                        <p className="text-muted-foreground">Track and manage result submissions</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/teacher/courses')}>
                        Input New Grades
                    </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="submitted">Submitted</TabsTrigger>
                        <TabsTrigger value="returned">Returned</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        <WorkflowTable workflows={workflows} loading={loading} />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-6">
                        <WorkflowTable workflows={workflows.filter(w => w.status === 'draft' || w.status === 'pending')} loading={loading} />
                    </TabsContent>
                    <TabsContent value="submitted" className="mt-6">
                        <WorkflowTable workflows={workflows.filter(w => w.status === 'submitted')} loading={loading} />
                    </TabsContent>
                    <TabsContent value="returned" className="mt-6">
                        <WorkflowTable workflows={workflows.filter(w => w.status === 'returned')} loading={loading} />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

function WorkflowTable({ workflows, loading }: { workflows: ResultWorkflow[], loading: boolean }) {
    const router = useRouter();

    if (loading) {
        return <div className="text-center py-10">Loading workflows...</div>;
    }

    if (workflows.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-4">
                    <FileText className="h-12 w-12 opacity-20" />
                    <p>No grading workflows found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Action By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workflows.map((workflow) => (
                        <TableRow key={workflow.id}>
                            <TableCell className="font-medium">
                                {workflow.grade?.course?.name || "Unknown Course"}
                                <div className="text-xs text-muted-foreground">
                                    {workflow.grade?.course?.code}
                                </div>
                            </TableCell>
                            <TableCell>{(status => {
                                switch (status) {
                                    case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
                                    case 'submitted': return <Badge className="bg-blue-500">Submitted</Badge>;
                                    case 'returned': return <Badge className="bg-red-500">Returned</Badge>;
                                    case 'draft': return <Badge variant="secondary">Draft</Badge>;
                                    default: return <Badge variant="outline">{status}</Badge>;
                                }
                            })(workflow.status)}</TableCell>
                            <TableCell>{workflow.actionBy}</TableCell>
                            <TableCell>{new Date(workflow.actionAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/teacher/courses/${workflow.grade?.courseId}`)}>
                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
