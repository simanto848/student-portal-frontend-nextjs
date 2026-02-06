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
import { studentService } from "@/services/user/student.service";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { notifyError, notifySuccess, notifyWarning } from "@/components/toast";
import { motion } from "framer-motion";

interface Student {
    id: string;
    fullName: string;
    registrationNumber: string;
    enrollmentId?: string;
}

interface MarkEntry {
    studentId: string;
    enrollmentId?: string;
    theoryMarks?: {
        finalExam?: number;
        finalExamQuestions?: {
            q1?: number;
            q2?: number;
            q3?: number;
            q4?: number;
            q5?: number;
            q6?: number;
        };
        midterm?: number;
        attendance?: number;
        classTest?: number;
        assignment?: number;
        continuousAssessment?: number;
    };
    labMarks?: {
        labReports?: number;
        attendance?: number;
        quizViva?: number;
        finalLab?: number;
    };
    theoryWeightage?: number;
    labWeightage?: number;
    letterGrade?: string;
    gradePoint?: number;
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
            <div className="relative w-16 md:w-20">
                <Input
                    disabled={disabled}
                    type="number"
                    min="0"
                    max={maxValue}
                    value={value ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        const newVal = val === "" ? undefined : parseFloat(val);
                        if (newVal !== undefined && newVal > maxValue) return;
                        onChange(newVal);
                    }}
                    className={`h-10 rounded-lg text-center font-bold text-sm transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${error
                        ? "border-red-300 bg-red-50 text-red-900 focus:ring-red-200"
                        : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#2dd4bf]/50 focus:border-[#2dd4bf] focus:ring-2 focus:ring-[#2dd4bf]/10 focus:bg-white text-slate-700 placeholder:text-slate-200"
                        }`}
                    placeholder="-"
                />
            </div>
            {error && (
                <div className="absolute mt-10 z-50">
                    <span className="bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {error}
                    </span>
                </div>
            )}
        </div>
    );
}

interface CourseFinalMarksEntryProps {
    courseId: string;
    batchId: string;
    semester: number;
    isLocked?: boolean;
    onSave?: () => void;
}

