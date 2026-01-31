"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    ChevronDown,
    ChevronUp,
    TrendingUp,
    GraduationCap,
    BookOpen,
    AlertTriangle,
    Award,
    Target,
    Loader2,
    Download,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isStudentUser } from "@/types/user";
import {
    useStudentGrades,
} from "@/hooks/queries/useEnrollmentQueries";
import { useProgram } from "@/hooks/queries/useAcademicQueries";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { useQuery } from "@tanstack/react-query";
import StudentLoading from "@/components/StudentLoading";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 100 },
    },
};

interface SemesterGroup {
    semester: number;
    courses: CourseGrade[];
    gpa: number;
    totalCredits: number;
    earnedCredits: number;
}

// Grade to color mapping
const getGradeColor = (grade: string | undefined, gradePoint: number | undefined) => {
    if (!grade || gradePoint === undefined) return "slate";
    if (gradePoint >= 3.5) return "emerald";
    if (gradePoint >= 3.0) return "green";
    if (gradePoint >= 2.5) return "blue";
    if (gradePoint >= 2.0) return "yellow";
    if (gradePoint >= 1.0) return "orange";
    return "red";
};

const getGradeBadgeClasses = (grade: string | undefined, gradePoint: number | undefined) => {
    const color = getGradeColor(grade, gradePoint);
    const colorMap: Record<string, string> = {
        emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
        slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };
    return colorMap[color] || colorMap.slate;
};

// Helper to get the letter grade from a course grade
const getLetterGrade = (grade: CourseGrade): string => {
    return grade.letterGrade || grade.grade || "N/A";
};

