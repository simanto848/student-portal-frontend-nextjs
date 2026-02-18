"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { notifyError, notifySuccess, notifyWarning } from "@/components/toast";
import { motion } from "framer-motion";
import { attendanceService } from "@/services/enrollment/attendance.service";

const calculateAttendanceMarks = (percentage: number): number => {
    if (percentage === 0) return 0;
    return Math.min(10, Math.ceil(percentage / 10));
};

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
    disabled,
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
                    onFocus={() => { if (value === 0) onChange(undefined); }}
                    onChange={(e) => {
                        const val = e.target.value;
                        let newVal = val === "" ? undefined : parseFloat(val);
                        if (newVal !== undefined) {
                            newVal = Math.ceil(newVal);
                        }
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
    const [markEntries, setMarkEntries] = useState<Map<string, MarkEntry>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Map<string, string>>(new Map());

    const [rowSaveState, setRowSaveState] = useState<Map<string, "saving" | "saved">>(new Map());

    const markEntriesRef = useRef(markEntries);
    useEffect(() => { markEntriesRef.current = markEntries; }, [markEntries]);

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

            const [gradesResponse, attendanceReport] = await Promise.all([
                courseGradeService.list({ courseId, batchId, semester }),
                attendanceService.getCourseReport(courseId, batchId)
            ]);

            const existingGradesList = Array.isArray(gradesResponse)
                ? gradesResponse
                : gradesResponse?.grades || [];

            const attendanceMap = new Map<string, number>();
            if (Array.isArray(attendanceReport)) {
                attendanceReport.forEach((record: any) => {
                    if (record.studentId && record.stats?.attendancePercentage) {
                        attendanceMap.set(record.studentId, parseFloat(record.stats.attendancePercentage));
                    }
                });
            }

            const entries = new Map<string, MarkEntry>();
            for (const student of studentList) {
                const existingGrade = existingGradesList.find(
                    (g: CourseGrade) => String(g.studentId) === student.id
                );

                const attendancePct = attendanceMap.get(student.id) || 0;
                const autoAttendanceMark = calculateAttendanceMarks(attendancePct);

                if (existingGrade) {
                    const gradeRecord = existingGrade as unknown as Record<string, any>;
                    const entry: MarkEntry = {
                        studentId: student.id,
                        enrollmentId: student.enrollmentId,
                        theoryMarks: gradeRecord.theoryMarks as MarkEntry["theoryMarks"],
                        labMarks: gradeRecord.labMarks as MarkEntry["labMarks"],
                        letterGrade: gradeRecord.letterGrade as string,
                        gradePoint: gradeRecord.gradePoint as number,
                    };

                    if (entry.theoryMarks && (entry.theoryMarks.attendance === undefined || entry.theoryMarks.attendance === null)) {
                        entry.theoryMarks.attendance = autoAttendanceMark;
                    }

                    if (entry.labMarks && (entry.labMarks.attendance === undefined || entry.labMarks.attendance === null)) {
                        entry.labMarks.attendance = autoAttendanceMark;
                    }

                    entries.set(student.id, entry);
                } else {
                    entries.set(student.id, {
                        studentId: student.id,
                        enrollmentId: student.enrollmentId,
                        theoryMarks: {
                            attendance: autoAttendanceMark,
                            finalExamQuestions: {}
                        },
                        labMarks: {
                            attendance: autoAttendanceMark
                        }
                    });
                }
            }
            setMarkEntries(entries);
        } catch (error) {
            console.error("Fetch Error:", error);
            notifyError("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    }, [batchId, courseId, semester]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const updateMarkEntry = (studentId: string, path: string, value: number | undefined) => {
        setMarkEntries((prev) => {
            const entry = prev.get(studentId) || {
                studentId,
                enrollmentId: "",
                theoryMarks: { finalExamQuestions: {} },
            };
            const keys = path.split(".");
            const current = JSON.parse(JSON.stringify(entry));
            let target: Record<string, unknown> = current;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) target[keys[i]] = {};
                target = target[keys[i]] as Record<string, unknown>;
            }
            target[keys[keys.length - 1]] = value;

            const newEntries = new Map(prev);
            newEntries.set(studentId, current);
            return newEntries;
        });

        setErrors((prev) => {
            const errorKey = `${studentId}.${path}`;
            if (!prev.has(errorKey)) return prev;
            const next = new Map(prev);
            next.delete(errorKey);
            return next;
        });
    };

    const handleGroupAChange = (studentId: string, qKey: "q1" | "q2" | "q3", value: number | undefined) => {
        const entry = markEntriesRef.current.get(studentId);
        const q = entry?.theoryMarks?.finalExamQuestions || {};

        const others = (["q1", "q2", "q3"] as const).filter((k) => k !== qKey);
        const filledOthers = others.filter(
            (k) => q[k] !== undefined && q[k] !== null && String(q[k]) !== ""
        ).length;

        if (value !== undefined && filledOthers >= 2) {
            setErrors((prev) => {
                const next = new Map(prev);
                next.set(
                    `${studentId}.theoryMarks.finalExamQuestions.${qKey}`,
                    "Max 2 from Group A (Q1–Q3)"
                );
                return next;
            });
            return;
        }

        updateMarkEntry(studentId, `theoryMarks.finalExamQuestions.${qKey}`, value);
    };

    const handleGroupBChange = (studentId: string, qKey: "q4" | "q5", value: number | undefined) => {
        const entry = markEntriesRef.current.get(studentId);
        const q = entry?.theoryMarks?.finalExamQuestions || {};

        const otherKey = qKey === "q4" ? "q5" : "q4";
        const otherFilled =
            q[otherKey] !== undefined && q[otherKey] !== null && String(q[otherKey]) !== "";

        if (value !== undefined && otherFilled) {
            setErrors((prev) => {
                const next = new Map(prev);
                next.set(
                    `${studentId}.theoryMarks.finalExamQuestions.${qKey}`,
                    "Max 1 from Group B (Q4–Q5)"
                );
                return next;
            });
            return;
        }

        updateMarkEntry(studentId, `theoryMarks.finalExamQuestions.${qKey}`, value);
    };

    const calculateTheoryTotal = (studentId: string): { incourse: number; final: number; total: number } => {
        const entry = markEntries.get(studentId);
        if (!entry?.theoryMarks) return { incourse: 0, final: 0, total: 0 };

        const { midterm = 0, attendance = 0, classTest = 0, assignment = 0, finalExamQuestions } = entry.theoryMarks;
        const incourse = (midterm || 0) + (attendance || 0) + (classTest || 0) + (assignment || 0);

        let final = 0;
        if (finalExamQuestions) {
            final =
                (finalExamQuestions.q1 || 0) +
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

    const validateEntry = (studentId: string, entriesSnapshot?: Map<string, MarkEntry>): boolean => {
        const map = entriesSnapshot || markEntries;
        const entry = map.get(studentId);
        const newErrors = new Map(errors);
        let isValid = true;

        if (markConfig?.courseType === "theory" && entry?.theoryMarks) {
            const theory = entry.theoryMarks;
            if (theory.finalExamQuestions) {
                const q = theory.finalExamQuestions;

                const countA = (["q1", "q2", "q3"] as const).filter(
                    (k) => q[k] !== undefined && q[k] !== null && String(q[k]) !== ""
                ).length;
                if (countA > 2) {
                    (["q1", "q2", "q3"] as const).forEach((k) =>
                        newErrors.set(`${studentId}.theoryMarks.finalExamQuestions.${k}`, "Max 2 in Group A")
                    );
                    isValid = false;
                }

                const countB = (["q4", "q5"] as const).filter(
                    (k) => q[k] !== undefined && q[k] !== null && String(q[k]) !== ""
                ).length;
                if (countB > 1) {
                    (["q4", "q5"] as const).forEach((k) =>
                        newErrors.set(`${studentId}.theoryMarks.finalExamQuestions.${k}`, "Max 1 in Group B")
                    );
                    isValid = false;
                }

                (["q1", "q2", "q3", "q4", "q5", "q6"] as const).forEach((k) => {
                    if ((q[k] ?? 0) > 12.5) {
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
                newErrors.set(`${studentId}.labMarks.labReports`, "Max 10"); isValid = false;
            }
            if (lab.attendance !== undefined && lab.attendance > 10) {
                newErrors.set(`${studentId}.labMarks.attendance`, "Max 10"); isValid = false;
            }
            if (lab.quizViva !== undefined && lab.quizViva > 10) {
                newErrors.set(`${studentId}.labMarks.quizViva`, "Max 10"); isValid = false;
            }
            if (lab.finalLab !== undefined && lab.finalLab > 20) {
                newErrors.set(`${studentId}.labMarks.finalLab`, "Max 20"); isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const saveDraftForStudent = useCallback(
        async (studentId: string, entriesSnapshot: Map<string, MarkEntry>) => {
            if (isLocked) return;

            const entry = entriesSnapshot.get(studentId);
            if (entry?.theoryMarks?.finalExamQuestions) {
                const q = entry.theoryMarks.finalExamQuestions;
                if (q.q6 === undefined || q.q6 === null || String(q.q6) === "") {
                    const updated: MarkEntry = JSON.parse(JSON.stringify(entry));
                    updated.theoryMarks!.finalExamQuestions!.q6 = 0;
                    entriesSnapshot = new Map(entriesSnapshot);
                    entriesSnapshot.set(studentId, updated);
                    setMarkEntries(entriesSnapshot);
                }
            }

            if (!validateEntry(studentId, entriesSnapshot)) return;

            const entryToSave = entriesSnapshot.get(studentId);
            if (!entryToSave?.theoryMarks && !entryToSave?.labMarks) return;

            setRowSaveState((prev) => new Map(prev).set(studentId, "saving"));
            try {
                await courseGradeService.bulkSaveMarks({
                    courseId,
                    batchId,
                    semester,
                    entries: [entryToSave],
                });
                setRowSaveState((prev) => new Map(prev).set(studentId, "saved"));
                setTimeout(() => {
                    setRowSaveState((prev) => {
                        const next = new Map(prev);
                        next.delete(studentId);
                        return next;
                    });
                }, 2000);
            } catch {
                setRowSaveState((prev) => {
                    const next = new Map(prev);
                    next.delete(studentId);
                    return next;
                });
            }
        },
        [isLocked, courseId, batchId, semester] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const handleRowBlur = (studentId: string, rowRef: React.RefObject<HTMLTableRowElement | null>) => (
        e: React.FocusEvent<HTMLTableRowElement>
    ) => {
        const relatedTarget = e.relatedTarget as Node | null;
        if (rowRef.current && relatedTarget && rowRef.current.contains(relatedTarget)) {
            return;
        }
        saveDraftForStudent(studentId, markEntriesRef.current);
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            let allValid = true;
            for (const student of students) {
                if (!validateEntry(student.id)) allValid = false;
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

    // ── Render ────────────────────────────────────────────────────────────────

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
                            Enter marks for all students. Marks auto-save when you move to the next row.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                <TableHead
                                    className="font-black text-slate-800 border-b border-slate-200 min-w-[200px]"
                                    rowSpan={2}
                                >
                                    Student
                                </TableHead>
                                {isTheory && (
                                    <>
                                        <TableHead
                                            className="font-black text-center text-slate-800 border-b border-slate-200 border-l"
                                            colSpan={4}
                                        >
                                            In-Course
                                        </TableHead>
                                        <TableHead
                                            className="font-black text-center text-slate-900 bg-slate-100 border-b border-slate-200 border-l border-r"
                                            rowSpan={2}
                                        >
                                            Total
                                        </TableHead>
                                        {/* Group A */}
                                        <TableHead
                                            className="font-black text-center text-blue-700 bg-blue-50/60 border-b border-slate-200 border-l"
                                            colSpan={3}
                                        >
                                            Final — Group A
                                            <span className="ml-1 text-[10px] font-bold text-blue-500">(pick any 2)</span>
                                        </TableHead>
                                        {/* Group B */}
                                        <TableHead
                                            className="font-black text-center text-emerald-700 bg-emerald-50/60 border-b border-slate-200 border-l"
                                            colSpan={2}
                                        >
                                            Group B
                                            <span className="ml-1 text-[10px] font-bold text-emerald-500">(pick any 1)</span>
                                        </TableHead>
                                        {/* Group C */}
                                        <TableHead
                                            className="font-black text-center text-purple-700 bg-purple-50/60 border-b border-slate-200 border-l"
                                            colSpan={1}
                                        >
                                            Q6
                                            <span className="ml-1 text-[10px] font-bold text-purple-500">(compulsory)</span>
                                        </TableHead>
                                        <TableHead
                                            className="font-black text-center text-slate-900 bg-slate-100 border-b border-slate-200 border-l border-r"
                                            rowSpan={2}
                                        >
                                            Final Total
                                        </TableHead>
                                        <TableHead
                                            className="font-black text-center text-slate-900 bg-slate-200 border-b border-slate-300"
                                            rowSpan={2}
                                        >
                                            Grand Total
                                        </TableHead>
                                        <TableHead
                                            className="font-black text-center text-slate-900 bg-slate-300 border-b border-slate-300 border-l"
                                            rowSpan={2}
                                        >
                                            Grade
                                        </TableHead>
                                        <TableHead
                                            className="font-black text-center text-slate-900 bg-slate-300 border-b border-slate-300 border-l"
                                            rowSpan={2}
                                        >
                                            Point
                                        </TableHead>
                                        <TableHead
                                            className="font-black text-center text-slate-500 border-b border-slate-200 border-l w-16"
                                            rowSpan={2}
                                        >
                                            {/* auto-save status column */}
                                        </TableHead>
                                    </>
                                )}
                                {isLab && (
                                    <TableHead
                                        className="text-center border-b border-slate-200"
                                        colSpan={4}
                                    >
                                        Lab Assessment
                                    </TableHead>
                                )}
                            </TableRow>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                {isTheory && (
                                    <>
                                        {/* In-course sub-headers */}
                                        <TableHead className="text-center text-xs font-bold text-slate-500 border-l">Mid Term(20)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Class Test(10)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Assignment(10)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-slate-500">Attendance(10)</TableHead>
                                        {/* Group A */}
                                        <TableHead className="text-center text-xs font-bold text-blue-600 bg-blue-50/40 border-l">Q1 (12.5)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-blue-600 bg-blue-50/40">Q2 (12.5)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-blue-600 bg-blue-50/40">Q3 (12.5)</TableHead>
                                        {/* Group B */}
                                        <TableHead className="text-center text-xs font-bold text-emerald-600 bg-emerald-50/40 border-l">Q4 (12.5)</TableHead>
                                        <TableHead className="text-center text-xs font-bold text-emerald-600 bg-emerald-50/40">Q5 (12.5)</TableHead>
                                        {/* Group C */}
                                        <TableHead className="text-center text-xs font-bold text-purple-600 bg-purple-50/40 border-l">Q6 (12.5)</TableHead>
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
                            {students.map((student) => (
                                <StudentMarkRow
                                    key={student.id}
                                    student={student}
                                    isTheory={isTheory}
                                    isLab={isLab}
                                    isLocked={isLocked}
                                    markEntry={markEntries.get(student.id)}
                                    errors={errors}
                                    totals={calculateTheoryTotal(student.id)}
                                    labTotal={calculateLabTotal(student.id)}
                                    saveState={rowSaveState.get(student.id)}
                                    onMarkChange={updateMarkEntry}
                                    onGroupAChange={handleGroupAChange}
                                    onGroupBChange={handleGroupBChange}
                                    onRowBlur={handleRowBlur}
                                />
                            ))}
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
                                    Save All Drafts
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ── StudentMarkRow (extracted to avoid re-creating row refs) ──────────────────

interface StudentMarkRowProps {
    student: Student;
    isTheory: boolean;
    isLab: boolean;
    isLocked: boolean;
    markEntry?: MarkEntry;
    errors: Map<string, string>;
    totals: { incourse: number; final: number; total: number };
    labTotal: number;
    saveState?: "saving" | "saved";
    onMarkChange: (studentId: string, path: string, value: number | undefined) => void;
    onGroupAChange: (studentId: string, qKey: "q1" | "q2" | "q3", value: number | undefined) => void;
    onGroupBChange: (studentId: string, qKey: "q4" | "q5", value: number | undefined) => void;
    onRowBlur: (
        studentId: string,
        rowRef: React.RefObject<HTMLTableRowElement | null>
    ) => (e: React.FocusEvent<HTMLTableRowElement>) => void;
}

function StudentMarkRow({
    student,
    isTheory,
    isLab,
    isLocked,
    markEntry,
    errors,
    totals,
    labTotal,
    saveState,
    onMarkChange,
    onGroupAChange,
    onGroupBChange,
    onRowBlur,
}: StudentMarkRowProps) {
    const rowRef = useRef<HTMLTableRowElement>(null);
    const q = markEntry?.theoryMarks?.finalExamQuestions || {};

    return (
        <TableRow
            ref={rowRef}
            className="hover:bg-slate-50 group"
            onBlur={onRowBlur(student.id, rowRef)}
        >
            {/* Student name */}
            <TableCell className="font-medium bg-white group-hover:bg-slate-50 sticky left-0 z-10 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div>
                    <div className="text-sm font-bold text-slate-900">{student.fullName}</div>
                    <div className="text-xs text-slate-500">{student.registrationNumber}</div>
                </div>
            </TableCell>

            {isTheory && (
                <>
                    {/* In-course */}
                    <TableCell className="p-2 border-l border-slate-100">
                        <MarkInputField
                            maxValue={20}
                            value={markEntry?.theoryMarks?.midterm}
                            onChange={(val) => onMarkChange(student.id, "theoryMarks.midterm", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.midterm`)}
                        />
                    </TableCell>
                    <TableCell className="p-2">
                        <MarkInputField
                            maxValue={10}
                            value={markEntry?.theoryMarks?.classTest}
                            onChange={(val) => onMarkChange(student.id, "theoryMarks.classTest", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.classTest`)}
                        />
                    </TableCell>
                    <TableCell className="p-2">
                        <MarkInputField
                            maxValue={10}
                            value={markEntry?.theoryMarks?.assignment}
                            onChange={(val) => onMarkChange(student.id, "theoryMarks.assignment", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.assignment`)}
                        />
                    </TableCell>
                    <TableCell className="p-2">
                        <MarkInputField
                            maxValue={10}
                            value={markEntry?.theoryMarks?.attendance}
                            onChange={(val) => onMarkChange(student.id, "theoryMarks.attendance", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.attendance`)}
                        />
                    </TableCell>

                    {/* In-course total */}
                    <TableCell className="p-4 text-center font-black text-slate-700 bg-slate-50 border-l border-r border-slate-100">
                        {totals.incourse}
                    </TableCell>

                    {/* Group A — Q1, Q2, Q3 */}
                    <TableCell className="p-2 border-l border-slate-100 bg-blue-50/20">
                        <MarkInputField
                            maxValue={12.5}
                            value={q.q1}
                            onChange={(val) => onGroupAChange(student.id, "q1", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q1`)}
                        />
                    </TableCell>
                    <TableCell className="p-2 bg-blue-50/20">
                        <MarkInputField
                            maxValue={12.5}
                            value={q.q2}
                            onChange={(val) => onGroupAChange(student.id, "q2", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q2`)}
                        />
                    </TableCell>
                    <TableCell className="p-2 bg-blue-50/20">
                        <MarkInputField
                            maxValue={12.5}
                            value={q.q3}
                            onChange={(val) => onGroupAChange(student.id, "q3", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q3`)}
                        />
                    </TableCell>

                    {/* Group B — Q4, Q5 */}
                    <TableCell className="p-2 border-l border-slate-100 bg-emerald-50/20">
                        <MarkInputField
                            maxValue={12.5}
                            value={q.q4}
                            onChange={(val) => onGroupBChange(student.id, "q4", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q4`)}
                        />
                    </TableCell>
                    <TableCell className="p-2 bg-emerald-50/20">
                        <MarkInputField
                            maxValue={12.5}
                            value={q.q5}
                            onChange={(val) => onGroupBChange(student.id, "q5", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q5`)}
                        />
                    </TableCell>

                    {/* Group C — Q6 (compulsory, auto-zeros on blur) */}
                    <TableCell className="p-2 border-l border-slate-100 bg-purple-50/20">
                        <MarkInputField
                            maxValue={12.5}
                            value={q.q6}
                            onChange={(val) => onMarkChange(student.id, "theoryMarks.finalExamQuestions.q6", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.theoryMarks.finalExamQuestions.q6`)}
                        />
                    </TableCell>

                    {/* Totals */}
                    <TableCell className="p-4 text-center font-black text-slate-700 bg-slate-50 border-l border-r border-slate-100">
                        {totals.final}
                    </TableCell>
                    <TableCell className="p-4 text-center font-black text-white bg-slate-900 border-r border-slate-800">
                        {totals.total}
                    </TableCell>
                    <TableCell className="p-4 text-center font-black text-slate-900 bg-amber-200">
                        {markEntry?.letterGrade || "-"}
                    </TableCell>
                    <TableCell className="p-4 text-center font-black text-slate-900 bg-amber-200 rounded-r-lg">
                        {markEntry?.gradePoint?.toFixed(2) || "-"}
                    </TableCell>

                    {/* Auto-save status indicator */}
                    <TableCell className="p-2 text-center w-16">
                        {saveState === "saving" && (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400 mx-auto" />
                        )}
                        {saveState === "saved" && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                        )}
                    </TableCell>
                </>
            )}

            {isLab && (
                <>
                    <TableCell>
                        <MarkInputField
                            maxValue={10}
                            value={markEntry?.labMarks?.labReports}
                            onChange={(val) => onMarkChange(student.id, "labMarks.labReports", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.labMarks.labReports`)}
                        />
                    </TableCell>
                    <TableCell>
                        <MarkInputField
                            maxValue={10}
                            value={markEntry?.labMarks?.attendance}
                            onChange={(val) => onMarkChange(student.id, "labMarks.attendance", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.labMarks.attendance`)}
                        />
                    </TableCell>
                    <TableCell>
                        <MarkInputField
                            maxValue={10}
                            value={markEntry?.labMarks?.quizViva}
                            onChange={(val) => onMarkChange(student.id, "labMarks.quizViva", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.labMarks.quizViva`)}
                        />
                    </TableCell>
                    <TableCell>
                        <MarkInputField
                            maxValue={20}
                            value={markEntry?.labMarks?.finalLab}
                            onChange={(val) => onMarkChange(student.id, "labMarks.finalLab", val)}
                            disabled={isLocked}
                            error={errors.get(`${student.id}.labMarks.finalLab`)}
                        />
                    </TableCell>
                    <TableCell className="font-bold text-center">{labTotal}/50</TableCell>
                    <TableCell className="font-bold text-center bg-amber-100/50">
                        {markEntry?.letterGrade || "-"}
                    </TableCell>
                    <TableCell className="font-bold text-center bg-amber-100/50">
                        {markEntry?.gradePoint?.toFixed(2) || "-"}
                    </TableCell>
                </>
            )}
        </TableRow>
    );
}
