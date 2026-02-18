"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, BookOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScheduleValidationResult, UnassignedCourse } from "./types";

interface Props {
    show: boolean;
    validationResult: ScheduleValidationResult | null;
}

export function ValidationPanel({ show, validationResult }: Props) {
    if (!show || !validationResult) return null;

    return (
        <Card
            className={`border-2 rounded-2xl overflow-hidden p-0 ${validationResult.valid
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    {validationResult.valid ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                        <h3 className={`font-bold ${validationResult.valid ? "text-emerald-800" : "text-red-800"}`}>
                            {validationResult.valid ? "Validation Passed!" : "Validation Failed"}
                        </h3>
                        <p className={`text-sm ${validationResult.valid ? "text-emerald-600" : "text-red-600"}`}>
                            {validationResult.valid
                                ? "All prerequisites met. You can generate the schedule."
                                : "Please fix the following issues before generating."}
                        </p>
                    </div>
                </div>
            </CardHeader>

            {!validationResult.valid &&
                validationResult.unassignedCourses &&
                validationResult.unassignedCourses.length > 0 && (
                    <CardContent>
                        <div className="space-y-3">
                            <h4 className="font-semibold text-red-800 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Courses Without Teachers Assigned ({validationResult.unassignedCourses.length})
                            </h4>
                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                {validationResult.unassignedCourses.map((course: UnassignedCourse, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {course.courseCode} - {course.courseName}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Batch: {course.batchName} • Semester {course.semester}
                                            </p>
                                        </div>
                                        <Badge variant="destructive" className="text-xs">
                                            No Teacher
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <Alert className="bg-amber-50 border-amber-200">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <AlertTitle className="text-amber-800">Action Required</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    Please assign teachers to all courses before generating the schedule. Go to{" "}
                                    <Link
                                        href="/dashboard/admin/enrollment/instructor-assignment"
                                        className="underline font-medium"
                                    >
                                        Instructor Assignment
                                    </Link>{" "}
                                    to assign teachers.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </CardContent>
                )}
        </Card>
    );
}
