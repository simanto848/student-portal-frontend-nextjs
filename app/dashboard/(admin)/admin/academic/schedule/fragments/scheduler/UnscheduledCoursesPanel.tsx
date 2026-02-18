"use client";

import { AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UnscheduledCourse, batchDisplayName } from "./types";

interface Props {
    courses: UnscheduledCourse[];
    onDismiss: () => void;
}

export function UnscheduledCoursesPanel({ courses, onDismiss }: Props) {
    if (courses.length === 0) return null;

    return (
        <Card className="border-2 border-amber-300 bg-amber-50/60 rounded-2xl overflow-hidden p-0">
            <CardHeader className="pb-3 bg-amber-100/60 border-b border-amber-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                        <div>
                            <h3 className="font-bold text-amber-900">
                                {courses.length} Course{courses.length > 1 ? "s" : ""} Could Not Be Scheduled
                            </h3>
                            <p className="text-sm text-amber-700">
                                These courses were skipped due to time slot or room conflicts.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="text-amber-700 hover:text-amber-900 hover:bg-amber-200"
                    >
                        Dismiss
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="max-h-[320px] overflow-y-auto space-y-2">
                    {courses.map((course, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${course.courseType === "lab" ? "bg-blue-500" : "bg-slate-400"
                                        }`}
                                />
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {course.courseCode} — {course.courseName}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Batch:{" "}
                                        <span className="font-medium text-slate-700">
                                            {batchDisplayName(course.batchName, course.batchShift)}
                                        </span>
                                        {" · "}
                                        Teacher:{" "}
                                        <span className="font-medium text-slate-700">{course.teacherName}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge
                                    variant="outline"
                                    className={`text-xs capitalize ${course.courseType === "lab"
                                            ? "border-blue-300 text-blue-700 bg-blue-50"
                                            : "border-slate-300 text-slate-600"
                                        }`}
                                >
                                    {course.courseType}
                                </Badge>
                                <Badge variant="destructive" className="text-xs">
                                    No Slot
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>

                <Alert className="mt-4 bg-white border-amber-200">
                    <Info className="w-4 h-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 text-sm">Why did this happen?</AlertTitle>
                    <AlertDescription className="text-amber-700 text-xs">
                        Common causes: teacher already scheduled at all available times, no suitable room available, or
                        working days are too limited. Try adding more working days or adjusting time slots.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