export function CourseFinalMarksEntry({
    courseId,
    batchId,
    semester,
    isLocked = false,
    onSave,
}: CourseFinalMarksEntryProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [markConfig, setMarkConfig] = useState<MarkConfig | null>(null);
    const [markEntries, setMarkEntries] = useState<Map<string, MarkEntry>>(
        new Map()
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Map<string, string>>(new Map());

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const studentsData = await studentService.getAll({ batchId });
            const studentList: Student[] = (studentsData.students || []).map((s) => ({
                id: String(s.id),
                fullName: String(s.fullName),
                registrationNumber: String(s.registrationNumber),
                enrollmentId: undefined,
            }));
            setStudents(studentList);

            const config = await courseGradeService.getMarkConfig(courseId);
            setMarkConfig(config);

            const gradesResponse = await courseGradeService.list({
                courseId,
                batchId,
                semester,
            });

            const existingGradesList = Array.isArray(gradesResponse)
                ? gradesResponse
                : gradesResponse?.grades || [];

            const entries = new Map<string, MarkEntry>();
            for (const student of studentList) {
                const existingGrade = existingGradesList.find(
                    (g: CourseGrade) => String(g.studentId) === student.id
                );

                if (existingGrade) {
                    const gradeRecord = existingGrade as unknown as Record<string, unknown>;
                    entries.set(student.id, {
                        studentId: student.id,
                        enrollmentId: student.enrollmentId,
                        theoryMarks: gradeRecord.theoryMarks as any,
                        labMarks: gradeRecord.labMarks as any,
                        letterGrade: gradeRecord.letterGrade as string,
                        gradePoint: gradeRecord.gradePoint as number,
                    });
                } else {
                    entries.set(student.id, {
                        studentId: student.id,
                        enrollmentId: student.enrollmentId,
                        theoryMarks: {
                            finalExamQuestions: {}
                        }
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
            enrollmentId: "",
            theoryMarks: { finalExamQuestions: {} }
        };

        const keys = path.split(".");
        const current = JSON.parse(JSON.stringify(entry));

        let target: any = current;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        target[keys[keys.length - 1]] = value;

        const newEntries = new Map(markEntries);
        newEntries.set(studentId, current);
        setMarkEntries(newEntries);

        const errorKey = `${studentId}.${path}`;
        if (errors.has(errorKey)) {
            const newErrors = new Map(errors);
            newErrors.delete(errorKey);
            setErrors(newErrors);
        }
    };

    const calculateTheoryTotal = (studentId: string): { incourse: number, final: number, total: number } => {
        const entry = markEntries.get(studentId);
        if (!entry?.theoryMarks) return { incourse: 0, final: 0, total: 0 };

        const { midterm = 0, attendance = 0, classTest = 0, assignment = 0, continuousAssessment = 0, finalExamQuestions } = entry.theoryMarks;
        const incourse = (midterm || 0) + (attendance || 0) + (classTest || 0) + (assignment || 0);

        let final = 0;
        if (finalExamQuestions) {
            final = (finalExamQuestions.q1 || 0) +
                (finalExamQuestions.q2 || 0) +
                (finalExamQuestions.q3 || 0) +
                (finalExamQuestions.q4 || 0) +
                (finalExamQuestions.q5 || 0) +
                (finalExamQuestions.q6 || 0);
        } else {
            final = entry.theoryMarks.finalExam || 0;
        }

        return { incourse, final, total: incourse + final };
    };

    const calculateLabTotal = (studentId: string): number => {
        const entry = markEntries.get(studentId);
        if (!entry?.labMarks) return 0;
        const { labReports = 0, attendance = 0, quizViva = 0, finalLab = 0 } = entry.labMarks;
        return labReports + attendance + quizViva + finalLab;
    };

    const validateEntry = (studentId: string): boolean => {
        const entry = markEntries.get(studentId);
        const newErrors = new Map(errors);
        let isValid = true;

        if (markConfig?.courseType === "theory" && entry?.theoryMarks) {
            const theory = entry.theoryMarks;
            if (theory.finalExamQuestions) {
                const q = theory.finalExamQuestions;
                const countA = ['q1', 'q2', 'q3'].filter(k => (q as any)[k] !== undefined && (q as any)[k] !== null && String((q as any)[k]) !== '').length;
                if (countA > 2) {
                    ['q1', 'q2', 'q3'].forEach(k => newErrors.set(`${studentId}.theoryMarks.finalExamQuestions.${k}`, "Max 2 in Group A"));
                    isValid = false;
                }

                const countB = ['q4', 'q5'].filter(k => (q as any)[k] !== undefined && (q as any)[k] !== null && String((q as any)[k]) !== '').length;
                if (countB > 1) {
                    ['q4', 'q5'].forEach(k => newErrors.set(`${studentId}.theoryMarks.finalExamQuestions.${k}`, "Max 1 in Group B"));
                    isValid = false;
                }

                ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].forEach(k => {
                    if ((q as any)[k] > 12.5) {
                        newErrors.set(`${studentId}.theoryMarks.finalExamQuestions.${k}`, "Max 12.5");
                        isValid = false;
                    }
                });
            }

            if (theory.midterm !== undefined && theory.midterm > 20) {
                newErrors.set(`${studentId}.theoryMarks.midterm`, "Max 20");
                isValid = false;
            }
            if (theory.attendance !== undefined && theory.attendance > 10) {
                newErrors.set(`${studentId}.theoryMarks.attendance`, "Max 10");
                isValid = false;
            }
            if (theory.classTest !== undefined && theory.classTest > 10) {
                newErrors.set(`${studentId}.theoryMarks.classTest`, "Max 10");
                isValid = false;
            }
            if (theory.assignment !== undefined && theory.assignment > 10) {
                newErrors.set(`${studentId}.theoryMarks.assignment`, "Max 10");
                isValid = false;
            }
        }

        if (markConfig?.courseType === "lab" && entry?.labMarks) {
            const lab = entry.labMarks;
            if (lab.labReports !== undefined && lab.labReports > 10) {
                newErrors.set(`${studentId}.labMarks.labReports`, "Max 10");
                isValid = false;
            }
            if (lab.attendance !== undefined && lab.attendance > 10) {
                newErrors.set(`${studentId}.labMarks.attendance`, "Max 10");
                isValid = false;
            }
            if (lab.quizViva !== undefined && lab.quizViva > 10) {
                newErrors.set(`${studentId}.labMarks.quizViva`, "Max 10");
                isValid = false;
            }
            if (lab.finalLab !== undefined && lab.finalLab > 20) {
                newErrors.set(`${studentId}.labMarks.finalLab`, "Max 20");
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
                (e) => e.theoryMarks || e.labMarks
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
                notifyWarning(`${result.successCount} saved, ${result.failureCount} failed`);
            }

            if (onSave) onSave();
        } catch (error) {
            notifyError("Failed to save marks");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!markConfig) return null;

    const isTheory = markConfig.courseType === "theory" || markConfig.courseType === "combined";
    const isLab = markConfig.courseType === "lab" || markConfig.courseType === "combined";

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] border border-slate-200/60 p-6 shadow-sm overflow-hidden"
            >
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">
                            Mark Entry: {markConfig.courseType.toUpperCase()}
                        </h3>
                        <p className="text-slate-500 font-medium text-sm">
                            Enter marks for all students.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                <TableHead className="font-black text-slate-800 border-b border-slate-200 min-w-[200px]" rowSpan={2}>
                                    Student
                                </TableHead>
                                {isTheory && (
                                    <>
                                        <TableHead className="font-black text-center text-slate-800 border-b border-slate-200 border-l" colSpan={4}>
                                            In-Course
                                        </TableHead>
                                        <TableHead className="font-black text-center text-slate-900 bg-slate-100 border-b border-slate-200 border-l border-r" rowSpan={2}>
                                            Total
                                        </TableHead>
                                        <TableHead className="font-black text-center text-slate-800 border-b border-slate-200" colSpan={6}>
                                            Final
                                        </TableHead>
                                        <TableHead className="font-black text-center text-slate-900 bg-slate-100 border-b border-slate-200 border-l border-r" rowSpan={2}>
                                            Final Total
                                        </TableHead>
                                        <TableHead className="font-black text-center text-slate-900 bg-slate-200 border-b border-slate-300" rowSpan={2}>
                                            Grand Total
                                        </TableHead>
                                        <TableHead className="font-black text-center text-slate-900 bg-slate-300 border-b border-slate-300 border-l" rowSpan={2}>
                                            Grade
                                        </TableHead>
                                        <TableHead className="font-black text-center text-slate-900 bg-slate-300 border-b border-slate-300 border-l" rowSpan={2}>
                                            Point
                                        </TableHead>
                                    </>
                                )}
                                {isLab && <TableHead className="text-center border-b border-slate-200" colSpan={4}>Lab Assessment</TableHead>}
                            </TableRow>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                {isTheory && (
                                    <>
                                        {/* Incourse Columns */}
                                        <TableHead className="text-center text-xs font-bold text-slate-500 border-l">Mid Term(20)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Class Test(10)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Assignment(10)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Attendance(10)</TableHead>

                                        {/* Final Columns */}
                                        <TableHead className="text-center text-xs font-bold text-slate-500 border-l">Q1</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Q2</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Q3</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500 border-l border-slate-200">Q4</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Q5</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500 border-l border-slate-200">Q6</TableHead>
                                    </>
                                )}
                                {isLab && (
                                    <>
                                        <TableHead>Reports(10)</TableHead>
                                        <TableHead>Attendance(10)</TableHead>
                                        <TableHead>Quiz/Viva(10)</TableHead>
                                        <TableHead>Final(20)</TableHead>
                                        <TableHead>Total(50)</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Point</TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => {
                                const totals = calculateTheoryTotal(student.id);
                                return (
                                    <TableRow key={student.id} className="hover:bg-slate-50 group">
                                        <TableCell className="font-medium bg-white group-hover:bg-slate-50 sticky left-0 z-10 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{student.fullName}</div>
                                                <div className="text-xs text-slate-500">{student.registrationNumber}</div>
                                            </div>
                                        </TableCell>

                                        {isTheory && (
                                            <>
                                                {/* Incourse Inputs */}
                                                <TableCell className="p-2 border-l border-slate-100">
                                                    <MarkInputField
                                                        maxValue={20}
                                                        value={markEntries.get(student.id)?.theoryMarks?.midterm}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.midterm", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.midterm`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={markEntries.get(student.id)?.theoryMarks?.classTest}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.classTest", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.classTest`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={markEntries.get(student.id)?.theoryMarks?.assignment}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.assignment", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.assignment`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={markEntries.get(student.id)?.theoryMarks?.attendance}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.attendance", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.attendance`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-4 text-center font-black text-slate-700 bg-slate-50 border-l border-r border-slate-100">
                                                    {totals.incourse}
                                                </TableCell>

                                                {/* Final Inputs - Group A */}
                                                <TableCell className="p-2 border-l border-slate-100 bg-blue-50/10">
                                                    <MarkInputField
                                                        maxValue={12.5}
                                                        value={markEntries.get(student.id)?.theoryMarks?.finalExamQuestions?.q1}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.finalExamQuestions.q1", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q1`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 bg-blue-50/10">
                                                    <MarkInputField
                                                        maxValue={12.5}
                                                        value={markEntries.get(student.id)?.theoryMarks?.finalExamQuestions?.q2}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.finalExamQuestions.q2", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q2`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 bg-blue-50/10">
                                                    <MarkInputField
                                                        maxValue={12.5}
                                                        value={markEntries.get(student.id)?.theoryMarks?.finalExamQuestions?.q3}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.finalExamQuestions.q3", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q3`)}
                                                    />
                                                </TableCell>

                                                {/* Group B */}
                                                <TableCell className="p-2 border-l border-slate-100 bg-emerald-50/10">
                                                    <MarkInputField
                                                        maxValue={12.5}
                                                        value={markEntries.get(student.id)?.theoryMarks?.finalExamQuestions?.q4}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.finalExamQuestions.q4", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q4`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 bg-emerald-50/10">
                                                    <MarkInputField
                                                        maxValue={12.5}
                                                        value={markEntries.get(student.id)?.theoryMarks?.finalExamQuestions?.q5}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.finalExamQuestions.q5", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q5`)}
                                                    />
                                                </TableCell>

                                                {/* Group C */}
                                                <TableCell className="p-2 border-l border-slate-100 bg-purple-50/10">
                                                    <MarkInputField
                                                        maxValue={12.5}
                                                        value={markEntries.get(student.id)?.theoryMarks?.finalExamQuestions?.q6}
                                                        onChange={(val) => updateMarkEntry(student.id, "theoryMarks.finalExamQuestions.q6", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q6`)}
                                                    />
                                                </TableCell>

                                                <TableCell className="p-4 text-center font-black text-slate-700 bg-slate-50 border-l border-r border-slate-100">
                                                    {totals.final}
                                                </TableCell>
                                                <TableCell className="p-4 text-center font-black text-white bg-slate-900 border-r border-slate-800">
                                                    {totals.total}
                                                </TableCell>
                                                <TableCell className="p-4 text-center font-black text-slate-900 bg-amber-200">
                                                    {markEntries.get(student.id)?.letterGrade || "-"}
                                                </TableCell>
                                                <TableCell className="p-4 text-center font-black text-slate-900 bg-amber-200 rounded-r-lg">
                                                    {markEntries.get(student.id)?.gradePoint?.toFixed(2) || "-"}
                                                </TableCell>
                                            </>
                                        )}
                                        {isLab && (
                                            <>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={markEntries.get(student.id)?.labMarks?.labReports}
                                                        onChange={(val) => updateMarkEntry(student.id, "labMarks.labReports", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.labMarks.labReports`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={markEntries.get(student.id)?.labMarks?.attendance}
                                                        onChange={(val) => updateMarkEntry(student.id, "labMarks.attendance", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.labMarks.attendance`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={10}
                                                        value={markEntries.get(student.id)?.labMarks?.quizViva}
                                                        onChange={(val) => updateMarkEntry(student.id, "labMarks.quizViva", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.labMarks.quizViva`)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <MarkInputField
                                                        maxValue={20}
                                                        value={markEntries.get(student.id)?.labMarks?.finalLab}
                                                        onChange={(val) => updateMarkEntry(student.id, "labMarks.finalLab", val)}
                                                        disabled={isLocked}
                                                        error={errors.get(`${student.id}.labMarks.finalLab`)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-bold text-center">
                                                    {calculateLabTotal(student.id)}/50
                                                </TableCell>
                                                <TableCell className="font-bold text-center bg-amber-100/50">
                                                    {markEntries.get(student.id)?.letterGrade || "-"}
                                                </TableCell>
                                                <TableCell className="font-bold text-center bg-amber-100/50">
                                                    {markEntries.get(student.id)?.gradePoint?.toFixed(2) || "-"}
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex gap-4 mt-8 justify-end">
                    {!isLocked && (
                        <Button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            variant="outline"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest border-2 text-slate-500 hover:text-[#2dd4bf] hover:border-[#2dd4bf] hover:bg-[#2dd4bf]/5 transition-all"
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
                    )}
                </div>
            </motion.div >
        </div >
    );
}
