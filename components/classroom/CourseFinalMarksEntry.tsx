"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    courseGradeService,
    type CourseGrade,
} from "@/services/enrollment/courseGrade.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Loader2, Send, Save, AlertCircle } from "lucide-react";
import { notifyError, notifySuccess, notifyWarning } from "@/components/toast";
import { motion } from "framer-motion";

interface Student {
    id: string;
    fullName: string;
    registrationNumber: string;
    enrollmentId: string;
}

interface MarkEntry {
    studentId: string;
    enrollmentId: string;
    theoryMarks?: {
        finalExam?: number;
        midterm?: number;
        attendance?: number;
        continuousAssessment?: number;
    };
    labMarks?: {
        labReports?: number;
        viva?: number;
        experiment?: number;
        attendance?: number;
        finalLab?: number;
    };
    theoryWeightage?: number;
    labWeightage?: number;
}

interface MarkConfig {
    courseId: string;
    courseType: "theory" | "lab" | "combined";
    totalMarks: number;
    components: Record<string, unknown>;
}

function MarkInputField({
    maxValue,
    value,
    onChange,
    error,
    disabled
}: {
    maxValue: number;
    value?: number;
    onChange: (value: number | undefined) => void;
    error?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col items-center group">
            <div className="relative w-20">
                <Input
                    disabled={disabled}
                    type="number"
                    min="0"
                    max={maxValue}
                    value={value ?? ""}
                    onChange={(e) => {
                        const newVal = e.target.value ? parseInt(e.target.value) : undefined;
                        if (newVal !== undefined && newVal > maxValue) return;
                        onChange(newVal);
                    }}
                    className={`h-11 rounded-xl text-center font-bold text-lg transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${error
                        ? "border-red-300 bg-red-50 text-red-900 focus:ring-red-200"
                        : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#2dd4bf]/50 focus:border-[#2dd4bf] focus:ring-4 focus:ring-[#2dd4bf]/10 focus:bg-white text-slate-700 placeholder:text-slate-200"
                        }`}
                    placeholder="-"
                />
            </div>
            {error && (
                <span className="text-red-500 text-[10px] font-bold mt-1.5 animate-in fade-in slide-in-from-top-1">
                    {error}
                </span>
            )}
        </div>
    );
}

interface CourseFinalMarksEntryProps {
    courseId: string;
    batchId: string;
    semester: number;
    isLocked?: boolean;
}

