"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    User,
    Mail,
    BookOpen,
    GraduationCap,
    Calendar,
    Award,
    BadgeCheck,
} from "lucide-react";
import { studentService, Student } from "@/services/user/student.service";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
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

export default function StudentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params?.studentId as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [grades, setGrades] = useState<CourseGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cgpa, setCgpa] = useState<number | null>(null);

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails();
        }
    }, [studentId]);

    const fetchStudentDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch functionality
            const [studentData, gradesData] = await Promise.all([
                studentService.getById(studentId),
                courseGradeService.list({ studentId, limit: 1000 }) // Fetch all grades for the student
            ]);

            setStudent(studentData);
            setGrades(gradesData.grades || []);

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
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!student) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-slate-500">
                    <User className="h-12 w-12 mb-4 text-slate-300" />
                    <p>Student not found.</p>
                    <Button variant="link" onClick={() => router.back()}>Go Back</Button>
                </div>
            </DashboardLayout>
        )
    }

    const InfoCard = ({ icon: Icon, title, children, className }: any) => (
        <div className={cn("bg-white rounded-[1.5rem] shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300", className)}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                    {title}
                </h2>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const LabelValue = ({ label, value }: any) => (
        <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1 block">
                {label}
            </label>
            <p className="text-base font-bold text-slate-800 break-words">
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
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900">{student.fullName}</h1>
                            <Badge variant="outline" className={cn(
                                "font-bold border-0 shadow-none",
                                student.enrollmentStatus === 'enrolled' && "bg-emerald-100 text-emerald-700",
                                student.enrollmentStatus === 'graduated' && "bg-blue-100 text-blue-700",
                                student.enrollmentStatus === 'dropped_out' && "bg-rose-100 text-rose-700",
                                (!student.enrollmentStatus || student.enrollmentStatus === 'suspended') && "bg-slate-100 text-slate-600"
                            )}>
                                {student.enrollmentStatus?.replace('_', ' ').toUpperCase() || "UNKNOWN"}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium">Student Profile & Academic Record</p>
                    </div>
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
                            <LabelValue label="Batch" value={student.batch?.name ? (student.batch.shift === 'evening' ? `E-${student.batch.name}` : `D-${student.batch.name}`) : "N/A"} />
                            <LabelValue label="Session" value={student.session?.name} />
                        </div>
                        <LabelValue label="Program" value={student.program?.shortName} />
                        <LabelValue label="Department" value={student.department?.name} />
                    </InfoCard>

                    <InfoCard icon={Award} title="Performance">
                        <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-4xl font-black text-indigo-600 mb-1">{cgpa ? cgpa.toFixed(2) : "0.00"}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current CGPA</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="text-center">
                                <span className="block font-bold text-slate-800">{student.currentSemester}</span>
                                <span className="text-xs text-slate-400">Current Semester</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-slate-800">{Object.keys(gradesBySemester).length}</span>
                                <span className="text-xs text-slate-400">Semesters Attended</span>
                            </div>
                        </div>
                    </InfoCard>
                </div>

                {/* Grades Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        Academic History
                    </h2>

                    {semesters.length === 0 ? (
                        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 p-12 text-center text-slate-400">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                            <p className="font-medium">No graded courses found for this student.</p>
                        </div>
                    ) : (
                        semesters.map((semester) => (
                            <div key={semester} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-700">Level-Term {semester}</h3>
                                    <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">
                                        {gradesBySemester[semester].length} Courses
                                    </Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent bg-white">
                                            <TableHead className="font-bold text-slate-700 w-[40%]">Course</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-center">Credits</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-center">Marks</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-center">Grade</TableHead>
                                            <TableHead className="font-bold text-slate-700 text-right">Point</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {gradesBySemester[semester].map((grade: CourseGrade) => (
                                            <TableRow key={grade.id} className="hover:bg-indigo-50/30">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{grade.course?.title || "Unknown Course"}</span>
                                                        <span className="text-xs text-slate-400">{grade.course?.code}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center text-slate-600 font-medium">
                                                    {grade.course?.credits || "-"}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-slate-600">
                                                    {grade.totalMarksObtained}/{grade.totalMarks}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className={cn(
                                                        "font-bold w-12 justify-center",
                                                        grade.grade === 'A+' && "bg-emerald-100 text-emerald-700",
                                                        grade.grade === 'A' && "bg-emerald-50 text-emerald-600",
                                                        grade.grade === 'F' && "bg-rose-100 text-rose-700",
                                                        !grade.grade && "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {grade.grade || "-"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-700">
                                                    {grade.gradePoint?.toFixed(2) || "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
