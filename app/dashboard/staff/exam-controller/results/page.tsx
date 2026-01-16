"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { notifyError, notifySuccess } from "@/components/toast";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { CheckCircle, XCircle, FileText, Search, User, Eye, Lock, RefreshCw, Send, AlertCircle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enrollmentService } from "@/services/enrollment/enrollment.service";

export default function ResultsManagementPage() {
    const theme = useDashboardTheme();

    // Data State
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [actionType, setActionType] = useState<"PUBLISH" | "RETURN" | null>(null);
    const [otp, setOtp] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Fetch Results
    const fetchResults = async () => {
        setIsLoading(true);
        try {
            const data = await enrollmentService.getResultWorkflows();
            setResults(data || []);
        } catch (error) {
            console.error("Error fetching results:", error);
            notifyError("Failed to load results");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    // Filter results
    const pendingResults = results.filter((r: any) =>
        r.status === "SUBMITTED_TO_COMMITTEE" ||
        r.status === "COMMITTEE_APPROVED" ||
        r.status === "RETURNED_TO_TEACHER"
    );
    const publishedResults = results.filter((r: any) => r.status === "PUBLISHED");

    const handleAction = (result: any, type: "PUBLISH" | "RETURN") => {
        setSelectedResult(result);
        setActionType(type);
        setOtp("");
        setRemarks("");
        setIsDialogOpen(true);
    };

    const confirmAction = async () => {
        if (actionType === "PUBLISH" && !otp) {
            notifyError("Please enter the OTP to confirm publication");
            return;
        }
        if (actionType === "RETURN" && !remarks) {
            notifyError("Please enter remarks for returning the result");
            return;
        }
        if (actionType === "RETURN" && !otp) {
            notifyError("Please enter OTP to confirm return");
            return;
        }

        setIsActionLoading(true);
        try {
            if (actionType === "PUBLISH") {
                await enrollmentService.publishResult(selectedResult.id, { otp });
                notifySuccess(`Result for ${selectedResult.courseId} published successfully!`);
            } else {
                await enrollmentService.returnResultToTeacher(selectedResult.id, { comment: remarks, otp });
                notifySuccess(`Result returned to teacher successfully.`);
            }

            // Refresh list
            await fetchResults();
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error("Action error:", error);
            notifyError(error.response?.data?.message || "Action failed");
        } finally {
            setIsActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Published</Badge>;
            case "RETURNED_TO_TEACHER": return <Badge variant="destructive">Returned</Badge>;
            case "COMMITTEE_APPROVED": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Committee Approved</Badge>;
            case "SUBMITTED_TO_COMMITTEE": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Submitted</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container px-6 py-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Result Management"
                subtitle="Review, return, or publish submitted results."
                icon={FileText}
            />

            <Tabs defaultValue="pending" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-white border border-slate-200 p-1">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">Pending Results</TabsTrigger>
                        <TabsTrigger value="published" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Published Results</TabsTrigger>
                    </TabsList>
                    <Button variant="ghost" size="sm" onClick={fetchResults}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-violet-600" /></div>
                ) : (
                    <>
                        {/* PENDING RESULTS TAB */}
                        <TabsContent value="pending" className="space-y-4">
                            {pendingResults.length === 0 ? (
                                <GlassCard className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className={`h-20 w-20 rounded-full ${theme.colors.sidebar.iconBg} flex items-center justify-center mb-2`}>
                                        <CheckCircle className={`h-10 w-10 ${theme.colors.accent.primary}`} />
                                    </div>
                                    <h3 className="text-xl font-semibold">All Caught Up!</h3>
                                    <p className="text-muted-foreground">There are no pending results waiting for your action.</p>
                                </GlassCard>
                            ) : (
                                pendingResults.map((result: any) => (
                                    <GlassCard key={result.id} className="p-6 transition-all hover:shadow-md">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg">{result.courseId}</h3>
                                                    {getStatusBadge(result.status)}
                                                </div>
                                                <p className="text-slate-600 font-medium">Batch {result.batchId}</p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5" />
                                                        Sem {result.semester}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">

                                                {result.status !== "RETURNED_TO_TEACHER" && (
                                                    <>
                                                        <Button
                                                            variant="destructive"
                                                            className="flex-1 md:flex-none"
                                                            onClick={() => handleAction(result, "RETURN")}
                                                        >
                                                            Return
                                                        </Button>
                                                        <Button
                                                            className={`flex-1 md:flex-none ${theme.colors.accent.secondary} text-white hover:opacity-90`}
                                                            onClick={() => handleAction(result, "PUBLISH")}
                                                        >
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Publish
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </TabsContent>

                        {/* PUBLISHED RESULTS TAB */}
                        <TabsContent value="published" className="space-y-4">
                            {publishedResults.length === 0 ? (
                                <GlassCard className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <AlertCircle className="h-12 w-12 text-slate-300" />
                                    <p className="text-muted-foreground">No published results yet.</p>
                                </GlassCard>
                            ) : (
                                publishedResults.map((result: any) => (
                                    <GlassCard key={result.id} className="p-6 transition-all hover:shadow-md border-l-4 border-l-green-500">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg">{result.courseId}</h3>
                                                    {getStatusBadge(result.status)}
                                                </div>
                                                <p className="text-slate-600 font-medium">Batch {result.batchId}</p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                    <span className="flex items-center gap-1.5">
                                                        Sem {result.semester}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                <Button
                                                    variant="destructive"
                                                    variant-type="outline"
                                                    className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleAction(result, "RETURN")}
                                                >
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Return to Teacher
                                                </Button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </TabsContent>
                    </>
                )}
            </Tabs>

            {/* Action Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "PUBLISH" ? "Confirm Publication" : "Return Result"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "PUBLISH"
                                ? "You are about to publish these results to students. This action cannot be undone immediately."
                                : "Return the result sheet to the teacher for corrections. This will unpublish the result if it was already published."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <GlassCard className="p-3 bg-slate-50 border border-slate-100">
                            <h4 className="font-semibold text-sm mb-1">{selectedResult?.courseId}</h4>
                            <p className="text-xs text-muted-foreground">Batch {selectedResult?.batchId} • Sem {selectedResult?.semester}</p>
                        </GlassCard>

                        {actionType === "RETURN" && (
                            <div className="space-y-2">
                                <Label>Reason for Return</Label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    placeholder="Please describe why this result is being returned..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Enter OTP to Confirm</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter 6-digit OTP"
                                    className="pl-9 tracking-widest"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">An OTP has been sent to your registered device.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button
                            className={actionType === "PUBLISH" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            onClick={confirmAction}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            {actionType === "PUBLISH" ? "Confirm Publish" : "Return Result"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
