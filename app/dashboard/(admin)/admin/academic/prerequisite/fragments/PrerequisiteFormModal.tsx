"use client";

import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Course, CoursePrerequisite, Department, Session } from "@/services/academic.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { useSessionCourses } from "@/hooks/queries/useAcademicQueries";

interface PrerequisiteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => Promise<void>;
    selectedPrerequisite: CoursePrerequisite | null;
    courses: Course[];
    departments: Department[];
    sessions: Session[];
    isSubmitting: boolean;
}

export function PrerequisiteFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedPrerequisite,
    courses,
    departments,
    sessions,
    isSubmitting,
}: PrerequisiteFormModalProps) {
    const theme = useDashboardTheme();

    // Form State
    const [courseId, setCourseId] = useState("");
    const [prerequisiteId, setPrerequisiteId] = useState("");

    // Filter State
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
    const [selectedSessionId, setSelectedSessionId] = useState<string>("all");

    // Fetch session courses if a session is selected
    const { data: sessionCourses = [] } = useSessionCourses(
        selectedSessionId !== "all" ? { sessionId: selectedSessionId } : undefined,
        { enabled: selectedSessionId !== "all" }
    );

    // Initialize form when modal opens or selected item changes
    useEffect(() => {
        if (isOpen) {
            if (selectedPrerequisite) {
                setCourseId(
                    typeof selectedPrerequisite.courseId === 'object'
                        ? selectedPrerequisite.courseId.id
                        : selectedPrerequisite.courseId
                );
                setPrerequisiteId(
                    typeof selectedPrerequisite.prerequisiteId === 'object'
                        ? selectedPrerequisite.prerequisiteId.id
                        : selectedPrerequisite.prerequisiteId
                );
            } else {
                setCourseId("");
                setPrerequisiteId("");
            }
            // Reset filters on open
            setSelectedDepartmentId("all");
            setSelectedSessionId("all");
        }
    }, [isOpen, selectedPrerequisite]);

    // Derived filtered courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // Filter by Status
            if (!course.status) return false;

            // Filter by Department
            if (selectedDepartmentId !== "all") {
                const deptId = typeof course.departmentId === 'object' ? course.departmentId.id : course.departmentId;
                if (deptId !== selectedDepartmentId) return false;
            }

            // Filter by Session
            if (selectedSessionId !== "all") {
                // Check if any sessionCourse links to this course
                const isCourseInSession = sessionCourses.some(sc => {
                    const scCourseId = typeof sc.courseId === 'object' ? sc.courseId.id : sc.courseId;
                    return scCourseId === course.id;
                });
                if (!isCourseInSession) return false;
            }

            return true;
        });
    }, [courses, selectedDepartmentId, selectedSessionId, sessionCourses]);

    // Create options for dropdowns
    const courseOptions = useMemo(() => {
        return filteredCourses.map(c => ({
            label: `${c.name} (${c.code})`,
            value: c.id
        }));
    }, [filteredCourses]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            courseId,
            prerequisiteId
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white border-slate-200 p-0 overflow-hidden rounded-2xl shadow-2xl">
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${theme.colors.accent.secondary.replace('bg-', 'from-')} to-orange-400`} />

                <DialogHeader className="px-8 pt-8 pb-4">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {selectedPrerequisite ? "Edit Prerequisite" : "Add Prerequisite"}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-8 pb-4 border-b border-slate-100 mb-4 bg-slate-50/50">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                        Filters
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                                <SelectTrigger className="h-9 bg-white border-slate-200">
                                    <SelectValue placeholder="Filter by Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.shortName} - {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                                <SelectTrigger className="h-9 bg-white border-slate-200">
                                    <SelectValue placeholder="Filter by Session" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sessions</SelectItem>
                                    {sessions.map((session) => (
                                        <SelectItem key={session.id} value={session.id}>
                                            {session.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                Target Course <span className="text-red-500">*</span>
                            </Label>
                            <SearchableSelect
                                options={courseOptions}
                                value={courseId}
                                onChange={setCourseId}
                                placeholder="Select target course..."
                            />
                            <p className="text-xs text-slate-500">
                                The course that requires a prerequisite.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                Prerequisite Course <span className="text-red-500">*</span>
                            </Label>
                            <SearchableSelect
                                options={courseOptions}
                                value={prerequisiteId}
                                onChange={setPrerequisiteId}
                                placeholder="Select prerequisite course..."
                            />
                            <p className="text-xs text-slate-500">
                                The course that must be completed first.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !courseId || !prerequisiteId}
                            className={`${theme.colors.accent.secondary} text-white rounded-xl`}
                        >
                            {isSubmitting ? "Saving..." : "Save Prerequisite"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