export default function GradeManagementClient() {
    const { user } = useAuth();
    const studentId = user?.id || (user as any)?._id || "";
    const programId = user && isStudentUser(user) ? user.programId : undefined;

    const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set([1]));

    // Fetch grades with marks breakdown
    const {
        data: grades = [],
        isLoading: gradesLoading,
        error: gradesError,
    } = useStudentGrades(studentId, { includeMarksBreakdown: true });

    // Fetch CGPA with full breakdown
    const { data: cgpaData, isLoading: cgpaLoading } = useQuery<{
        cgpa: number;
        totalCredits: number;
        totalCourses: number;
        semesterBreakdown: Record<number, { gpa: number; totalCredits: number; courses: number }>;
    }>({
        queryKey: ['cgpa-full', studentId],
        queryFn: () => courseGradeService.calculateCGPA(studentId) as any,
        enabled: !!studentId,
    });

    // Fetch program details for total credits required
    const { data: program } = useProgram(programId || "", {
        enabled: !!programId,
    });

    const isLoading = gradesLoading || cgpaLoading;

    // Calculate statistics
    const stats = useMemo(() => {
        const cgpa = cgpaData?.cgpa || 0;
        const totalCreditsEarned = cgpaData?.totalCredits || 0;
        const totalCreditsRequired = program?.totalCredits || 148; // Default 148 credits
        const remainingCredits = Math.max(0, totalCreditsRequired - totalCreditsEarned);

        // Find failed courses (grade point < 2.0 or F grade)
        const failedCourses = grades.filter(g =>
            g.isPublished && (g.gradePoint !== undefined && g.gradePoint < 2.0)
        );

        // Find retake courses (courses that need to be retaken)
        const retakeCourses = grades.filter(g =>
            g.isPublished && (getLetterGrade(g) === 'F')
        );

        // Current semester
        const currentSemester = grades.length > 0
            ? Math.max(...grades.map(g => g.semester))
            : 1;

        return {
            cgpa,
            totalCreditsEarned,
            totalCreditsRequired,
            remainingCredits,
            failedCourses,
            retakeCourses,
            currentSemester,
            totalCourses: grades.filter(g => g.isPublished).length,
            progressPercentage: totalCreditsRequired > 0
                ? Math.round((totalCreditsEarned / totalCreditsRequired) * 100)
                : 0,
        };
    }, [cgpaData, grades, program]);

    // Group grades by semester
    const semesterGroups = useMemo(() => {
        const groups: Record<number, SemesterGroup> = {};
        const semesterBreakdown = cgpaData?.semesterBreakdown || {};

        grades.forEach(grade => {
            if (!grade.isPublished) return;

            const semester = grade.semester;
            if (!groups[semester]) {
                const breakdown = semesterBreakdown[semester] || {};
                groups[semester] = {
                    semester,
                    courses: [],
                    gpa: breakdown.gpa || 0,
                    totalCredits: breakdown.totalCredits || 0,
                    earnedCredits: 0,
                };
            }
            groups[semester].courses.push(grade);

            // Calculate earned credits (only for passed courses)
            const course = grade.course as any;
            const credits = course?.credit || 0;
            if (grade.gradePoint && grade.gradePoint >= 2.0) {
                groups[semester].earnedCredits += credits;
            }
        });

        // Sort courses within each semester by course name
        Object.values(groups).forEach(group => {
            group.courses.sort((a, b) => {
                const nameA = (a.course as any)?.name || "";
                const nameB = (b.course as any)?.name || "";
                return nameA.localeCompare(nameB);
            });
        });

        // Sort semesters in descending order (newest first)
        return Object.values(groups).sort((a, b) => b.semester - a.semester);
    }, [grades, cgpaData]);

    const toggleSemester = (semester: number) => {
        const newSet = new Set(expandedSemesters);
        if (newSet.has(semester)) {
            newSet.delete(semester);
        } else {
            newSet.add(semester);
        }
        setExpandedSemesters(newSet);
    };

    if (isLoading) {
        return (
            <StudentLoading />
        );
    }

    if (gradesError) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/40">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Failed to load grades</h3>
                    <p className="text-slate-500 dark:text-slate-400">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 pb-8"
        >
            {/* Header */}
            <motion.header variants={itemVariants} className="glass-panel rounded-3xl p-6 border border-white/40 dark:border-slate-700/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                            <span className="text-primary-nexus">Academic</span> Grades
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            View your complete academic performance and semester-wise grades
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Download className="h-4 w-4" />
                        Download Transcript
                    </Button>
                </div>
            </motion.header>

            {/* Stats Overview */}
            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* CGPA Card */}
                <Card className="glass-panel p-6 border border-white/40 dark:border-slate-700/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-nexus/10 rounded-full blur-3xl -mr-10 -mt-10" />
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                            {stats.cgpa.toFixed(2)}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                            Overall CGPA
                        </p>
                        <div className="mt-4">
                            <Progress value={(stats.cgpa / 4.0) * 100} className="h-2 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                                <span>0.00</span>
                                <span>4.00</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Credits Completed */}
                <Card className="glass-panel p-6 border border-white/40 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.progressPercentage}%
                        </span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                        {stats.totalCreditsEarned}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Credits Earned
                    </p>
                    <div className="mt-4">
                        <Progress value={stats.progressPercentage} className="h-2 bg-slate-200 dark:bg-slate-700" />
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            of {stats.totalCreditsRequired} total required
                        </p>
                    </div>
                </Card>

                {/* Remaining Credits */}
                <Card className="glass-panel p-6 border border-white/40 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/40">
                            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Badge variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-xs">
                            Semester {stats.currentSemester}
                        </Badge>
                    </div>
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                        {stats.remainingCredits}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Credits Remaining
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                        {stats.totalCourses} courses completed
                    </p>
                </Card>

                {/* Failed/Retake Courses */}
                <Card className={`glass-panel p-6 border ${stats.failedCourses.length > 0 ? 'border-red-200 dark:border-red-900/50' : 'border-white/40 dark:border-slate-700/50'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${stats.failedCourses.length > 0 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {stats.failedCourses.length > 0 ? (
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            ) : (
                                <Award className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                            )}
                        </div>
                        {stats.failedCourses.length > 0 && (
                            <Badge className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-0 font-bold text-xs">
                                Action Needed
                            </Badge>
                        )}
                    </div>
                    <h3 className={`text-4xl font-black tracking-tight ${stats.failedCourses.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                        {stats.failedCourses.length}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {stats.failedCourses.length > 0 ? 'Courses to Retake' : 'All Courses Passed'}
                    </p>
                    {stats.failedCourses.length > 0 && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-4 font-medium">
                            {stats.retakeCourses.length} F grade{stats.retakeCourses.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </Card>
            </motion.section>

            {/* Failed Courses Alert */}
            {stats.failedCourses.length > 0 && (
                <motion.div variants={itemVariants}>
                    <Card className="p-4 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/20">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-red-800 dark:text-red-300">Courses Requiring Attention</h4>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    The following courses need to be retaken or improved:
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {stats.failedCourses.map((course, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="outline"
                                            className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 font-medium"
                                        >
                                            {(course.course as any)?.code || 'N/A'} - {getLetterGrade(course)} ({course.gradePoint?.toFixed(2) || '0.00'})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Semester-wise Grades */}
            <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary-nexus" />
                        Semester-wise Results
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (expandedSemesters.size === semesterGroups.length) {
                                setExpandedSemesters(new Set());
                            } else {
                                setExpandedSemesters(new Set(semesterGroups.map(g => g.semester)));
                            }
                        }}
                        className="text-sm font-bold text-primary-nexus hover:text-primary-nexus/80"
                    >
                        {expandedSemesters.size === semesterGroups.length ? 'Collapse All' : 'Expand All'}
                    </Button>
                </div>

                {semesterGroups.length === 0 ? (
                    <Card className="glass-panel border border-white/40 dark:border-slate-700/50 text-center p-0">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                                <Clock className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Published Grades Yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                Your grades will appear here once they are published by your instructors and approved by the exam committee.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {semesterGroups.map((group) => (
                            <Card
                                key={group.semester}
                                className="glass-panel border border-white/40 dark:border-slate-700/50 overflow-hidden p-0"
                            >
                                {/* Semester Header */}
                                <div
                                    className="p-4 md:p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => toggleSemester(group.semester)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${expandedSemesters.has(group.semester) ? 'bg-primary-nexus/10 text-primary-nexus' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} transition-colors`}>
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                                    Semester {group.semester}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                    {group.courses.length} Courses • {group.totalCredits} Credits
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                    {group.gpa.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                                                    GPA
                                                </p>
                                            </div>
                                            <Badge className="bg-primary-nexus/10 text-primary-nexus border-0 font-bold md:hidden">
                                                GPA: {group.gpa.toFixed(2)}
                                            </Badge>
                                            {expandedSemesters.has(group.semester) ? (
                                                <ChevronUp className="h-5 w-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Courses Table */}
                                <AnimatePresence>
                                    {expandedSemesters.has(group.semester) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-slate-100 dark:border-slate-800">
                                                {/* Desktop Table */}
                                                <div className="hidden md:block overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                                            <tr>
                                                                <th className="text-left py-3 px-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    Course Name
                                                                </th>
                                                                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    Course Code
                                                                </th>
                                                                <th className="text-center py-3 px-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    Credit
                                                                </th>
                                                                <th className="text-center py-3 px-3 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                                                    In-Course
                                                                </th>
                                                                <th className="text-center py-3 px-3 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                                                                    Final
                                                                </th>
                                                                <th className="text-center py-3 px-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    Grade
                                                                </th>
                                                                <th className="text-center py-3 px-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    Point
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.courses.map((course, idx) => {
                                                                const courseData = course.course as any;
                                                                const isFailed = course.gradePoint !== undefined && course.gradePoint < 2.0;
                                                                const marks = course.marksBreakdown;

                                                                return (
                                                                    <tr
                                                                        key={course.id || idx}
                                                                        className={`border-b border-slate-100 dark:border-slate-800 last:border-0 ${isFailed ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'} transition-colors`}
                                                                    >
                                                                        <td className="py-4 px-6">
                                                                            <div className="flex items-center gap-3">
                                                                                {isFailed && (
                                                                                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                                                                )}
                                                                                <span className={`font-bold ${isFailed ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                                                                                    {courseData?.name || "Unknown Course"}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-4 px-4">
                                                                            <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                                                                {courseData?.code || "N/A"}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-4 px-4 text-center">
                                                                            <Badge variant="outline" className="border-slate-200 dark:border-slate-700 font-bold">
                                                                                {courseData?.credit || 0}
                                                                            </Badge>
                                                                        </td>
                                                                        <td className="py-4 px-3 text-center">
                                                                            {marks?.inCourse ? (
                                                                                <div className="flex flex-col items-center">
                                                                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                                        {marks.inCourse.obtained.toFixed(1)}
                                                                                    </span>
                                                                                    <span className="text-xs text-slate-400">/ {marks.inCourse.total}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-xs text-slate-400">—</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-4 px-3 text-center">
                                                                            {marks?.final ? (
                                                                                <div className="flex flex-col items-center">
                                                                                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                                                                        {marks.final.obtained.toFixed(1)}
                                                                                    </span>
                                                                                    <span className="text-xs text-slate-400">/ {marks.final.total}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-xs text-slate-400">—</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-4 px-4 text-center">
                                                                            <Badge className={`${getGradeBadgeClasses(getLetterGrade(course), course.gradePoint)} font-black text-sm px-3`}>
                                                                                {getLetterGrade(course)}
                                                                            </Badge>
                                                                        </td>
                                                                        <td className="py-4 px-6 text-center">
                                                                            <span className={`text-lg font-black ${isFailed ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                                                                                {course.gradePoint?.toFixed(2) || "0.00"}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Mobile Cards */}
                                                <div className="md:hidden p-4 space-y-3">
                                                    {group.courses.map((course, idx) => {
                                                        const courseData = course.course as any;
                                                        const isFailed = course.gradePoint !== undefined && course.gradePoint < 2.0;
                                                        const marks = course.marksBreakdown;

                                                        return (
                                                            <div
                                                                key={course.id || idx}
                                                                className={`p-4 rounded-xl ${isFailed ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700'}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            {isFailed && <XCircle className="h-4 w-4 text-red-500" />}
                                                                            <h4 className={`font-bold ${isFailed ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                                                                                {courseData?.name || "Unknown"}
                                                                            </h4>
                                                                        </div>
                                                                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                                                                            {courseData?.code || "N/A"} • {courseData?.credit || 0} Credits
                                                                        </p>
                                                                    </div>
                                                                    <Badge className={`${getGradeBadgeClasses(getLetterGrade(course), course.gradePoint)} font-black`}>
                                                                        {getLetterGrade(course)}
                                                                    </Badge>
                                                                </div>

                                                                {/* Marks Breakdown for Mobile */}
                                                                {marks && (marks.inCourse.total > 0 || marks.final.total > 0) && (
                                                                    <div className="flex gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                                        <div className="flex-1 text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase block">In-Course</span>
                                                                            <span className="text-sm font-black text-blue-700 dark:text-blue-300">
                                                                                {marks.inCourse.obtained.toFixed(1)}/{marks.inCourse.total}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex-1 text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                                                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase block">Final</span>
                                                                            <span className="text-sm font-black text-purple-700 dark:text-purple-300">
                                                                                {marks.final.obtained.toFixed(1)}/{marks.final.total}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Grade Point</span>
                                                                    <span className={`text-xl font-black ${isFailed ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                                                                        {course.gradePoint?.toFixed(2) || "0.00"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Semester Summary Footer */}
                                                <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/80 flex flex-wrap justify-between items-center gap-4">
                                                    <div className="flex items-center gap-6">
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Courses</span>
                                                            <p className="text-lg font-black text-slate-800 dark:text-white">{group.courses.length}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Credits</span>
                                                            <p className="text-lg font-black text-slate-800 dark:text-white">{group.totalCredits}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Semester GPA</span>
                                                        <p className="text-2xl font-black text-primary-nexus">{group.gpa.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
}
