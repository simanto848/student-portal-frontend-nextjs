"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, FileText, Globe, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { publishResult, returnResult } from "../actions";
import { ResultWorkflow } from "@/services/enrollment/courseGrade.service";

interface DepartmentResultsFragmentProps {
    workflows: ResultWorkflow[];
}

export default function DepartmentResultsFragment({ workflows }: DepartmentResultsFragmentProps) {
    const [selectedWorkflow, setSelectedWorkflow] = useState<ResultWorkflow | null>(null);
    const [actionType, setActionType] = useState<"publish" | "return" | null>(null);

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [returnReason, setReturnReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Filter relevant workflows (approved for publishing, or already published)
    const relevantWorkflows = workflows.filter(w =>
        w.status === 'approved' || w.status === 'published'
    );

    const handleActionClick = (workflow: ResultWorkflow, type: "publish" | "return") => {
        setSelectedWorkflow(workflow);
        setActionType(type);
        setOtp("");
        setReturnReason("");
        setIsDialogOpen(true);
    };

    const handleConfirm = async () => {
        if (!selectedWorkflow || !actionType || !otp) return;
        if (actionType === "return" && !returnReason) return;

        setIsLoading(true);
        try {
            let result;
            if (actionType === "publish") {
                result = await publishResult(selectedWorkflow.id, otp);
            } else {
                result = await returnResult(selectedWorkflow.id, returnReason, otp);
            }

            if (result.success) {
                toast.success(actionType === "publish" ? "Result published successfully" : "Result returned successfully");
                setIsDialogOpen(false);
                // Ideally we'd refresh the list here, but server action revalidatePath should handle it if this is a client component inside a server page
            } else {
                toast.error(result.error as string);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Ready to Publish</Badge>;
            case 'published':
                return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"><Globe className="w-3 h-3 mr-1" /> Published</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="px-0">
                    {relevantWorkflows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                            <div className="p-4 rounded-full bg-white shadow-sm mb-4">
                                <FileText className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No Pending Results</h3>
                            <p className="text-slate-500 max-w-sm mt-1">
                                There are no approved results waiting for publication at this time.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-bold text-slate-700">Course</TableHead>
                                        <TableHead className="font-bold text-slate-700">Batch</TableHead>
                                        <TableHead className="font-bold text-slate-700">Semester</TableHead>
                                        <TableHead className="font-bold text-slate-700">Status</TableHead>
                                        <TableHead className="font-bold text-slate-700">Last Action</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relevantWorkflows.map((workflow) => (
                                        <TableRow key={workflow.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-bold text-slate-900">{workflow.grade?.course?.name || "Unknown Course"}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{workflow.grade?.course?.code}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-slate-600 bg-slate-50">
                                                    {workflow.grade?.batch?.name || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium">
                                                Level-Term {workflow.grade?.semester || "-"}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {workflow.actionAt ? format(new Date(workflow.actionAt), 'MMM d, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {workflow.status === 'approved' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                                            onClick={() => handleActionClick(workflow, "return")}
                                                        >
                                                            <RotateCcw className="h-4 w-4 mr-2" />
                                                            Return
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                                                            onClick={() => handleActionClick(workflow, "publish")}
                                                        >
                                                            <Globe className="h-4 w-4 mr-2" />
                                                            Publish
                                                        </Button>
                                                    </div>
                                                )}
                                                {workflow.status === 'published' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled
                                                        className="text-emerald-600 font-medium bg-emerald-50"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
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

            {/* Action Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className={actionType === "publish" ? "text-indigo-600" : "text-amber-600"}>
                            {actionType === "publish" ? "Confirm Publication" : "Return Result"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "publish"
                                ? "Enter your OTP to confirm publishing these results. Grades will be visible to students."
                                : "Enter a reason for returning the result to the exam committee/teacher."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {actionType === "return" && (
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Return</Label>
                                <Textarea
                                    id="reason"
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="Explain why the result is being returned..."
                                    className="min-h-[100px] rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="otp">One-Time Password (OTP)</Label>
                            <Input
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter verification code"
                                autoComplete="off"
                                className="h-12 rounded-xl border-slate-200 text-center text-lg tracking-widest font-mono"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!otp || isLoading || (actionType === "return" && !returnReason)}
                            className={`rounded-xl h-12 font-bold px-6 ${actionType === "publish"
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-amber-600 hover:bg-amber-700 text-white"
                                }`}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (
                                actionType === "publish" ? <Globe className="h-4 w-4 mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />
                            )}
                            {actionType === "publish" ? "Confirm & Publish" : "Return Result"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
