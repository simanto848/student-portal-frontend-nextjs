"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  academicService,
  CourseSyllabus,
  AcademicApiError,
} from "@/services/academic.service";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpenCheck,
  FileText,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

export default function SyllabusDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [syllabus, setSyllabus] = useState<CourseSyllabus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSyllabus();
    }
  }, [id]);

  const fetchSyllabus = async () => {
    setIsLoading(true);
    try {
      const data = await academicService.getSyllabusById(id);
      setSyllabus(data);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to load syllabus details";
      toast.error(message);
      router.push("/dashboard/staff/program-controller/syllabus");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#588157]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!syllabus) {
    return null;
  }

  const getCourseName = (item: unknown): string => {
    if (!item) return "N/A";
    if (typeof item === "object" && item !== null && "courseId" in item) {
      const sessionCourse = item as { courseId?: { name?: string } };
      if (
        typeof sessionCourse.courseId === "object" &&
        sessionCourse.courseId?.name
      ) {
        return sessionCourse.courseId.name;
      }
    }
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
            onClick={() =>
              router.push("/dashboard/staff/program-controller/syllabus")
            }
            className="text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#344e41]">
              Syllabus Details
            </h1>
            <p className="text-[#344e41]/70">
              {getCourseName(syllabus.sessionCourseId)} - v{syllabus.version}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <BookOpenCheck className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">Overview</h2>
            </div>
            <div className="space-y-4">
              <p className="text-base text-[#344e41] whitespace-pre-wrap">
                {syllabus.overview || "No overview provided."}
              </p>
            </div>
          </div>

          {/* Objectives & Prerequisites */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <ListChecks className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Objectives & Prerequisites
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-[#344e41]/70 block mb-2">
                  Learning Objectives
                </label>
                <p className="text-base text-[#344e41] whitespace-pre-wrap">
                  {syllabus.objectives || "No objectives listed."}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#344e41]/70 block mb-2">
                  Prerequisites
                </label>
                <p className="text-base text-[#344e41] whitespace-pre-wrap">
                  {syllabus.prerequisites || "No prerequisites listed."}
                </p>
              </div>
            </div>
          </div>

          {/* Policies & Grading */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Policies & Grading
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-[#344e41]/70 block mb-2">
                  Grading Policy
                </label>
                <p className="text-base text-[#344e41] whitespace-pre-wrap">
                  {syllabus.gradingPolicy || "No grading policy provided."}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#344e41]/70 block mb-2">
                  Course Policies
                </label>
                <p className="text-base text-[#344e41] whitespace-pre-wrap">
                  {syllabus.policies || "No policies provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Textbooks */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <BookOpenCheck className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Textbooks
              </h2>
            </div>

            <div className="space-y-4">
              {syllabus.textbooks && syllabus.textbooks.length > 0 ? (
                <ul className="space-y-3">
                  {syllabus.textbooks.map((book, index) => (
                    <li key={index} className="p-3 bg-[#f8f9fa] rounded-lg">
                      <p className="font-semibold text-[#344e41]">
                        {book.title}
                      </p>
                      <p className="text-sm text-[#344e41]/70">
                        {book.author} {book.edition ? `(${book.edition})` : ""}
                      </p>
                      {book.isbn && (
                        <p className="text-xs text-[#344e41]/50">
                          ISBN: {book.isbn}
                        </p>
                      )}
                      {book.required && (
                        <span className="text-xs font-medium text-red-600">
                          Required
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-[#344e41]/70">
                  No textbooks listed.
                </p>
              )}
            </div>
          </div>

          {/* Assessment Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <ListChecks className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Assessment Breakdown
              </h2>
            </div>

            <div className="space-y-4">
              {syllabus.assessmentBreakdown ? (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(syllabus.assessmentBreakdown).map(
                    ([key, value]) =>
                      value ? (
                        <div
                          key={key}
                          className="p-3 bg-[#f8f9fa] rounded-lg flex justify-between items-center"
                        >
                          <span className="capitalize text-sm font-medium text-[#344e41]/70">
                            {key}
                          </span>
                          <span className="font-bold text-[#344e41]">
                            {value}%
                          </span>
                        </div>
                      ) : null
                  )}
                </div>
              ) : (
                <p className="text-base text-[#344e41]/70">
                  No assessment breakdown provided.
                </p>
              )}
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <FileText className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Weekly Schedule
              </h2>
            </div>

            <div className="space-y-4">
              {syllabus.weeklySchedule && syllabus.weeklySchedule.length > 0 ? (
                <div className="grid gap-4">
                  {syllabus.weeklySchedule.map((week, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#f8f9fa] rounded-lg border border-[#a3b18a]/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#588157] text-white text-xs font-bold rounded">
                          Week {week.week}
                        </span>
                        <h3 className="font-semibold text-[#344e41]">
                          {week.topic}
                        </h3>
                      </div>
                      {week.readings && (
                        <p className="text-sm text-[#344e41]/80 mt-1">
                          <span className="font-medium">Readings:</span>{" "}
                          {week.readings}
                        </p>
                      )}
                      {week.assignments && (
                        <p className="text-sm text-[#344e41]/80 mt-1">
                          <span className="font-medium">Assignments:</span>{" "}
                          {week.assignments}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-[#344e41]/70">
                  No weekly schedule provided.
                </p>
              )}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <BookOpenCheck className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Additional Resources
              </h2>
            </div>

            <div className="space-y-4">
              {syllabus.additionalResources &&
                syllabus.additionalResources.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {syllabus.additionalResources.map((resource, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[#f8f9fa] rounded-lg border border-[#a3b18a]/10"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-[#344e41]">
                          {resource.title}
                        </h3>
                        {resource.type && (
                          <span className="px-2 py-0.5 bg-[#a3b18a]/20 text-[#344e41] text-xs rounded capitalize">
                            {resource.type}
                          </span>
                        )}
                      </div>
                      {resource.description && (
                        <p className="text-sm text-[#344e41]/70 mt-2">
                          {resource.description}
                        </p>
                      )}
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#588157] hover:underline mt-2 block truncate"
                        >
                          {resource.url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-[#344e41]/70">
                  No additional resources listed.
                </p>
              )}
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#588157]/10 rounded-lg">
                <FileText className="h-5 w-5 text-[#588157]" />
              </div>
              <h2 className="text-lg font-semibold text-[#344e41]">
                Status Information
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-[#344e41]/70">
                  Current Status
                </label>
                <div className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${syllabus.status === "Published"
                      ? "bg-green-100 text-green-800"
                      : syllabus.status === "Approved"
                        ? "bg-blue-100 text-blue-800"
                        : syllabus.status === "Pending Approval"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {syllabus.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#344e41]/70">
                  Version
                </label>
                <p className="text-base font-medium text-[#344e41] mt-1">
                  {syllabus.version}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#344e41]/70">
                  Approved At
                </label>
                <p className="text-base font-medium text-[#344e41] mt-1">
                  {syllabus.approvedAt
                    ? new Date(syllabus.approvedAt).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#344e41]/70">
                  Published At
                </label>
                <p className="text-base font-medium text-[#344e41] mt-1">
                  {syllabus.publishedAt
                    ? new Date(syllabus.publishedAt).toLocaleDateString()
                    : "Not Published"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