export function CourseFinalMarksEntry({
    courseId,
    batchId,
    semester,
    isLocked = false,
}: CourseFinalMarksEntryProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [markConfig, setMarkConfig] = useState<MarkConfig | null>(null);
    const [markEntries, setMarkEntries] = useState<Map<string, MarkEntry>>(
        new Map()
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Map<string, string>>(new Map());

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const enrollmentsData = await enrollmentService.listEnrollments({
                batchId,
                courseId,
                status: "active",
            });

            const studentList: Student[] = enrollmentsData.enrollments.map((e) => ({
                id: String((e.student as unknown as Record<string, unknown>)?.id || (e.student as unknown as Record<string, unknown>)?._id),
                fullName: String((e.student as unknown as Record<string, unknown>)?.fullName),
                registrationNumber: String((e.student as unknown as Record<string, unknown>)?.registrationNumber),
                enrollmentId: e.id,
            }));
            setStudents(studentList);

            const config = await courseGradeService.getMarkConfig(courseId);
            setMarkConfig(config);

            // Fetch existing marks for the course/batch/semester
            const gradesResponse = await courseGradeService.list({
                courseId,
                batchId,
                semester,
            });

            // Handle both array and object response formats
            const existingGradesList = Array.isArray(gradesResponse)
                ? gradesResponse
                : gradesResponse?.grades || [];

            const entries = new Map<string, MarkEntry>();
            for (const student of studentList) {
                // Find existing grade for this student
                const existingGrade = existingGradesList.find(
                    (g: CourseGrade) => String(g.studentId) === student.id
                );

                if (existingGrade) {
                    entries.set(student.id, {
                        studentId: student.id,
                        enrollmentId: student.enrollmentId,
                        theoryMarks: (existingGrade as unknown as Record<string, unknown>).theoryMarks as Record<string, number> | undefined,
                        labMarks: (existingGrade as unknown as Record<string, unknown>).labMarks as Record<string, number> | undefined,
                    });
                } else {
                    entries.set(student.id, {
                        studentId: student.id,
                        enrollmentId: student.enrollmentId,
                    });
                }
            }
            setMarkEntries(entries);
        } catch {
            notifyError("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    }, [batchId, courseId, semester]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateMarkEntry = (
        studentId: string,
        path: string,
        value: number | undefined
    ) => {
        const entry = markEntries.get(studentId) || {
            studentId,
            enrollmentId:
                students.find((s) => s.id === studentId)?.enrollmentId || "",
        };

        const keys = path.split(".");
        const current = JSON.parse(JSON.stringify(entry)); // Deep copy
        let target: Record<string, unknown> = current;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]] as Record<string, unknown>;
        }

        (target as Record<string, unknown>)[keys[keys.length - 1]] = value;
        setMarkEntries(new Map(markEntries.set(studentId, current as MarkEntry)));

        const errorKey = `${studentId}.${path}`;
        if (errors.has(errorKey)) {
            const newErrors = new Map(errors);
            newErrors.delete(errorKey);
            setErrors(newErrors);
        }
    };

    const calculateTheoryTotal = (studentId: string): number => {
        const entry = markEntries.get(studentId);
        if (!entry?.theoryMarks) return 0;
        const { finalExam = 0, midterm = 0, attendance = 0, continuousAssessment = 0 } =
            entry.theoryMarks;
        return finalExam + midterm + attendance + continuousAssessment;
    };

    const calculateLabTotal = (studentId: string): number => {
        const entry = markEntries.get(studentId);
        if (!entry?.labMarks) return 0;
        const { labReports = 0, viva = 0, experiment = 0, attendance = 0, finalLab = 0 } =
            entry.labMarks;
        return labReports + viva + experiment + attendance + finalLab;
    };

    const validateEntry = (studentId: string): boolean => {
        const entry = markEntries.get(studentId);
        const newErrors = new Map(errors);
        let isValid = true;

        if (markConfig?.courseType === "theory" && entry?.theoryMarks) {
            const theory = entry.theoryMarks;
            if (theory.finalExam !== undefined && theory.finalExam > 50) {
                newErrors.set(`${studentId}.theory.finalExam`, "Cannot exceed 50");
                isValid = false;
            }
            if (theory.midterm !== undefined && theory.midterm > 20) {
                newErrors.set(`${studentId}.theory.midterm`, "Cannot exceed 20");
                isValid = false;
            }
            if (theory.attendance !== undefined && theory.attendance > 10) {
                newErrors.set(`${studentId}.theory.attendance`, "Cannot exceed 10");
                isValid = false;
            }
            if (theory.continuousAssessment !== undefined && theory.continuousAssessment > 20) {
                newErrors.set(`${studentId}.theory.continuous`, "Cannot exceed 20");
                isValid = false;
            }
        }

        if (markConfig?.courseType === "lab" && entry?.labMarks) {
            const lab = entry.labMarks;
            if (lab.labReports !== undefined && lab.labReports > 20) {
                newErrors.set(`${studentId}.lab.reports`, "Cannot exceed 20");
                isValid = false;
            }
            if (lab.viva !== undefined && lab.viva > 20) {
                newErrors.set(`${studentId}.lab.viva`, "Cannot exceed 20");
                isValid = false;
            }
            if (lab.experiment !== undefined && lab.experiment > 10) {
                newErrors.set(`${studentId}.lab.experiment`, "Cannot exceed 10");
                isValid = false;
            }
            if (lab.finalLab !== undefined && lab.finalLab > 30) {
                newErrors.set(`${studentId}.lab.final`, "Cannot exceed 30");
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            let allValid = true;
            for (const student of students) {
                if (!validateEntry(student.id)) {
                    allValid = false;
                }
            }

            if (!allValid) {
                notifyError("Please fix validation errors before saving");
                setIsSaving(false);
                return;
            }

            const entries = Array.from(markEntries.values()).filter(
                (e) =>
                    e.theoryMarks ||
                    e.labMarks
            );

            if (entries.length === 0) {
                notifyError("No marks entered");
                setIsSaving(false);
                return;
            }

            const result = await courseGradeService.bulkSaveMarks({
                courseId,
                batchId,
                semester,
                entries,
            });

            if (result.failureCount === 0) {
                notifySuccess(`All marks saved successfully (${result.successCount} students)`);
            } else {
                notifyWarning(
                    `${result.successCount} saved, ${result.failureCount} failed`
                );
            }
        } catch (error) {
            notifyError("Failed to save marks");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitToCommittee = async () => {
        if (!confirm("Are you sure you want to submit these marks to the Exam Committee? You won't be able to edit after submission.")) {
            return;
        }

        setIsSubmitting(true);
        try {
            let allValid = true;
            for (const student of students) {
                if (!validateEntry(student.id)) {
                    allValid = false;
                }
            }

            if (!allValid) {
                notifyError("Please fix validation errors before submitting");
                setIsSubmitting(false);
                return;
            }

            const entries = Array.from(markEntries.values()).filter(
                (e) =>
                    e.theoryMarks ||
                    e.labMarks
            );

            if (entries.length === 0) {
                notifyError("No marks entered");
                setIsSubmitting(false);
                return;
            }

            await courseGradeService.bulkSaveMarks({
                courseId,
                batchId,
                semester,
                entries,
            });

            await courseGradeService.submitToCommittee({
                courseId,
                batchId,
                semester,
            });

            notifySuccess("Marks submitted to Exam Committee successfully");
            fetchData();
        } catch (error) {
            notifyError("Failed to submit marks");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!markConfig) {
        return (
            <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <span>Unable to load mark configuration for this course</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm"
            >
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                        Mark Entry: {markConfig.courseType.toUpperCase()} Course
                    </h3>
                    <p className="text-slate-500 font-medium">
                        Enter marks for all students. Total marks: {markConfig.totalMarks}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="font-black text-slate-900 sticky left-0 bg-slate-50 z-10">
                                    Student Name
                                </TableHead>
                                <TableHead className="font-black text-slate-900">
                                    Reg. No.
                                </TableHead>

                                {(markConfig.courseType === "theory" ||
                                    markConfig.courseType === "combined") && (
                                        <>
                                            <TableHead className="font-black text-slate-900">
                                                Final Exam (50)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Midterm (20)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Attendance (10)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Assessment (20)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Theory Total
                                            </TableHead>
                                        </>
                                    )}

                                {(markConfig.courseType === "lab" ||
                                    markConfig.courseType === "combined") && (
                                        <>
                                            <TableHead className="font-black text-slate-900">
                                                Lab Reports (20)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Viva (20)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Experiment (10)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Lab Attendance (10)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Final Lab (30)
                                            </TableHead>
                                            <TableHead className="font-black text-slate-900">
                                                Lab Total
                                            </TableHead>
                                        </>
                                    )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id} className="hover:bg-slate-50">
                                    <TableCell className="font-medium sticky left-0 bg-white z-10">
                                        {student.fullName}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {student.registrationNumber}
                                    </TableCell>

                                    {(markConfig.courseType === "theory" ||
                                        markConfig.courseType === "combined") && (
                                            <>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={50}
                                                        value={
                                                            markEntries.get(student.id)?.theoryMarks
                                                                ?.finalExam
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "theoryMarks.finalExam",
                                                                val
                                                            )
                                                        }
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theory.finalExam`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={20}
                                                        value={
                                                            markEntries.get(student.id)?.theoryMarks?.midterm
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "theoryMarks.midterm",
                                                                val
                                                            )
                                                        }
                                                        error={errors.get(`${student.id}.theory.midterm`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={
                                                            markEntries.get(student.id)?.theoryMarks
                                                                ?.attendance
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "theoryMarks.attendance",
                                                                val
                                                            )
                                                        }
                                                        error={errors.get(`${student.id}.theory.attendance`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={20}
                                                        value={
                                                            markEntries.get(student.id)?.theoryMarks
                                                                ?.continuousAssessment
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "theoryMarks.continuousAssessment",
                                                                val
                                                            )
                                                        }
                                                        error={errors.get(`${student.id}.theory.continuous`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-black bg-[#2dd4bf]/10 text-[#2dd4bf]">
                                                    {calculateTheoryTotal(student.id)}/100
                                                </TableCell>
                                            </>
                                        )}

                                    {(markConfig.courseType === "lab" ||
                                        markConfig.courseType === "combined") && (
                                            <>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={20}
                                                        value={
                                                            markEntries.get(student.id)?.labMarks?.labReports
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "labMarks.labReports",
                                                                val
                                                            )
                                                        }
                                                        error={errors.get(`${student.id}.lab.reports`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={20}
                                                        value={markEntries.get(student.id)?.labMarks?.viva}
                                                        onChange={(val) =>
                                                            updateMarkEntry(student.id, "labMarks.viva", val)
                                                        }
                                                        error={errors.get(`${student.id}.lab.viva`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={
                                                            markEntries.get(student.id)?.labMarks?.experiment
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "labMarks.experiment",
                                                                val
                                                            )
                                                        }
                                                        error={errors.get(`${student.id}.lab.experiment`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={
                                                            markEntries.get(student.id)?.labMarks?.attendance
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "labMarks.attendance",
                                                                val
                                                            )
                                                        }
                                                        error={errors.get(`${student.id}.lab.attendance`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={30}
                                                        value={
                                                            markEntries.get(student.id)?.labMarks?.finalLab
                                                        }
                                                        onChange={(val) =>
                                                            updateMarkEntry(
                                                                student.id,
                                                                "labMarks.finalLab",
                                                                val
                                                            )
                                                        }
                                                        error={errors.get(`${student.id}.lab.final`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-black bg-[#2dd4bf]/10 text-[#2dd4bf]">
                                                    {calculateLabTotal(student.id)}/50
                                                </TableCell>
                                            </>
                                        )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex gap-4 mt-8 justify-end">
                    {!isLocked && (
                        <>
                            <Button
                                onClick={handleSaveDraft}
                                disabled={isSaving || isSubmitting}
                                variant="outline"
                                className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 text-slate-500 hover:text-[#2dd4bf] hover:border-[#2dd4bf] hover:bg-[#2dd4bf]/5 transition-all"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Draft
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleSubmitToCommittee}
                                disabled={isSaving || isSubmitting}
                                className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-[#2dd4bf] hover:bg-[#25b0a0] shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 text-white transition-all active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Hand Over Result
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
