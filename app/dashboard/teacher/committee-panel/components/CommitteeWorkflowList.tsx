"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Search,
    Filter,
    Users,
    AlertCircle,
    Inbox,
    RefreshCw,
    Shield
} from "lucide-react";

import { academicApi as api } from "@/services/academic/axios-instance";
import { useAuth } from "@/contexts/AuthContext";
import { isTeacherUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { notifyError } from "@/components/toast";

export default function CommitteeWorkflowList() {
    const router = useRouter();
    const { user } = useAuth();
    const [workflows, setWorkflows] = useState<any[]>([]); // Use any[] for flexibility with virtual workflows
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

    const isCommitteeMember = user && isTeacherUser(user) && user.isExamCommitteeMember;

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enrollment/committee-results');
            setWorkflows(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch workflows", error);
            notifyError("Failed to fetch committee workflows");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    // Filter and Group
    const filteredAndGroupedData = useMemo(() => {
        let filtered = workflows;

        // Apply Status Filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(w => w.status === statusFilter);
        }

        // Apply Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(w =>
                w.grade?.course?.name?.toLowerCase().includes(lowerQuery) ||
                w.grade?.course?.code?.toLowerCase().includes(lowerQuery) ||
                w.grade?.batch?.name?.toLowerCase().includes(lowerQuery) ||
                w.grade?.batch?.code?.toLowerCase().includes(lowerQuery)
            );
        }

        // Group by Batch + Semester
        const groups: Record<string, { id: string, batch: any, semester: number, workflows: any[] }> = {};

        filtered.forEach(wf => {
            const batchId = wf.batchId || wf.grade?.batch?.id || wf.grade?.batch?._id;
            const semester = wf.semester;
            const key = `${batchId}-${semester}`;

            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    batch: wf.grade?.batch,
                    semester: semester,
                    workflows: []
                };
            }
            groups[key].workflows.push(wf);
        });

        return Object.values(groups);

    }, [workflows, statusFilter, searchQuery]);

    const toggleBatch = (groupId: string) => {
        const newSet = new Set(expandedBatches);
        if (newSet.has(groupId)) {
            newSet.delete(groupId);
        } else {
            newSet.add(groupId);
        }
        setExpandedBatches(newSet);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUBMITTED_TO_COMMITTEE':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Pending Review</Badge>;
            case 'COMMITTEE_APPROVED':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Approved</Badge>;
            case 'PUBLISHED':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Published</Badge>;
            case 'RETURNED_TO_TEACHER':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Returned</Badge>;
            case 'WITH_INSTRUCTOR':
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200">With Instructor</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const navigateToDetail = (workflowId: string) => {
        router.push(`/dashboard/teacher/committee-panel/courses/${workflowId}`);
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search batch, course or code..."
                        className="pl-10 bg-slate-50 border-slate-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
                            <Filter className="h-4 w-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="WITH_INSTRUCTOR">With Instructor</SelectItem>
                            <SelectItem value="SUBMITTED_TO_COMMITTEE">Pending Review</SelectItem>
                            <SelectItem value="COMMITTEE_APPROVED">Approved</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="RETURNED_TO_TEACHER">Returned</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={fetchWorkflows} className="shrink-0">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {filteredAndGroupedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <Inbox className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Batches Found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    filteredAndGroupedData.map((group) => (
                        <Card key={group.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all p-0">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer bg-white hover:bg-slate-50/50 transition-colors"
                                onClick={() => toggleBatch(group.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl transition-colors ${expandedBatches.has(group.id) ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            {group.batch ? (
                                                <>
                                                    {group.batch.shift === 'day' ? 'D-' : group.batch.shift === 'evening' ? 'E-' : ''}
                                                    {group.batch.name || group.batch.code}
                                                </>
                                            ) : 'Unknown Batch'}
                                            <Badge variant="secondary" className="text-xs font-mono">
                                                Sem {group.semester}
                                            </Badge>
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {group.workflows.length} Courses
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Mini Status Summary */}
                                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                        {group.workflows.filter(w => w.status === 'SUBMITTED_TO_COMMITTEE').length > 0 && (
                                            <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                                                <AlertCircle className="h-3 w-3" />
                                                {group.workflows.filter(w => w.status === 'SUBMITTED_TO_COMMITTEE').length} Pending
                                            </span>
                                        )}
                                        {group.workflows.filter(w => w.status === 'WITH_INSTRUCTOR').length > 0 && (
                                            <span className="hidden md:flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                                                <Shield className="h-3 w-3" />
                                                {group.workflows.filter(w => w.status === 'WITH_INSTRUCTOR').length} Waiting
                                            </span>
                                        )}
                                    </div>
                                    {expandedBatches.has(group.id) ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedBatches.has(group.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="border-t border-slate-100 bg-slate-50/50 p-2 md:p-4">
                                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-slate-50/80">
                                                        <TableRow>
                                                            <TableHead className="w-[40%] pl-6">Course</TableHead>
                                                            <TableHead>Instructor</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead className="text-right pr-6">Action</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {group.workflows.map((wf) => (
                                                            <TableRow
                                                                key={wf.id || wf._id}
                                                                className="hover:bg-slate-50 cursor-pointer group"
                                                                onClick={() => navigateToDetail(wf.id || wf._id)}
                                                            >
                                                                <TableCell className="pl-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                                            {wf.grade?.course?.name || "Unknown Course"}
                                                                        </span>
                                                                        <span className="text-xs text-slate-500 font-mono">
                                                                            {wf.grade?.course?.code || "-"}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                                            T
                                                                        </div>
                                                                        <span className="text-sm font-medium text-slate-600">
                                                                            {/* Ideally fetch teacher name */}
                                                                            Teacher
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getStatusBadge(wf.status)}
                                                                </TableCell>
                                                                <TableCell className="text-right pr-6">
                                                                    <div className="flex justify-end">
                                                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400" />
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
