"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGradingWorkflow } from "@/hooks/queries/useTeacherQueries";
import { courseGradeService, ResultWorkflow } from "@/services/enrollment/courseGrade.service";
import { Loader2, CheckCircle, FileText, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function DepartmentResultsView() {
    const router = useRouter();
    const { data: workflows, isLoading, refetch } = useGradingWorkflow();

    const [selectedWorkflow, setSelectedWorkflow] = useState<ResultWorkflow | null>(null);
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    const relevantWorkflows = workflows?.filter(w =>
        w.status === 'approved' || w.status === 'published'
    ) || [];

    const handlePublishClick = (workflow: ResultWorkflow) => {
        setSelectedWorkflow(workflow);
        setOtp("");
        setIsOtpDialogOpen(true);
    };

    const handlePublishConfirm = async () => {
        if (!selectedWorkflow || !otp) return;

        setIsPublishing(true);
        try {
            await courseGradeService.publishResult(selectedWorkflow.id, otp);
            toast.success("Result published successfully");
            setIsOtpDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to publish result");
        } finally {
            setIsPublishing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Ready to Publish</Badge>;
            case 'published':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><Globe className="w-3 h-3 mr-1" /> Published</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader className="px-0">
                    <CardTitle className="text-xl font-semibold text-[#344e41]">Department Results</CardTitle>
                    <CardDescription>
                        Manage and publish result submissions from course teachers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {relevantWorkflows.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground border rounded-lg bg-gray-50/50">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No results pending publication found.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Action</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relevantWorkflows.map((workflow) => (
                                        <TableRow key={workflow.id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold text-[#344e41]">{workflow.grade?.course?.name || "Unknown Course"}</div>
                                                    <div className="text-xs text-muted-foreground">{workflow.grade?.course?.code}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{workflow.grade?.batch?.name || "Unknown Batch"}</TableCell>
                                            <TableCell>Sem {workflow.grade?.semester || "-"}</TableCell>
                                            <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {workflow.actionAt ? format(new Date(workflow.actionAt), 'MMM d, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {workflow.status === 'approved' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-[#344e41] hover:bg-[#25382f]"
                                                        onClick={() => handlePublishClick(workflow)}
                                                    >
                                                        <Globe className="h-4 w-4 mr-2" />
                                                        Publish
                                                    </Button>
                                                )}
                                                {workflow.status === 'published' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled
                                                        className="opacity-70"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                        Published
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* OTP Dialog */}
            <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Publication</DialogTitle>
                        <DialogDescription>
                            Enter your OTP to confirm publishing these results. This action will make grades visible to students.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="otp">One-Time Password (OTP)</Label>
                            <Input
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter verification code"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOtpDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePublishConfirm}
                            disabled={!otp || isPublishing}
                            className="bg-[#344e41] hover:bg-[#25382f]"
                        >
                            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm & Publish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
