"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart3,
  Award,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useStudentGrades,
  useCGPA,
} from "@/hooks/queries/useEnrollmentQueries";
import { CourseGrade } from "@/services/enrollment/courseGrade.service";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const studentId = user?.id || user?._id || "";

  // Use React Query hooks for data fetching
  const {
    data: grades = [],
    isLoading: gradesLoading,
    error: gradesError,
  } = useStudentGrades(studentId);

  const { data: cgpa = 0, isLoading: cgpaLoading } = useCGPA(studentId);

  const isLoading = gradesLoading || cgpaLoading;
  const error = gradesError ? "Failed to load grades." : null;

  // Calculate derived data
  const totalCredits = grades.reduce(
    (acc, g) => acc + ((g.course as { credit?: number })?.credit || 0),
    0,
  );

  const achievements = [];
  if (cgpa >= 3.75) {
    achievements.push({
      id: "a1",
      title: "Dean's List",
      detail: "GPA above 3.75",
      icon: Award,
    });
  }
  if (grades.some((g) => g.gradePoint === 4.0)) {
    achievements.push({
      id: "a2",
      title: "Perfect Score",
      detail: "Achieved 4.0 in a course",
      icon: Sparkles,
    });
  }

  const maxSemester = Math.max(...grades.map((g) => g.semester), 1);
  const currentSemesterGrades = grades.filter(
    (g) => g.semester === maxSemester,
  );

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-grid" />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={BarChart3}
          label="Gradebook"
          title="Your course performance at a glance"
          description="Read-only snapshot of grades and progress."
          actions={
            <>
              <Button
                size="sm"
                className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
              >
                Download transcript
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Export CSV
              </Button>
            </>
          }
          stats={{
            label: "Cumulative GPA",
            value: cgpa.toFixed(2),
            subtext: "overall",
            progress: cgpa,
            progressMax: 4.0,
          }}
        >
          <p className="text-[11px] text-white/70 mt-2">
            {grades.length} courses completed · {totalCredits} credits
          </p>
        </DashboardHero>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Semester Grades */}
          <Card className="border-none shadow-sm lg:col-span-2 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold dashboard-title">
                Current Semester ({maxSemester})
              </CardTitle>
              <Button variant="ghost" size="sm" className="dashboard-accent">
                View details
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSemesterGrades.map((grade) => (
                <GradeCard key={grade.id} grade={grade} />
              ))}
              {currentSemesterGrades.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No published grades for this semester.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                <Award className="h-4 w-4 dashboard-accent" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200"
                >
                  <ach.icon className="h-5 w-5 dashboard-accent" />
                  <div>
                    <p className="text-sm font-semibold dashboard-title">
                      {ach.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ach.detail}
                    </p>
                  </div>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No achievements yet. Keep working hard!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grade Timeline */}
        <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
              <FileText className="h-4 w-4 dashboard-accent" /> Grade Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grades.map((grade, idx) => (
              <div
                key={`${grade.id}-${idx}`}
                className="grid grid-cols-2 md:grid-cols-5 items-center gap-2 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="text-sm font-semibold dashboard-title">
                  {(grade.course as { code?: string })?.code || "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(grade.course as { name?: string })?.name || "Unknown"}
                </div>
                <div className="text-sm dashboard-title">
                  Grade: {grade.grade}
                </div>
                <div className="text-sm text-muted-foreground">
                  Points: {grade.gradePoint?.toFixed(2)}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  Sem {grade.semester}
                </div>
              </div>
            ))}
            {grades.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No grades history available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Grade Card sub-component
function GradeCard({ grade }: { grade: CourseGrade }) {
  const percentage =
    grade.totalMarks > 0
      ? Math.round((grade.totalMarksObtained / grade.totalMarks) * 100)
      : 0;

  // Type the course object for better type safety
  const course = grade.course as
    | { code?: string; name?: string; credit?: number }
    | undefined;

  return (
    <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold dashboard-title">
            {course?.code || "N/A"} • {course?.name || "Unknown Course"}
          </p>
          <p className="text-xs text-muted-foreground">
            Credits: {course?.credit || 0}
          </p>
        </div>
        <Badge className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
          {grade.grade || "N/A"}
        </Badge>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={percentage} className="flex-1" />
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Grade Point: {grade.gradePoint?.toFixed(2) || "0.0"}
      </p>
    </div>
  );
}
