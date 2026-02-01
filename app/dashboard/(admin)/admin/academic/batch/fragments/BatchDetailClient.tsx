"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    academicService,
    Batch,
    AcademicApiError,
} from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { toast } from "sonner";
import {
    ArrowLeft,
    Users,
    GraduationCap,
    Calendar,
    UserCheck,
    User,
    Edit2,
    Check,
} from "lucide-react";
import { assignCounselorAction } from "../actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface BatchDetailClientProps {
    id: string;
}

export default function BatchDetailClient({ id }: BatchDetailClientProps) {
    const router = useRouter();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Counselor Assignment State
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedCounselor, setSelectedCounselor] = useState<Teacher | null>(
        null
    );
    const [assignedCounselor, setAssignedCounselor] = useState<
        Teacher | { fullName: string; email: string } | null
    >(null);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (id) {
            fetchBatch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        const fetchCounselor = async () => {
            if (
                batch?.counselorId &&
                typeof batch.counselorId === "string" &&
                !batch.counselor
            ) {
                try {
                    const teacher = await teacherService.getById(batch.counselorId);
                    setAssignedCounselor(teacher);
                } catch (error) {
                    console.error("Failed to fetch counselor details", error);
                    setAssignedCounselor(null);
                }
            } else if (batch?.counselor) {
                setAssignedCounselor(batch.counselor);
            } else {
                setAssignedCounselor(null);
            }
        };
        fetchCounselor();
    }, [batch]);

    useEffect(() => {
        if (isAssignDialogOpen) {
            fetchTeachers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAssignDialogOpen, searchQuery]);

    const fetchBatch = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getBatchById(id);
            setBatch(data);
        } catch (error) {
            const message =
                error instanceof AcademicApiError
                    ? error.message
                    : "Failed to load batch details";
            toast.error(message);
            router.push("/dashboard/admin/academic/batch");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeachers = async () => {
        setIsLoadingTeachers(true);
        try {
            const { teachers } = await teacherService.getAll({
                search: searchQuery,
                limit: 10,
            });
            setTeachers(teachers);
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        } finally {
            setIsLoadingTeachers(false);
        }
    };

    const handleAssignCounselor = async () => {
        if (!selectedCounselor || !batch) return;
        setIsAssigning(true);
        try {
            const formData = new FormData();
            formData.append("counselorId", selectedCounselor.id);
            const result = await assignCounselorAction(batch.id, null, formData);

            if (result.success) {
                toast.success("Counselor assigned successfully");
                setAssignedCounselor(selectedCounselor);
                await fetchBatch();
                setIsAssignDialogOpen(false);
                setSelectedCounselor(null);
            } else {
                toast.error(result.message || "Failed to assign counselor");
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to assign counselor");
        } finally {
            setIsAssigning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!batch) {
        return null;
    }

    const batchDisplayName = batch.code
        ? batch.shift
            ? `${batch.shift === "evening" ? "E" : "D"}-${batch.name}`
            : batch.name
        : batch.name;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === "string") return item;
        if (typeof item === "object" && item.name) return item.name;
        return "N/A";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Batch Details</h1>
                    <p className="text-slate-500 font-medium">{batchDisplayName}</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100/60 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl ring-1 ring-amber-100">
                            <Users className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Basic Information
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Batch Name
                                </label>
                                <p className="text-base font-semibold text-slate-900 mt-1">
                                    {batchDisplayName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Year
                                </label>
                                <p className="text-base font-semibold text-slate-900 mt-1">
                                    {batch.year}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Shift
                            </label>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {batch.shift
                                    ? batch.shift === "evening"
                                        ? "Evening"
                                        : "Day"
                                    : "N/A"}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Current Semester
                                </label>
                                <p className="text-base font-semibold text-slate-900 mt-1">
                                    {batch.currentSemester}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">
                                    Status
                                </label>
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${batch.status
                                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                                        : "bg-slate-50 text-slate-600 ring-slate-200"
                                        }`}
                                >
                                    {batch.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Session
                            </label>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {getName(batch.sessionId)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Academic Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100/60 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl ring-1 ring-amber-100">
                            <GraduationCap className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Academic Information
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Program
                            </label>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {getName(batch.programId)}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Department
                            </label>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {getName(batch.departmentId)}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Max Students
                                </label>
                                <p className="text-base font-semibold text-slate-900 mt-1">
                                    {batch.maxStudents}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Current Students
                                </label>
                                <p className="text-base font-semibold text-slate-900 mt-1">
                                    {batch.currentStudents}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leadership Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100/60 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6 justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 rounded-xl ring-1 ring-amber-100">
                                <UserCheck className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Leadership
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Counselor
                                </label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold text-xs uppercase"
                                    onClick={() => setIsAssignDialogOpen(true)}
                                >
                                    <Edit2 className="h-3 w-3 mr-1.5" />
                                    {batch.counselor ? "Change" : "Assign"}
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 mt-1 px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-100">
                                <User className="h-4 w-4 text-amber-400" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {assignedCounselor?.fullName || "Not Assigned"}
                                    </p>
                                    {assignedCounselor?.email && (
                                        <p className="text-[11px] font-medium text-slate-500">
                                            {assignedCounselor.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Class Representative
                            </label>
                            <div className="flex items-center gap-3 mt-2 px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-100">
                                <User className="h-4 w-4 text-amber-400" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {batch.classRepresentative?.fullName || "Not Assigned"}
                                    </p>
                                    {batch.classRepresentative?.registrationNumber && (
                                        <p className="text-[11px] font-medium text-slate-500">
                                            Reg: {batch.classRepresentative.registrationNumber}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Duration Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100/60 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl ring-1 ring-amber-100">
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Duration</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Start Date
                            </label>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {batch.startDate
                                    ? new Date(batch.startDate).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                End Date
                            </label>
                            <p className="text-base font-semibold text-slate-900 mt-1">
                                {batch.endDate
                                    ? new Date(batch.endDate).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border-amber-100 p-0 overflow-hidden rounded-2xl shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-400" />
                    <DialogHeader className="px-6 pt-8 pb-4">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Assign Batch Counselor</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Command className="rounded-lg border shadow-md">
                            <CommandInput
                                placeholder="Search teachers..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {isLoadingTeachers
                                        ? "Loading teachers..."
                                        : "No teachers found."}
                                </CommandEmpty>
                                <CommandGroup>
                                    {teachers.map((teacher) => (
                                        <CommandItem
                                            key={teacher.id}
                                            value={teacher.fullName}
                                            onSelect={() => setSelectedCounselor(teacher)}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex flex-col">
                                                    <span>{teacher.fullName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {teacher.email}
                                                    </span>
                                                </div>
                                                {selectedCounselor?.id === teacher.id && (
                                                    <Check className="h-4 w-4 text-amber-600" />
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                    <DialogFooter className="bg-amber-50/50 px-6 py-5 border-t border-amber-100">
                        <Button
                            variant="outline"
                            onClick={() => setIsAssignDialogOpen(false)}
                            className="border-amber-200 text-slate-600 hover:bg-amber-50 rounded-xl px-6 h-11 font-bold uppercase text-xs tracking-wider transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignCounselor}
                            disabled={!selectedCounselor || isAssigning}
                            className="bg-amber-600 hover:bg-amber-700 text-white shadow-md rounded-xl px-8 h-11 font-bold uppercase text-xs tracking-wider transition-all active:scale-95 ml-2"
                        >
                            {isAssigning ? "Assigning..." : "Assign Counselor"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
