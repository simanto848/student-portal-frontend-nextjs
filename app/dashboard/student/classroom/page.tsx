"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  Users,
  Calendar,
  Code,
  Search,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useStudentClassrooms } from "@/hooks/queries/useClassroomQueries";
import { Workspace } from "@/services/classroom/types";

export default function StudentClassroomPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Use React Query hook for data fetching
  const { workspaces, isLoading, isError, error, refetch } =
    useStudentClassrooms();

  // Filter workspaces based on search query
  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery) return workspaces;
    const query = searchQuery.toLowerCase();
    return workspaces.filter(
      (ws: Workspace) =>
        ws.courseName?.toLowerCase().includes(query) ||
        ws.courseCode?.toLowerCase().includes(query) ||
        ws.title?.toLowerCase().includes(query) ||
        ws.batchName?.toLowerCase().includes(query),
    );
  }, [workspaces, searchQuery]);

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-cards" cardCount={6} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={BookOpen}
          label="Virtual Classrooms"
          title="My Classrooms"
          description="Access your courses, materials, and assignments."
          actions={
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          }
          stats={{
            label: "Total Courses",
            value: workspaces.length.toString(),
            subtext: workspaces.length === 1 ? "course" : "courses",
          }}
        />

        {/* Error Alert */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load classrooms."}
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search classrooms..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Classroom Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkspaces.map((ws: Workspace) => (
            <ClassroomCard key={ws.id} workspace={ws} />
          ))}

          {/* Empty State */}
          {filteredWorkspaces.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                {searchQuery
                  ? "No Classrooms Match Your Search"
                  : "No Classrooms Available"}
              </h3>
              <p className="text-sm text-center max-w-md mt-1">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "You are not enrolled in any classrooms yet. Classrooms will appear here once your teachers set them up."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Classroom Card sub-component
function ClassroomCard({ workspace }: { workspace: Workspace }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
      {/* Colored Header Bar */}
      <div className="h-2 bg-gradient-to-r from-[#588157] to-[#3a5a40]" />

      <CardHeader className="pb-3">
        {/* Course Code Badge */}
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-[#588157]/10 text-[#344e41] hover:bg-[#588157]/20 font-mono">
            <Code className="h-3 w-3 mr-1" />
            {workspace.courseCode || "N/A"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Batch {workspace.batchName || "N/A"}
          </Badge>
        </div>

        {/* Course Name */}
        <CardTitle className="text-lg font-bold dashboard-title group-hover:text-[#588157] transition-colors line-clamp-2">
          {workspace.courseName || workspace.title || "Untitled Course"}
        </CardTitle>

        {/* Department Info */}
        <CardDescription className="flex items-center gap-1 mt-1">
          <GraduationCap className="h-3.5 w-3.5" />
          <span className="line-clamp-1">
            {workspace.departmentId
              ? `Dept: ${workspace.departmentId}`
              : "Course Workspace"}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Total Students */}
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-[#588157]" />
            <span>
              {workspace.totalBatchStudents || workspace.studentCount || 0}{" "}
              Students
            </span>
          </div>

          {/* Semester Info */}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-[#588157]" />
            <span>Semester {workspace.semester || "1"}</span>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Materials, Quizzes & Assignments</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link
          href={`/dashboard/student/classroom/${workspace.id}`}
          className="w-full"
        >
          <Button className="w-full bg-[#588157] text-white hover:bg-[#3a5a40] group-hover:shadow-md transition-all">
            Enter Classroom
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
