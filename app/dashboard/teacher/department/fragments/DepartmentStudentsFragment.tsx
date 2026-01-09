"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Search, GraduationCap, X } from "lucide-react";

interface Student {
    id: string;
    fullName: string;
    registrationNumber: string;
    email: string;
    batch?: {
        id: string;
        name: string;
        shift?: string;
        counselor?: {
            fullName: string;
        };
    };
    currentSemester: number;
    enrollmentStatus: string;
}

interface Batch {
    id: string;
    name: string;
    shift?: string;
}

interface DepartmentStudentsFragmentProps {
    students: Student[];
    batches: Batch[];
}

export default function DepartmentStudentsFragment({ students, batches }: DepartmentStudentsFragmentProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState<string>("all");

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase();
        const fullName = student.fullName || "";
        const regNum = student.registrationNumber || "";
        const email = student.email || "";

        const matchesSearch =
            fullName.toLowerCase().includes(query) ||
            regNum.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query);

        const matchesBatch = selectedBatchId === "all" || student.batch?.id === selectedBatchId;

        return matchesSearch && matchesBatch;
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'enrolled': return "success";
            case 'graduated': return "default";
            case 'dropped_out': return "destructive";
            case 'suspended': return "destructive";
            default: return "secondary";
        }
    };

    // Custom Badge style wrapper since variant names might not perfectly match standard UI kit
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            enrolled: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
            graduated: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200",
            dropped_out: "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200",
            suspended: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200",
            default: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200"
        };

        const style = styles[status] || styles.default;

        return (
            <Badge className={`capitalize border shadow-none ${style}`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search students by name, ID, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-12 border-none bg-transparent focus-visible:ring-0 text-sm"
                        />
                    </div>
                </div>

                <div className="w-full md:w-64">
                    <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                        <SelectTrigger className="h-[3.6rem] rounded-[1.5rem] bg-white border-slate-200">
                            <SelectValue placeholder="All Batches" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {batches.map(batch => (
                                <SelectItem key={batch.id} value={batch.id}>
                                    {batch.shift === 'evening' ? 'E-' : 'D-'}{batch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-slate-700">Student Info</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center">Registration No.</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center">Batch</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center">Semester</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="p-3 rounded-full bg-slate-50 mb-2">
                                            <Search className="h-6 w-6 opacity-50" />
                                        </div>
                                        <p>No students found matching your criteria.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => (
                                <TableRow
                                    key={student.id}
                                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/teacher/department/student/${student.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                                                {student.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{student.fullName}</div>
                                                <div className="text-xs text-slate-500">{student.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-slate-600">
                                        {student.registrationNumber}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600">
                                                {student.batch?.name ? (
                                                    <>{student.batch.shift === 'evening' ? 'E' : 'D'}-{student.batch.name}</>
                                                ) : "N/A"}
                                            </Badge>
                                            {student.batch?.counselor && (
                                                <span className="text-[10px] text-slate-400">
                                                    {student.batch.counselor.fullName}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-slate-600">
                                        Level-Term {student.currentSemester}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={student.enrollmentStatus} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-center text-slate-400">
                Showing {filteredStudents.length} of {students.length} students
            </div>
        </div>
    );
}
