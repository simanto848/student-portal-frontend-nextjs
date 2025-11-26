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
import { Loader2 } from "lucide-react";
import { SessionCourse, Session, Course, Department, academicService } from "@/services/academic.service";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultiSearchableSelect } from "@/components/ui/multi-searchable-select";

const formSchema = z.object({
    sessionId: z.string().min(1, "Session is required"),
    courseId: z.union([z.string().min(1, "Course is required"), z.array(z.string()).min(1, "At least one course is required")]),
    departmentId: z.string().min(1, "Department is required"),
    semester: z.coerce.number().min(1, "Semester must be at least 1").max(12, "Semester must be at most 12"),
});

type SessionCourseFormValues = z.infer<typeof formSchema>;

interface SessionCourseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SessionCourseFormValues) => Promise<void>;
    initialData?: SessionCourse | null;
    sessions: Session[];
    courses: Course[];
    departments: Department[];
    isSubmitting: boolean;
}

export function SessionCourseForm({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    sessions,
    courses,
    departments,
    isSubmitting,
}: SessionCourseFormProps) {
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
        const fetchExistingCourses = async () => {
            if (watchedSessionId && watchedDepartmentId && watchedSemester && isOpen) {
                try {
                    const response = await academicService.getAllSessionCourses({
                        sessionId: watchedSessionId,
                        departmentId: watchedDepartmentId,
                        semester: watchedSemester,
                        limit: 1000
                    });

                    const existingCourseIds = response.map((sc: any) =>
                        typeof sc.courseId === 'object' ? sc.courseId.id : sc.courseId
                    );

                    form.setValue("courseId", existingCourseIds);
                } catch (error) {
                    console.error("Failed to fetch existing courses", error);
                }
            }
        };

        fetchExistingCourses();
    }, [watchedSessionId, watchedDepartmentId, watchedSemester, isOpen, form]);

    const handleSubmit = async (values: SessionCourseFormValues) => {
        await onSubmit(values);
    };

    const sessionOptions = sessions.filter(s => s.status).map(s => ({ label: `${s.name} (${s.year})`, value: s.id }));

    const courseOptions = courses.filter(c => c.status).map(c => ({ label: `${c.name} (${c.code})`, value: c.id }));

    const departmentOptions = departments.filter(d => d.status).map(d => ({ label: `${d.name} (${d.shortName})`, value: d.id }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Manage Session Courses" : "Create Session Course"}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Manage courses for this session, department, and semester."
                            : "Assign courses to a session."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="sessionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Session</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            options={sessionOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select a session"
                                            disabled={!!initialData}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="departmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            options={departmentOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select a department"
                                            disabled={!!initialData}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="semester"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={12}
                                            {...field}
                                            disabled={!!initialData}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="courseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Courses</FormLabel>
                                    <FormControl>
                                        <MultiSearchableSelect
                                            options={courseOptions}
                                            value={Array.isArray(field.value) ? field.value : []}
                                            onChange={field.onChange}
                                            placeholder="Select courses"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-[#588157] hover:bg-[#3a5a40]">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Save Changes" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
