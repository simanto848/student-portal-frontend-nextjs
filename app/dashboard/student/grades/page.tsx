"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Award, FileText, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const studentId = user.id || user._id;

        const response = await courseGradeService.list({ studentId });
        let list: CourseGrade[] = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (response && Array.isArray((response as any).grades)) {
          list = (response as any).grades;
        } else if (response && Array.isArray((response as any).data)) {
          list = (response as any).data;
        }
        setGrades(list);

        const cgpaRes = await courseGradeService.calculateCGPA(studentId);
        if (cgpaRes && typeof cgpaRes.cgpa === 'number') {
          setCgpa(cgpaRes.cgpa);
        }

      } catch (err: any) {
        console.error("Failed to fetch grades", err);
        setError("Failed to load grades.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalCredits = grades.reduce((acc, g) => acc + ((g.course as any)?.credit || 0), 0);
  const achievements = [];
  if (cgpa >= 3.75) {
    achievements.push({ id: "a1", title: "Dean's List", detail: "GPA above 3.75", icon: Award });
  }
  if (grades.some(g => g.gradePoint === 4.0)) {
    achievements.push({ id: "a2", title: "Perfect Score", detail: "Achieved 4.0 in a course", icon: Sparkles });
  }

  const maxSemester = Math.max(...grades.map(g => g.semester), 1);
  const currentSemesterGrades = grades.filter(g => g.semester === maxSemester);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Gradebook
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Your course performance at a glance
              </h1>
              <p className="text-white/75 max-w-2xl">
                Read-only snapshot of grades and progress.
              </p>
              <div className="flex gap-3 flex-wrap pt-1">
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
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[220px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Cumulative GPA
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">{cgpa.toFixed(2)}</span>
                <span className="text-sm text-white/70">overall</span>
              </div>
              <Progress value={(cgpa / 4.0) * 100} className="mt-3 bg-white/20" />
              <p className="text-[11px] text-white/70 mt-2">
                {grades.length} courses completed · {totalCredits} credits
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-none shadow-sm lg:col-span-2 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-[#1a3d32]">
                Current Semester ({maxSemester})
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-[#3e6253]">
                View details
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSemesterGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a3d32]">
                        {(grade.course as any)?.code || 'N/A'} • {(grade.course as any)?.name || 'Unknown Course'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Credits: {(grade.course as any)?.credit || 0}
                      </p>
                    </div>
                    <Badge className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
                      {grade.grade || 'N/A'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {/* Assuming totalMarks is 100 or something */}
                    <Progress value={grade.totalMarks > 0 ? (grade.totalMarksObtained / grade.totalMarks) * 100 : 0} className="flex-1" />
                    <span className="text-sm text-muted-foreground">
                      {grade.totalMarks > 0 ? Math.round((grade.totalMarksObtained / grade.totalMarks) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Grade Point: {grade.gradePoint?.toFixed(2) || '0.0'}
                  </p>
                </div>
              ))}
              {currentSemesterGrades.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No published grades for this semester.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <Award className="h-4 w-4 text-[#3e6253]" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200"
                >
                  <ach.icon className="h-5 w-5 text-[#3e6253]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1a3d32]">
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

        <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#3e6253]" /> Grade Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grades.map((grade, idx) => (
              <div
                key={`${grade.id}-${idx}`}
                className="grid grid-cols-2 md:grid-cols-5 items-center gap-2 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="text-sm font-semibold text-[#1a3d32]">
                  {(grade.course as any)?.code || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(grade.course as any)?.name || 'Unknown'}
                </div>
                <div className="text-sm text-[#1a3d32]">
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
              <p className="text-sm text-muted-foreground">No grades history available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
