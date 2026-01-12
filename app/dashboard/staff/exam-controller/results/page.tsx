"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { notifyError, notifySuccess } from "@/components/toast";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { CheckCircle, XCircle, FileText, Search, User, Eye, Lock, RotateCcw } from "lucide-react";
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

// Mock Data for Results waiting for publication
const MOCK_RESULTS = [
    { id: 1, courseCode: "CSE101", courseName: "Introduction to Computer Science", section: "A", teacher: "Dr. Smith", submittedDate: "2024-05-20", status: "PENDING_PUBLICATION", totalStudents: 45 },
    { id: 2, courseCode: "ENG102", courseName: "English Composition", section: "B", teacher: "Ms. Doe", submittedDate: "2024-05-21", status: "PENDING_PUBLICATION", totalStudents: 38 },
    { id: 3, courseCode: "MAT201", courseName: "Calculus II", section: "A", teacher: "Mr. Johnson", submittedDate: "2024-05-22", status: "RETURNED", totalStudents: 42 },
    { id: 4, courseCode: "PHY101", courseName: "Physics I", section: "C", teacher: "Dr. Brown", submittedDate: "2024-05-18", status: "PUBLISHED", totalStudents: 50 },
];

export default function ResultsManagementPage() {
    const theme = useDashboardTheme();
    const [results, setResults] = useState(MOCK_RESULTS);
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [actionType, setActionType] = useState<"PUBLISH" | "RETURN" | null>(null);
    const [otp, setOtp] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");

    // Filter results based on active tab
    // Pending Tab: Shows PENDING_PUBLICATION and RETURNED (since they might need attention again)
    const pendingResults = results.filter(r => r.status === "PENDING_PUBLICATION" || r.status === "RETURNED");

    // Published Tab: Shows PUBLISHED results
    const publishedResults = results.filter(r => r.status === "PUBLISHED");

    const handleAction = (result: any, type: "PUBLISH" | "RETURN") => {
        setSelectedResult(result);
        setActionType(type);
        setOtp("");
        setRemarks("");
        setIsDialogOpen(true);
    };

    const confirmAction = () => {
        if (actionType === "PUBLISH" && !otp) {
            notifyError("Please enter the OTP to confirm publication");
            return;
        }
        if (actionType === "RETURN" && !remarks) {
            notifyError("Please enter remarks for returning the result");
            return;
        }

        // Mock API call
        setTimeout(() => {
            if (actionType === "PUBLISH") {
                notifySuccess(`Result for ${selectedResult.courseCode} published successfully!`);
                // Update status in mock
                setResults(results.map(r => r.id === selectedResult.id ? { ...r, status: "PUBLISHED" } : r));
            } else {
                notifySuccess(`Result returned to teacher with remarks.`);
                // Update status in mock
                setResults(results.map(r => r.id === selectedResult.id ? { ...r, status: "RETURNED" } : r));
            }
            setIsDialogOpen(false);
        }, 800);
    };

    const ResultCard = ({ result, showReturnOnly = false }: { result: any, showReturnOnly?: boolean }) => (
        <GlassCard key={result.id} className={`p-6 transition-all hover:shadow-md ${theme.colors.sidebar.hover}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{result.courseCode}</h3>
                        <Badge
                            variant="secondary"
                            className={`rounded-full ${result.status === "RETURNED" ? "bg-red-100 text-red-700 hover:bg-red-100" :
                                    result.status === "PUBLISHED" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                        "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                }`}
                        >
                            {result.status.replace("_", " ")}
                        </Badge>
                    </div>
                    <p className="text-slate-600 font-medium">{result.courseName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {result.teacher}
                        </span>
                        <span className="flex items-center gap-1.5">
                            Section {result.section}
                        </span>
                        <span className="flex items-center gap-1.5">
                            {result.totalStudents} Students
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Button variant="outline" className="flex-1 md:flex-none">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </Button>

                    {showReturnOnly ? (
                        <Button
                            variant="destructive"
                            className="flex-1 md:flex-none"
                            onClick={() => handleAction(result, "RETURN")}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Return
                        </Button>
                    ) : (
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
                                disabled={result.status === "RETURNED"}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </GlassCard>
    );

    const EmptyState = ({ message }: { message: string }) => (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className={`h-20 w-20 rounded-full ${theme.colors.sidebar.iconBg} flex items-center justify-center mb-2`}>
                <CheckCircle className={`h-10 w-10 ${theme.colors.accent.primary}`} />
            </div>
            <h3 className="text-xl font-semibold">No Results Found</h3>
            <p className="text-muted-foreground">{message}</p>
        </GlassCard>
    );

    return (
        <div className="container px-6 py-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Result Management"
                subtitle="Review, return, or publish submitted results."
                icon={FileText}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-6">
                    <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-6">
                    <div className="grid gap-6">
                        {pendingResults.length === 0 ? (
                            <EmptyState message="There are no pending results waiting for your action." />
                        ) : (
                            pendingResults.map((result) => (
                                <ResultCard key={result.id} result={result} />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="published" className="space-y-6">
                    <div className="grid gap-6">
                        {publishedResults.length === 0 ? (
                            <EmptyState message="No results have been published yet." />
                        ) : (
                            publishedResults.map((result) => (
                                <ResultCard key={result.id} result={result} showReturnOnly={true} />
                            ))
                        )}
                    </div>
                </TabsContent>
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
                                : "Return the result sheet to the teacher for corrections. Use this to unpublish or request changes."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <GlassCard className="p-3 bg-slate-50 border border-slate-100">
                            <h4 className="font-semibold text-sm mb-1">{selectedResult?.courseCode} - {selectedResult?.courseName}</h4>
                            <p className="text-xs text-muted-foreground">Section {selectedResult?.section} • Submitted by {selectedResult?.teacher}</p>
                        </GlassCard>

                        {actionType === "PUBLISH" ? (
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
                        ) : (
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
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button
                            className={actionType === "PUBLISH" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            onClick={confirmAction}
                        >
                            {actionType === "PUBLISH" ? "Confirm Publish" : "Return Result"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
