"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookMarked,
  Calendar,
  GraduationCap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentEnrollmentsPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<number>(1);

  useEffect(() => {
    fetchEnrollments();
  }, [user]);

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const studentId = user.id || user._id;
      const response = await enrollmentService.listEnrollments({ studentId });
      const enrollmentsList = response?.enrollments || [];

      setEnrollments(enrollmentsList);

      // Determine current semester
      const maxSem = Math.max(
        ...enrollmentsList.map((e) => e.semester || 1),
        1
      );
      setCurrentSemester(maxSem);
    } catch (err: any) {
      console.error("Failed to fetch enrollments", err);
      setError("Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  };

  // Group by semester
  const groupedBySemester = enrollments.reduce((acc, enrollment) => {
    const sem = enrollment.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(enrollment);
    return acc;
  }, {} as Record<number, any[]>);

  const semesters = Object.keys(groupedBySemester)
    .map(Number)
    .sort((a, b) => b - a); // Descending

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full" />
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
                <GraduationCap className="h-4 w-4" /> Course Enrollments
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Your enrolled courses
              </h1>
              <p className="text-white/75 max-w-2xl">
                View all your course enrollments organized by semester.
              </p>
              <div className="flex gap-3 flex-wrap pt-1">
                <Button
                  size="sm"
                  className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Download Report
                </Button>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[220px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Total Courses
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">{enrollments.length}</span>
                <span className="text-sm text-white/70">enrolled</span>
              </div>
              <p className="text-[11px] text-white/70 mt-2">
                Current Semester: {currentSemester}
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

        {enrollments.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookMarked className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>You are not enrolled in any courses yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={`sem-${currentSemester}`} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
              {semesters.map((sem) => (
                <TabsTrigger key={sem} value={`sem-${sem}`}>
                  Semester {sem} ({groupedBySemester[sem]?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            {semesters.map((sem) => (
              <TabsContent key={sem} value={`sem-${sem}`} className="space-y-4">
                <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#3e6253]" /> Semester{" "}
                      {sem} Enrollments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {groupedBySemester[sem]?.map((enrollment: any) => {
                      const course =
                        typeof enrollment.courseId === "object"
                          ? enrollment.courseId
                          : null;
                      const batch =
                        typeof enrollment.batchId === "object"
                          ? enrollment.batchId
                          : null;

                      const statusColors: Record<string, string> = {
                        enrolled: "bg-green-100 text-green-700",
                        completed: "bg-blue-100 text-blue-700",
                        dropped: "bg-red-100 text-red-700",
                        withdrawn: "bg-yellow-100 text-yellow-800",
                      };

                      return (
                        <div
                          key={enrollment.id}
                          className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-[#1a3d32]">
                                  {course?.code || "N/A"} -{" "}
                                  {course?.name || "Unknown Course"}
                                </p>
                                <Badge
                                  className={
                                    statusColors[enrollment.enrollmentStatus] ||
                                    "bg-gray-100 text-gray-700"
                                  }
                                >
                                  {enrollment.enrollmentStatus || "Unknown"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Credits: {course?.credit || 0} • Batch:{" "}
                                {batch?.name || "N/A"}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>
                                  Enrolled on:{" "}
                                  {enrollment.enrollmentDate
                                    ? new Date(
                                        enrollment.enrollmentDate
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                                {enrollment.completionDate && (
                                  <span>
                                    Completed:{" "}
                                    {new Date(
                                      enrollment.completionDate
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[#1a3d32] border-[#3e6253] hover:bg-[#3e6253]/10"
                              onClick={() =>
                                (window.location.href = `/dashboard/student/classroom`)
                              }
                            >
                              View Course
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
