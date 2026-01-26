"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check, X, RotateCcw, Upload, Users, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Workflow {
    _id: string;
    batchId: string;
    courseId: string;
    semester: number;
    status:
    | "DRAFT"
    | "SUBMITTED_TO_COMMITTEE"
    | "COMMITTEE_APPROVED"
    | "PUBLISHED"
    | "RETURNED_TO_TEACHER";
    approvals: { memberId: string; name: string; timestamp: string }[];
    history: any[];
}

export default function CommitteeWorkflowList() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [returnComment, setReturnComment] = useState("");
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const response = await api.get("/enrollment/committee-results");
            setWorkflows(response.data.data);
        } catch (error) {
            console.error("Failed to fetch workflows:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.post(`/enrollment/committee-results/${id}/approve`, {
                comment: "Approved via Committee Panel",
            });
            fetchWorkflows();
        } catch (error) {
            console.error("Approval failed:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReturn = async () => {
        if (!selectedWorkflow || !returnComment) return;
        setActionLoading(selectedWorkflow);
        try {
            await api.post(`/enrollment/committee-results/${selectedWorkflow}/return`, {
                comment: returnComment,
            });
            fetchWorkflows();
            setSelectedWorkflow(null);
            setReturnComment("");
        } catch (error) {
            console.error("Return failed:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePublish = async (id: string) => {
        setActionLoading(id);
        try {
            await api.post(`/enrollment/committee-results/${id}/publish`);
            fetchWorkflows();
        } catch (error) {
            console.error("Publish failed:", error);
            alert("Failed to publish result. Ensure all approvals are complete.");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SUBMITTED_TO_COMMITTEE":
                return <Badge className="bg-orange-100 text-orange-800">Pending Review</Badge>;
            case "COMMITTEE_APPROVED":
                return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
            case "PUBLISHED":
                return <Badge className="bg-green-100 text-green-800">Published</Badge>;
            case "RETURNED_TO_TEACHER":
                return <Badge className="bg-red-100 text-red-800">Returned</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="rounded-md border bg-white dark:bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Batch</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Approvals</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workflows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No pending results found for your committee.
                                </TableCell>
                            </TableRow>
                        ) : (
                            workflows.map((workflow) => (
                                <TableRow key={workflow._id}>
                                    <TableCell>{workflow.batchId}</TableCell>
                                    <TableCell>{workflow.courseId}</TableCell>
                                    <TableCell>{workflow.semester}</TableCell>
                                    <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            {workflow.approvals.length} Approved
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Approve Button */}
                                            {workflow.status === "SUBMITTED_TO_COMMITTEE" && (
                                                <Button
                                                    size="sm"
                                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                                    onClick={() => handleApprove(workflow._id)}
                                                    disabled={!!actionLoading}
                                                >
                                                    {actionLoading === workflow._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                                    Approve
                                                </Button>
                                            )}

                                            {/* Return Button */}
                                            {(workflow.status === "SUBMITTED_TO_COMMITTEE" || workflow.status === "COMMITTEE_APPROVED") && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setSelectedWorkflow(workflow._id)}
                                                        >
                                                            <RotateCcw className="w-4 h-4 mr-1" />
                                                            Return
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Return to Teacher</DialogTitle>
                                                            <DialogDescription>
                                                                Provide a reason for returning this result. This will reset all current approvals.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <Textarea
                                                            placeholder="e.g., Grades for Student ID 123 seem incorrect..."
                                                            value={returnComment}
                                                            onChange={(e) => setReturnComment(e.target.value)}
                                                        />
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>Cancel</Button>
                                                            <Button variant="destructive" onClick={handleReturn} disabled={!returnComment || !!actionLoading}>
                                                                {actionLoading === workflow._id ? "Processing..." : "Confirm Return"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            )}

                                            {/* Publish Button - Enabled only when COMMITTEE_APPROVED */}
                                            {workflow.status === "COMMITTEE_APPROVED" && (
                                                <Button
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    onClick={() => handlePublish(workflow._id)}
                                                    disabled={!!actionLoading}
                                                >
                                                    {actionLoading === workflow._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                                                    Publish
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
