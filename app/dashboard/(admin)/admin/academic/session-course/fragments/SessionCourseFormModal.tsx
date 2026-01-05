"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    BookPlus,
    CalendarClock,
    GraduationCap,
    Loader2,
    LayoutGrid,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SessionCourse, Session, Course, Department } from "@/services/academic.service";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultiSearchableSelect } from "@/components/ui/multi-searchable-select";
import { useSessionCourses } from "@/hooks/queries/useAcademicQueries";

const formSchema = z.object({
    sessionId: z.string().min(1, "Session is required"),
    courseId: z.union([z.string().min(1, "Course is required"), z.array(z.string()).min(1, "At least one course is required")]),
    departmentId: z.string().min(1, "Department is required"),
    semester: z.coerce.number().min(1, "Semester must be at least 1").max(12, "Semester must be at most 12"),
});

type SessionCourseFormValues = z.infer<typeof formSchema>;

interface SessionCourseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SessionCourseFormValues) => Promise<void>;
    initialData?: SessionCourse | null;
    sessions: Session[];
    courses: Course[];
    departments: Department[];
    isSubmitting: boolean;
}

export function SessionCourseFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    sessions,
    courses,
    departments,
    isSubmitting,
}: SessionCourseFormModalProps) {
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionId: "",
            courseId: [],
            departmentId: "",
            semester: 1,
        },
    });

    const watchedSessionId = form.watch("sessionId");
    const watchedDepartmentId = form.watch("departmentId");
    const watchedSemester = form.watch("semester");

    // Fetch existing courses for the combination to pre-populate multi-select
    const { data: existingCoursesData } = useSessionCourses(
        watchedSessionId && watchedDepartmentId && watchedSemester && isOpen
            ? {
                sessionId: watchedSessionId,
                departmentId: watchedDepartmentId,
                semester: watchedSemester,
                limit: 1000
            }
            : undefined
    );

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    sessionId: typeof initialData.sessionId === 'object' ? initialData.sessionId.id : initialData.sessionId,
                    courseId: [],
                    departmentId: typeof initialData.departmentId === 'object' ? initialData.departmentId.id : initialData.departmentId,
                    semester: initialData.semester,
                });
            } else {
                form.reset({
                    sessionId: "",
                    courseId: [],
                    departmentId: "",
                    semester: 1,
                });
            }
        }
    }, [isOpen, initialData, form]);

    useEffect(() => {
        if (existingCoursesData && isOpen) {
            const existingCourseIds = existingCoursesData.map((sc: any) =>
                typeof sc.courseId === 'object' ? sc.courseId.id : sc.courseId
            );
            // De-duplicate existing course IDs
            form.setValue("courseId", Array.from(new Set(existingCourseIds)));
        }
    }, [existingCoursesData, isOpen, form]);

    const handleSubmit = async (values: SessionCourseFormValues) => {
        await onSubmit(values);
    };

    // Helper to de-duplicate options by value
    const uniqueOptions = (options: { label: string; value: string }[]) => {
        const seen = new Set();
        return options.filter(opt => {
            const duplicate = seen.has(opt.value);
            seen.add(opt.value);
            return !duplicate;
        });
    };

    const sessionOptions = uniqueOptions(sessions.filter(s => s.status).map(s => ({ label: `${s.name} (${s.year})`, value: s.id })));
    const courseOptions = uniqueOptions(courses.filter(c => c.status).map(c => ({ label: `${c.name} (${c.code})`, value: c.id })));
    const departmentOptions = uniqueOptions(departments.filter(d => d.status).map(d => ({ label: `${d.name} (${d.shortName})`, value: d.id })));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-transparent shadow-none">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 shadow-2xl overflow-hidden"
                        >
                            {/* Premium Header */}
                            <div className="relative h-32 bg-slate-900 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent" />
                                <div className="absolute -right-8 -top-8 opacity-10 rotate-12">
                                    <BookPlus className="w-48 h-48 text-white" />
                                </div>
                                <div className="relative h-full flex items-center px-8 gap-5">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
                                        <BookPlus className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-white mb-1">
                                            {initialData ? "Refine Allocation" : "Allocate Courses"}
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-400 font-medium">
                                            {initialData
                                                ? "Adjust course offerings for this academic slot"
                                                : "Strategically assign courses to sessions & departments"}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="p-8 space-y-8">
                                    {/* Academic Context Section */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100/50">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            Academic Context
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <FormField
                                                control={form.control}
                                                name="sessionId"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-slate-700 font-bold ml-1">Session</FormLabel>
                                                        <FormControl>
                                                            <SearchableSelect
                                                                options={sessionOptions}
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Select session"
                                                                disabled={!!initialData}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="departmentId"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-slate-700 font-bold ml-1">Department</FormLabel>
                                                        <FormControl>
                                                            <SearchableSelect
                                                                options={departmentOptions}
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Select department"
                                                                disabled={!!initialData}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="semester"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-slate-700 font-bold ml-1">Target Semester</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={12}
                                                                {...field}
                                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-amber-500 focus:border-amber-500 pl-4 transition-all"
                                                                disabled={!!initialData}
                                                            />
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                                                                / 12
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Course Selection Section */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100/50">
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                            Course Inventory
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="courseId"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-slate-700 font-bold ml-1">Offerings</FormLabel>
                                                    <FormControl>
                                                        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-1.5 min-h-[100px] transition-all focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-400">
                                                            <MultiSearchableSelect
                                                                options={courseOptions}
                                                                value={Array.isArray(field.value) ? field.value : []}
                                                                onChange={field.onChange}
                                                                placeholder="Click to select courses..."
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Styled Footer */}
                                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                            className="h-12 px-6 rounded-2xl hover:bg-slate-100 text-slate-600 font-bold transition-all ml-auto"
                                        >
                                            Discard
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-xl shadow-amber-500/20 font-bold transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-5 h-5" />
                                            )}
                                            {initialData ? "Update Slot" : "Finalize Allocation"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
