"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CourseGrade,
} from "@/services/enrollment/courseGrade.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Loader2, Calculator, Send, Lock, AlertCircle } from "lucide-react";
import { notifyError, notifySuccess } from "@/components/toast";
import { CourseFinalMarksEntry } from "@/components/classroom/CourseFinalMarksEntry";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import OTPConfirmationDialog from "@/components/ui/OTPConfirmationDialog"; // New import
import { api } from "@/lib/api"; // Added import

interface CourseGradeViewProps {
  courseId: string;
  batchId: string;
  semester: number;
}

export function CourseGradeView({
  courseId,
  batchId,
  semester,
}: CourseGradeViewProps) {
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<string>("draft");
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false); // New state

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch enrolled students
      const enrollmentsData = await enrollmentService.listEnrollments({
        batchId,
        courseId,
        status: "active",
      });
      setStudents(enrollmentsData.enrollments.map((e) => e.student));

      // Fetch existing grades
      const gradesResponse = await courseGradeService.list({
        batchId,
        courseId,
      });

      // Handle both array and object response formats
      const gradesList = Array.isArray(gradesResponse)
        ? gradesResponse
        : gradesResponse?.grades || [];
      setGrades(gradesList);

      // Fetch workflow status
      const workflows = await courseGradeService.getWorkflow({
        batchId,
        courseId,
        semester
      });

      if (workflows && workflows.length > 0) {
        setWorkflowStatus(workflows[0].status.toLowerCase());
      } else if (gradesList && gradesList.length > 0) {
        // Fallback if no workflow entry exists yet
        const firstGrade = gradesList[0];
        setWorkflowStatus((firstGrade.status || "draft").toLowerCase());
      } else {
        setWorkflowStatus("draft");
      }
    } catch {
      notifyError("Failed to fetch grade data");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, batchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCalculate = async (studentId: string) => {
    setIsCalculating(true);
    try {
      await courseGradeService.calculate({ studentId, courseId, batchId });
      notifySuccess("Grade calculated");
      fetchData();
    } catch {
      notifyError("Failed to calculate grade");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmitClick = () => {
    // Basic check before opening dialog
    const gradeIds = grades
      .filter((g: CourseGrade) => g.status === "pending" || g.status === "calculated")
      .map((g: CourseGrade) => g.id);

    if (gradeIds.length === 0) {
      notifyError("No pending grades to submit");
      return;
    }
    setIsOTPDialogOpen(true);
  };

  const handleConfirmSubmit = async (otp: string) => {
    try {
      // We are approving the entire batch? The service function takes ONE ID?
      // Re-reading submitToCommittee in Service... it takes batchId, courseId, semester.
      // But here we are calling 'courseGradeService.submitToCommittee(id)' which maps to 'submit' endpoint for individual grade?
      await api.post('/enrollment/result-workflow/submit', {
        batchId,
        courseId,
        semester,
        otp
      });
      notifySuccess("Grades submitted to committee");
      fetchData();
    } catch (err: any) {
      console.error("Submission failed", err);
      notifyError(err.response?.data?.message || "Failed to submit grades");
      throw err;
    }
  };

  const getGradeForStudent = (studentId: string) => {
    return grades.find((g: CourseGrade) => g.studentId === studentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "calculated":
      case "hand_over":
        return "bg-blue-100 text-blue-800";
      case "submitted_to_committee":
        return "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20";
      case "committee_approved":
        return "bg-teal-100 text-teal-800";
      case "published":
      case "finalized":
        return "bg-emerald-100 text-emerald-800";
      case "returned_to_teacher":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      draft: "Draft",
      calculated: "Calculated",
      hand_over: "Handed Over",
      submitted_to_committee: "Submitted to Committee",
      committee_approved: "Committee Approved",
      published: "Published",
      finalized: "Finalized",
      returned_to_teacher: "Returned by Committee",
    };
    return labels[status] || "Unknown";
  };

  const isMarksLocked =
    workflowStatus === "submitted_to_committee" ||
    workflowStatus === "committee_approved" ||
    workflowStatus === "published" ||
    workflowStatus === "finalized";

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[2.5rem] border p-6 flex items-center justify-between shadow-sm ${isMarksLocked
          ? "bg-red-50/50 border-red-100"
          : "bg-[#2dd4bf]/5 border-[#2dd4bf]/20"
          }`}
      >
        <div className="flex items-center gap-3">
          {isMarksLocked ? (
            <Lock className="h-6 w-6 text-red-600" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-[#2dd4bf]" />
            </div>
          )}
          <div>
            <h3 className="font-black text-slate-900">
              {isMarksLocked ? "Marks Locked" : "In Progress"}
            </h3>
            <p className={`text-sm font-medium ${isMarksLocked
              ? "text-red-700"
              : "text-[#2dd4bf]"
              }`}>
              {isMarksLocked
                ? "Marks have been submitted to the Exam Committee and are now locked from editing."
                : "You can edit and save draft marks before final submission."}
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor(workflowStatus)} text-xs font-black px-4 py-2`}>
          {getStatusLabel(workflowStatus)}
        </Badge>
      </motion.div>

      {/* Course Final Marks Entry Component */}
      <CourseFinalMarksEntry
        courseId={courseId}
        batchId={batchId}
        semester={semester}
        isLocked={isMarksLocked}
      />

      {/* Grade Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card className="border border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden p-0">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black text-slate-900">
                Grade Summary
              </CardTitle>
              {!isMarksLocked && (
                <Button
                  onClick={handleSubmitClick}
                  className="bg-[#2dd4bf] hover:bg-[#25b0a0] shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 text-white rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit to Committee
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* ... table content remains ... */}
            {students.length > 0 ? (
              // ... table code ...
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Student Name
                      </TableHead>
                      <TableHead className="py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Registration No.
                      </TableHead>
                      <TableHead className="font-black text-slate-900">
                        Total Marks
                      </TableHead>
                      <TableHead className="font-black text-slate-900">
                        Grade
                      </TableHead>
                      <TableHead className="font-black text-slate-900">
                        Point
                      </TableHead>
                      <TableHead className="py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Status
                      </TableHead>
                      {!isMarksLocked && (
                        <TableHead className="px-8 py-5 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student: unknown, index: number) => {
                      const studentObj = student as unknown as Record<string, unknown>;
                      const studentId = String(studentObj?.id || studentObj?._id) || `student-${index}`;
                      const studentKey = studentId;
                      const grade = getGradeForStudent(studentId);
                      const isStudentLocked = isMarksLocked;

                      return (
                        <TableRow
                          key={studentKey}
                          className={
                            isStudentLocked ? "bg-slate-50 opacity-70" : ""
                          }
                        >
                          <TableCell className="px-8 py-5 font-black text-slate-900">
                            {String(studentObj?.fullName)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {String(studentObj?.registrationNumber)}
                          </TableCell>
                          <TableCell className="font-bold">
                            {grade?.totalMarksObtained ?? "-"}
                          </TableCell>
                          <TableCell className="px-8 py-5 font-bold text-slate-900">
                            {String((grade as unknown as Record<string, unknown>)?.letterGrade || "-")}
                          </TableCell>
                          <TableCell className="text-sm font-bold">
                            {grade?.gradePoint || "-"}
                          </TableCell>
                          <TableCell>
                            {grade ? (
                              <Badge
                                className={`${getStatusColor(
                                  grade.status
                                )} text-xs font-bold`}
                              >
                                {getStatusLabel(grade.status)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs font-medium">
                                Not Calculated
                              </span>
                            )}
                          </TableCell>
                          {!isStudentLocked && (
                            <TableCell className="px-8 py-5 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCalculate(studentId)
                                }
                                disabled={
                                  isCalculating ||
                                  (grade &&
                                    grade.status !== "pending" &&
                                    grade.status !== "calculated")
                                }
                                className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg text-slate-500 hover:bg-slate-50 hover:text-[#2dd4bf] hover:shadow-sm transition-all"
                              >
                                <Calculator className="h-4 w-4 mr-1" />
                                Calculate
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="font-medium">
                  No students enrolled in this course batch.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <OTPConfirmationDialog
        isOpen={isOTPDialogOpen}
        onClose={() => setIsOTPDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
        purpose="result_submission"
        title="Confirm Grade Submission"
        description="You are about to submit final grades to the Exam Committee. This action cannot be undone by you once approved. Please verify your identity."
      />
    </div>
  );
}
