"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    ExamCommittee,
} from "@/services/academic/types";
import { notifySuccess, notifyError } from "@/components/toast";
import { ShieldCheck, Users, Filter } from "lucide-react";
import { ExamCommitteeFormModal } from "./ExamCommitteeFormModal";
import { ExamCommitteeViewModal } from "./ExamCommitteeViewModal";
import {
    addCommitteeMemberAction,
    updateCommitteeMemberAction,
} from "../actions";
import {
    useExamCommittees,
    useDepartments,
    useBatches
} from "@/hooks/queries/useAcademicQueries";
import { useTeachers } from "@/hooks/queries/useTeacherQueries";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function ExamCommitteeManagementClient() {
    const { data: examCommittees = [], isLoading: isCommitteesLoading, refetch } = useExamCommittees();
    const { data: departments = [] } = useDepartments();
    const { data: batches = [] } = useBatches();
    const { data: teachers = [] } = useTeachers();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ExamCommittee | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [selectedShift, setSelectedShift] = useState<string>("all");
    const [selectedDept, setSelectedDept] = useState<string>("all");
    const [selectedBatch, setSelectedBatch] = useState<string>("all");

    const columns: Column<ExamCommittee>[] = useMemo(() => [
        {
            header: "Teacher",
            accessorKey: "teacher",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{item.teacher?.fullName || "Unknown"}</span>
                    <span className="text-xs text-slate-500">{item.teacher?.email}</span>
                </div>
            ),
        },
        {
            header: "Department",
            accessorKey: "department",
            cell: (item) => (
                <span className="font-medium text-slate-700">{item.department?.name || "N/A"}</span>
            ),
        },
        {
            header: "Shift",
            accessorKey: "shift",
            cell: (item) => (
                <Badge variant="outline" className="capitalize bg-slate-50 text-slate-700 border-slate-200 font-bold px-2.5 py-0.5">
                    {item.shift}
                </Badge>
            ),
        },
        {
            header: "Batch",
            accessorKey: "batch",
            cell: (item) => (
                item.batch ? (
                    <span className="font-medium text-slate-600">{item.batch.name}</span>
                ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-medium">General</Badge>
                )
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset shadow-none border-none ${item.status
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : "bg-slate-50 text-slate-500 ring-slate-200"
                    }`}>
                    {item.status ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ], []);

    const filteredData = useMemo(() => {
        const data = examCommittees.filter((member) => {
            const shiftMatch = selectedShift === "all" || member.shift === selectedShift;

            const deptId = (member.departmentId && typeof member.departmentId === 'object')
                ? (member.departmentId as any).id
                : member.departmentId;
            const deptMatch = selectedDept === "all" || deptId === selectedDept;

            const batchId = (member.batchId && typeof member.batchId === 'object')
                ? (member.batchId as any).id
                : member.batchId;
            const batchMatch = selectedBatch === "all" || batchId === selectedBatch;

            return shiftMatch && deptMatch && batchMatch;
        });

        return data.map(committee => {
            const foundTeacher = teachers.find((t: any) => t.id === committee.teacherId);
            const teacher = foundTeacher || committee.teacher;

            const deptId = (committee.departmentId && typeof committee.departmentId === 'object')
                ? (committee.departmentId as any).id
                : committee.departmentId;
            const foundDept = departments.find(d => d.id === deptId);
            const department = foundDept || committee.department;

            return {
                ...committee,
                teacher,
                department,
                teacherName: teacher?.fullName || "Unknown",
            };
        });
    }, [examCommittees, selectedShift, selectedDept, selectedBatch, teachers, departments]);

    const handleCreate = () => {
        setSelectedMember(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (member: ExamCommittee) => {
        setSelectedMember(member);
        setIsFormModalOpen(true);
    };

    const handleView = (member: ExamCommittee) => {
        setSelectedMember(member);
        setIsViewModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            const result = selectedMember
                ? await updateCommitteeMemberAction(selectedMember.id, null, formData)
                : await addCommitteeMemberAction(null, formData);

            if (result.success) {
                notifySuccess(`Member ${selectedMember ? "updated" : "assigned"} successfully`);
                setIsFormModalOpen(false);
                setSelectedMember(null);
                refetch();
            } else {
                notifyError(result.message || "Failed to save assignment");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save assignment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearFilters = () => {
        setSelectedShift("all");
        setSelectedDept("all");
        setSelectedBatch("all");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Exam Committee"
                    subtitle="Manage and assign teachers to departmental exam committees"
                    icon={ShieldCheck}
                />
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCreate}
                        className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" />
                        Assign Member
                    </Button>
                </div>
            </div>

            {/* Premium Filters Bar */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100/50">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Refine List</span>
                </div>

                <div className="flex flex-wrap gap-3 flex-1">
                    <Select value={selectedShift} onValueChange={setSelectedShift}>
                        <SelectTrigger className="w-[160px] rounded-xl border-slate-200 bg-white/50 focus:ring-amber-500">
                            <SelectValue placeholder="Shift" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="all">All Shifts</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                        <SelectTrigger className="w-[200px] rounded-xl border-slate-200 bg-white/50 focus:ring-amber-500">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 max-h-[300px]">
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white/50 focus:ring-amber-500">
                            <SelectValue placeholder="Batch" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 max-h-[300px]">
                            <SelectItem value="all">All Batches</SelectItem>
                            {batches.map((batch) => (
                                <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(selectedShift !== "all" || selectedDept !== "all" || selectedBatch !== "all") && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    >
                        Reset
                    </Button>
                )}
            </div>

            {isCommitteesLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <DataTable
                    data={filteredData}
                    columns={columns}
                    searchKey="teacherName"
                    searchPlaceholder="Search by teacher name..."
                    onView={handleView}
                    onEdit={handleEdit}
                />
            )}

            <ExamCommitteeFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedMember}
                departments={departments}
                batches={batches}
                teachers={teachers}
                isSubmitting={isSubmitting}
            />

            <ExamCommitteeViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                member={selectedMember}
            />
        </div>
    );
}
