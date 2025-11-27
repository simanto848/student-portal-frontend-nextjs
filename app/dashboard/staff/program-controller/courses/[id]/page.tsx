"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  academicService,
  Course,
  AcademicApiError,
} from "@/services/academic.service";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourse = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await academicService.getCourseById(id);
      setCourse(data);
    } catch (error) {
      const message = error instanceof AcademicApiError ? error.message : "Failed to load course details";
      toast.error(message);
      router.push("/dashboard/staff/program-controller/courses");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id, fetchCourse]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#588157]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return null;
  }

  const getDepartmentName = (course: Course): string => {
    if (typeof course.departmentId === "object" && course.departmentId?.name)
      return course.departmentId.name;
    return "N/A";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#344e41]">{course.name}</h1>
            <p className="text-[#344e41]/70">Course Details</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Course Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#344e41]/70">
                    Course Code
                  </label>
                  <p className="text-base font-medium text-[#344e41]">
                    {course.code}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#344e41]/70">
                    Credits
                  </label>
                  <p className="text-base font-medium text-[#344e41]">
                    {course.credit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#344e41]/70">
                    Type
                  </label>
                  <p className="text-base font-medium text-[#344e41] capitalize">
                    {course.courseType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#344e41]/70">
                    Elective
                  </label>
                  <p className="text-base font-medium text-[#344e41]">
                    {course.isElective ? "Yes" : "No"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-[#344e41]/70">
                    Department
                  </label>
                  <p className="text-base font-medium text-[#344e41]">
                    {getDepartmentName(course)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#344e41]/70">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={course.status ? "default" : "destructive"}
                      className={
                        course.status
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }
                    >
                      {course.status ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <FileText className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Description
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-base text-[#344e41]/80 leading-relaxed">
                {course.description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
