"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    BookOpen,
    Users,
    Calendar,
    ClipboardList,
    BarChart3,
    RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DashboardSkeleton } from "@/components/dashboard/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { useTeacherCourseDashboard } from "@/hooks/queries/useTeacherQueries";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const formatBatchName = (batch: any) => {
    if (!batch) return "N/A";
    const prefix = batch.shift === "day" ? "D-" : batch.shift === "evening" ? "E-" : "";
    return `${prefix}${batch.name}`;
};

export default function CourseManagementClient() {
    const { user } = useAuth();
    const theme = useDashboardTheme();
    const router = useRouter();
    const instructorId = user?.id || user?._id || "";
    const [searchQuery, setSearchQuery] = useState("");

    const { courses, isLoading, isError, error, refetch } =
        useTeacherCourseDashboard(instructorId);

    const filteredCourses = useMemo(() => {
        if (!searchQuery) return courses;
        const query = searchQuery.toLowerCase();
        return courses.filter(
            (c) =>
                c.course?.name?.toLowerCase().includes(query) ||
                c.course?.code?.toLowerCase().includes(query) ||
                c.batch?.name?.toLowerCase().includes(query),
        );
    }, [courses, searchQuery]);

    const totalStudents = useMemo(() => {
        return courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
    }, [courses]);

    if (isLoading) {
        return <DashboardSkeleton layout="hero-cards" cardCount={6} withLayout={false} />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Courses"
                subtitle={`Managing ${courses.length} courses with ${totalStudents} total students`}
                icon={BookOpen}
                extraActions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className={`hidden sm:flex items-center gap-2 border-slate-200 text-slate-600 hover:${theme.colors.accent.primary} hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/5 rounded-xl transition-all`}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                }
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:max-w-md group">
                    <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:${theme.colors.accent.primary} transition-colors`} />
                    <Input
                        placeholder="Search by name, code or batch..."
                        className={`pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#2dd4bf] transition-all`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant="secondary" className={`${theme.colors.accent.primary.replace('text-', 'bg-')}/10 ${theme.colors.accent.primary} hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/20 rounded-lg px-3 py-1 text-xs font-semibold`}>
                        {filteredCourses.length} {filteredCourses.length === 1 ? 'Result' : 'Results'}
                    </Badge>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((assignment) => (
                            <motion.div
                                key={assignment.id}
                                variants={item}
                                layout
                                transition={{ duration: 0.3 }}
                            >
                                <CourseCard
                                    assignment={assignment}
                                    theme={theme}
                                    onViewClass={() =>
                                        router.push(`/dashboard/teacher/courses/${assignment.id}`)
                                    }
                                    onViewAttendance={() =>
                                        router.push(
                                            `/dashboard/teacher/attendance?courseId=${assignment.courseId}&batchId=${assignment.batchId}`,
                                        )
                                    }
                                    onViewGrades={() =>
                                        router.push(
                                            `/dashboard/teacher/grading?courseId=${assignment.courseId}`,
                                        )
                                    }
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700"
                        >
                            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-700 flex items-center justify-center rounded-2xl mb-4">
                                <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {searchQuery ? "No matching courses" : "No courses assigned"}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs text-center">
                                {searchQuery
                                    ? "We couldn't find any courses matching your search. Try different keywords."
                                    : "You don't have any courses assigned to you at the moment."}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="link"
                                    className={`mt-2 ${theme.colors.accent.primary}`}
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear search
                                </Button>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

interface CourseCardProps {
    assignment: any;
    theme: any;
    onViewClass: () => void;
    onViewAttendance: () => void;
    onViewGrades: () => void;
}

function CourseCard({
    assignment,
    theme,
    onViewClass,
    onViewAttendance,
    onViewGrades,
}: CourseCardProps) {
    const accentPrimary = theme.colors.accent.primary;
    const accentSecondary = theme.colors.accent.secondary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/5';
    const accentBgMuted = accentPrimary.replace('text-', 'bg-') + '/10';

    return (
        <motion.div
            whileHover={{ y: -5, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <Card className={`group h-full flex flex-col bg-white dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:${accentPrimary.replace('text-', 'border-')}/20 transition-all duration-300 overflow-hidden rounded-3xl`}>
                <CardHeader className="p-0">
                    <div className={`relative h-2 ${accentSecondary}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline" className={`${accentBgSubtle} ${accentPrimary} border-indigo-100 dark:border-indigo-800 font-bold tracking-tight px-2.5 py-0.5 rounded-lg text-xs uppercase`}>
                                {assignment.course?.code || "N/A"}
                            </Badge>
                            <div className={`p-2 bg-slate-50 dark:bg-slate-700 rounded-xl group-hover:${accentBgMuted} transition-colors`}>
                                <BookOpen className={`h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:${accentPrimary}`} />
                            </div>
                        </div>
                        <CardTitle className={`text-xl font-black text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[3rem] group-hover:${accentPrimary} transition-colors`}>
                            {assignment.course?.name || "Unknown Course"}
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="px-6 py-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100/50 dark:border-slate-600/30 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className={`h-3.5 w-3.5 ${accentPrimary}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Batch</span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {formatBatchName(assignment.batch)}
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100/50 dark:border-slate-600/30 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className={`h-3.5 w-3.5 ${accentPrimary}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Semester</span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {assignment.semester || "1"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${accentSecondary}`} />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                {assignment.studentsCount || 0} Students Enrolled
                            </span>
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                                    <Users className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-2 grid grid-cols-4 gap-2">
                    <Button
                        className={`col-span-2 shadow-md rounded-xl h-11 font-bold uppercase text-xs tracking-wider transition-all active:scale-95 group-hover:shadow-lg bg-[#2dd4bf] hover:bg-[#25b0a0] text-white dark:text-slate-900 border-transparent hover:shadow-teal-500/20`}
                        onClick={onViewClass}
                    >
                        View Class
                    </Button>
                    <Button
                        variant="outline"
                        className={`bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 rounded-xl h-11 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-500`}
                        title="Attendance"
                        onClick={onViewAttendance}
                    >
                        <ClipboardList className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className={`bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 rounded-xl h-11 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-500`}
                        title="Grades"
                        onClick={onViewGrades}
                    >
                        <BarChart3 className="h-5 w-5" />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
