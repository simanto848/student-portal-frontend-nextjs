"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    User,
    BookOpen,
    GraduationCap,
    Award,
    Sparkles,
    LayoutDashboard,
} from "lucide-react";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { studentService, Student } from "@/services/user/student.service";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { batchService } from "@/services/academic/batch.service";
import { programService } from "@/services/academic/program.service";
import { sessionService } from "@/services/academic/session.service";
import { departmentService } from "@/services/academic/department.service";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import StudentDetailsDialog from "../../fragments/StudentDetailsDialog";

export default function StudentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params?.studentId as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [grades, setGrades] = useState<CourseGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cgpa, setCgpa] = useState<number | null>(null);

    // Reference Data
    const [batches, setBatches] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails();
        }
    }, [studentId]);

    const fetchStudentDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch everything in parallel
            const [
                studentData,
                gradesData,
                batchesData,
                programsData,
                sessionsData,
                departmentsData
            ] = await Promise.all([
                studentService.getById(studentId),
                courseGradeService.list({ studentId, limit: 1000 }),
                batchService.getAllBatches({ limit: 1000 }),
                programService.getAllPrograms(),
                sessionService.getAllSessions(),
                departmentService.getAllDepartments()
            ]);

            setStudent(studentData);
            setGrades(gradesData.grades || []);
            setBatches(batchesData);
            setPrograms(programsData);
            setSessions(sessionsData);
            setDepartments(departmentsData);

            // Calculate or fetch CGPA if available
            try {
                const cgpaData = await courseGradeService.calculateCGPA(studentId);
                setCgpa(cgpaData.cgpa);
            } catch (e) {
                console.log("CGPA not available yet");
            }

        } catch (error) {
            console.error("Failed to load student details", error);
            toast.error("Failed to load student details");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2dd4bf]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <User className="h-6 w-6 text-[#2dd4bf]/40 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-slate-500">
                <User className="h-12 w-12 mb-4 text-slate-300" />
                <p>Student not found.</p>
                <Button variant="link" onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    // Helper functions for manual name resolution
    const getName = (list: any[], id: string) => {
        const item = list.find((i) => (i.id || i._id) === id);
        return item ? item.name : "N/A";
    };

    const getProgramName = (id: string) => {
        const item = programs.find((i) => (i.id || i._id) === id);
        return item ? (item.shortName || item.name) : "N/A";
    };

    const getBatchLabel = (bId: string) => {
        const b = batches.find(x => (x.id || x._id) === bId);
        if (!b) return "N/A";
        const shift = String(b.shift || "").toLowerCase();
        const prefix = shift === "evening" ? "E" : "D";
        return `${prefix}-${b.name || b.code}`;
    };

    const InfoCard = ({ icon: Icon, title, children, className }: any) => (
        <GlassCard className={cn("p-8 border-slate-200/60 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-[#2dd4bf]/5 transition-all duration-500 overflow-hidden relative group", className)}>
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Icon className="w-24 h-24 text-slate-950 dark:text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] rounded-2xl ring-1 ring-[#2dd4bf]/20">
                        <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        {title}
                    </h2>
                </div>
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </GlassCard>
    );

    const LabelValue = ({ label, value }: any) => (
        <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1.5 block">
                {label}
            </label>
            <p className="text-lg font-black text-slate-900 dark:text-white leading-tight break-words">
                {value || "N/A"}
            </p>
        </div>
    );

    // Group grades by semester
    const gradesBySemester = grades.reduce((acc: any, grade) => {
        const semester = grade.semester || 0;
        if (!acc[semester]) {
            acc[semester] = [];
        }
        acc[semester].push(grade);
        return acc;
    }, {});

    const semesters = Object.keys(gradesBySemester).sort((a, b) => Number(b) - Number(a)); // Descending order

    return (
        <div className="space-y-8 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{student.fullName}</h1>
                            <Badge className={cn(
                                "border-2 font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-xl shadow-none",
                                student.enrollmentStatus === 'enrolled' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                student.enrollmentStatus === 'graduated' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                                student.enrollmentStatus === 'dropped_out' && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                                (!student.enrollmentStatus || student.enrollmentStatus === 'suspended') && "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                            )}>
                                {student.enrollmentStatus?.replace('_', ' ') || "OFFLINE"}
                            </Badge>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm italic">Detailed student information and academic records.</p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsDetailsDialogOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Sparkles className="h-4 w-4 mr-2 text-[#2dd4bf]" />
                    Full Details
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <InfoCard icon={User} title="Personal Info">
                    <LabelValue label="Full Name" value={student.fullName} />
                    <LabelValue label="Email" value={student.email} />
                    <LabelValue label="Registration ID" value={student.registrationNumber} />
                </InfoCard>

                <InfoCard icon={GraduationCap} title="Academic Info">
                    <div className="grid grid-cols-2 gap-4">
                        <LabelValue label="Batch" value={getBatchLabel(student.batchId)} />
                        <LabelValue label="Session" value={getName(sessions, student.sessionId)} />
                    </div>
                    <LabelValue label="Program" value={getProgramName(student.programId)} />
                    <LabelValue label="Department" value={getName(departments, student.departmentId)} />
                </InfoCard>

                <InfoCard icon={Award} title="Academic Overview">
                    <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        <span className="text-5xl font-black text-[#0d9488] dark:text-[#2dd4bf] mb-1 tracking-tighter">{cgpa ? cgpa.toFixed(2) : "0.00"}</span>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Total CGPA</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                            <span className="block font-black text-slate-900 dark:text-white text-lg leading-tight">{student.currentSemester}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Current Semester</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-black text-slate-900 dark:text-white text-lg leading-tight">{Object.keys(gradesBySemester).length}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Semesters Passed</span>
                        </div>
                    </div>
                </InfoCard>
            </div>

            {/* Grades Section */}
            <div className="space-y-8 pt-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] rounded-2xl ring-1 ring-[#2dd4bf]/20">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Academic History
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Detailed Record of all semesters</p>
                    </div>
                </div>

                {semesters.length === 0 ? (
                    <GlassCard className="p-20 text-center border-slate-200/60 dark:border-slate-800 border-dashed">
                        <BookOpen className="h-16 w-16 mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                        <p className="font-black text-sm text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Zero academic nodes recognized.</p>
                    </GlassCard>
                ) : (
                    semesters.map((semester) => (
                        <GlassCard key={semester} className="border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-slate-200/10 dark:shadow-slate-900/30 overflow-hidden p-0 group">
                            <div className="px-8 py-5 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/50 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 dark:text-[#2dd4bf] text-sm uppercase tracking-widest flex items-center gap-3">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Semester {semester}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{gradesBySemester[semester].length} Modules</span>
                                    <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#2dd4bf] w-full" />
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                        <TableRow className="hover:bg-transparent border-slate-200/60 dark:border-slate-800/50">
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Course Title</TableHead>
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Credits</TableHead>
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Marks</TableHead>
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Grade</TableHead>
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right pr-10">Grade Point</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {gradesBySemester[semester].map((grade: CourseGrade) => (
                                            <TableRow key={grade.id} className="hover:bg-[#2dd4bf]/5 transition-colors border-b border-slate-100 dark:border-slate-800/50 group/row">
                                                <TableCell className="p-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900 dark:text-white group-hover/row:text-[#2dd4bf] transition-colors leading-tight">{grade.course?.name || "Unknown Module"}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1 font-mono">{grade.course?.code}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-6 text-center">
                                                    <Badge className="bg-slate-950 dark:bg-[#2dd4bf]/10 text-white dark:text-[#2dd4bf] border-none px-3 py-1 rounded-xl text-[10px] font-black tracking-widest">
                                                        {grade.course?.credit || "-"} CR
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-6 text-center font-black text-slate-600 dark:text-slate-400 text-xs tracking-tight">
                                                    {grade.totalMarksObtained} <span className="text-[10px] text-slate-300 dark:text-slate-700">/</span> {grade.totalMarks}
                                                </TableCell>
                                                <TableCell className="p-6 text-center">
                                                    <Badge className={cn(
                                                        "font-black text-[10px] w-12 justify-center rounded-xl py-1 tracking-widest uppercase border-2",
                                                        grade.grade === 'A+' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                                        grade.grade === 'A' && "bg-emerald-500/5 text-emerald-500 dark:text-emerald-400 border-emerald-500/10",
                                                        grade.grade === 'F' && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                                                        !grade.grade && "bg-slate-500/10 text-slate-500 dark:text-slate-600 border-slate-500/20"
                                                    )}>
                                                        {grade.grade || "-"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-6 text-right pr-10 font-black text-slate-900 dark:text-white text-lg tracking-tighter">
                                                    {grade.gradePoint?.toFixed(2) || "0.00"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            <StudentDetailsDialog
                isOpen={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
                student={student}
                batches={batches}
                programs={programs}
                sessions={sessions}
                departments={departments}
            />
        </div>
    );
}
