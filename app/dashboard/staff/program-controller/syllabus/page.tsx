"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import {
  GenericFormModal,
  FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import {
  academicService,
  CourseSyllabus,
  SessionCourse,
  AcademicApiError,
} from "@/services/academic.service";
import { toast } from "sonner";
import { BookOpenCheck, Info } from "lucide-react";

const getId = (item: unknown): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null && "id" in item)
    return (item as { id: string }).id;
  return "";
};

interface SyllabusWithDetails extends CourseSyllabus {
  courseName: string;
}

export default function SyllabusManagementPage() {
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<CourseSyllabus[]>([]);
  const [sessionCourses, setSessionCourses] = useState<SessionCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] =
    useState<CourseSyllabus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<SyllabusWithDetails>[] = [
    {
      header: "Course",
      accessorKey: "courseName",
    },
    {
      header: "Version",
      accessorKey: "version",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => {
        let colorClass = "bg-gray-100 text-gray-800";
        switch (item.status) {
          case "Approved":
            colorClass = "bg-blue-100 text-blue-800";
            break;
          case "Published":
            colorClass = "bg-green-100 text-green-800";
            break;
          case "Pending Approval":
            colorClass = "bg-yellow-100 text-yellow-800";
            break;
          case "Archived":
            colorClass = "bg-red-100 text-red-800";
            break;
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
            {item.status}
          </span>
        );
      },
    },
  ];

  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "sessionCourseId",
        label: "Course (Session)",
        type: "searchable-select",
        required: true,
        placeholder: "Select a course",
        options: sessionCourses.map((sc) => {
          const courseName =
            typeof sc.courseId === "object"
              ? sc.courseId.name
              : "Unknown Course";
          const courseCode =
            typeof sc.courseId === "object" ? sc.courseId.code : "";
          return { label: `${courseName} (${courseCode})`, value: sc.id };
        }),
      },
      {
        name: "version",
        label: "Version",
        type: "text",
        required: true,
        placeholder: "e.g. 1.0",
      },
      {
        name: "overview",
        label: "Overview",
        type: "textarea",
        required: false,
        placeholder: "Course overview...",
      },
      {
        name: "objectives",
        label: "Objectives",
        type: "textarea",
        required: false,
        placeholder: "Learning objectives...",
      },
      {
        name: "prerequisites",
        label: "Prerequisites Description",
        type: "textarea",
        required: false,
        placeholder: "Describe prerequisites...",
      },
      {
        name: "gradingPolicy",
        label: "Grading Policy",
        type: "textarea",
        required: false,
        placeholder: "Grading breakdown...",
      },
      {
        name: "policies",
        label: "Policies",
        type: "textarea",
        required: false,
        placeholder: "Course policies...",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Draft", value: "Draft" },
          { label: "Pending Approval", value: "Pending Approval" },
        ],
      },
    ],
    [sessionCourses]
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [syllabiData, sessionCoursesData] = await Promise.all([
        academicService.getAllSyllabi(),
        academicService.getAllSessionCourses(),
      ]);
      setSyllabi(Array.isArray(syllabiData) ? syllabiData : []);
      setSessionCourses(
        Array.isArray(sessionCoursesData) ? sessionCoursesData : []
      );
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to load data";
      toast.error(message);
      setSyllabi([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSyllabus(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (syllabus: SyllabusWithDetails) => {
    // Only allow editing if status is Draft or Pending Approval
    if (syllabus.status === "Approved" || syllabus.status === "Published") {
      toast.error(
        "Cannot edit approved or published syllabi. Contact an administrator."
      );
      return;
    }
    setSelectedSyllabus(syllabus);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (syllabus: SyllabusWithDetails) => {
    // Only allow deleting if status is Draft
    if (syllabus.status !== "Draft") {
      toast.error(
        "Only draft syllabi can be deleted. Contact an administrator for other statuses."
      );
      return;
    }
    setSelectedSyllabus(syllabus);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSyllabus) return;
    setIsDeleting(true);
    try {
      await academicService.deleteSyllabus(selectedSyllabus.id);
      toast.success("Syllabus deleted successfully");
      fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to delete syllabus";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setSelectedSyllabus(null);
    }
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        sessionCourseId: data.sessionCourseId,
        version: data.version,
        overview: data.overview || undefined,
        objectives: data.objectives || undefined,
        prerequisites: data.prerequisites || undefined,
        gradingPolicy: data.gradingPolicy || undefined,
        policies: data.policies || undefined,
        status: data.status as "Draft" | "Pending Approval",
      };

      if (selectedSyllabus) {
        await academicService.updateSyllabus(selectedSyllabus.id, submitData);
        toast.success("Syllabus updated successfully");
      } else {
        await academicService.createSyllabus(submitData);
        toast.success("Syllabus created successfully");
      }
      fetchData();
      setIsFormModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to save syllabus";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Syllabus Management"
          subtitle="Manage course syllabi for your department"
          actionLabel="Add Syllabus"
          onAction={handleCreate}
          icon={BookOpenCheck}
        />

        {/* Info Banner - Program Controller Limitations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Note about syllabus workflow:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>
                You can create and edit syllabi with <strong>Draft</strong> or{" "}
                <strong>Pending Approval</strong> status
              </li>
              <li>
                Only administrators can <strong>Approve</strong> or{" "}
                <strong>Publish</strong> syllabi
              </li>
              <li>
                Once approved or published, syllabi can only be edited by
                administrators
              </li>
            </ul>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
          </div>
        ) : (
          <DataTable
            data={syllabi.map((s) => {
              const course =
                typeof s.sessionCourseId === "object" && s.sessionCourseId
                  ? (s.sessionCourseId as { courseId?: { name?: string } })
                      .courseId
                  : null;
              const courseName =
                typeof course === "object" && course
                  ? course.name || "N/A"
                  : "N/A";

              return {
                ...s,
                courseName: courseName,
              };
            })}
            columns={columns}
            searchKey="courseName"
            searchPlaceholder="Search by course..."
            onView={(item) =>
              router.push(
                `/dashboard/staff/program-controller/syllabus/${item.id}`
              )
            }
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Syllabus"
          description="Are you sure you want to delete this syllabus? This action cannot be undone."
          isDeleting={isDeleting}
        />

        <GenericFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={selectedSyllabus ? "Edit Syllabus" : "Add Syllabus"}
          description={
            selectedSyllabus
              ? "Update syllabus information"
              : "Create a new syllabus"
          }
          fields={formFields}
          initialData={
            selectedSyllabus
              ? {
                  sessionCourseId: getId(selectedSyllabus.sessionCourseId),
                  version: selectedSyllabus.version,
                  overview: selectedSyllabus.overview || "",
                  objectives: selectedSyllabus.objectives || "",
                  prerequisites: selectedSyllabus.prerequisites || "",
                  gradingPolicy: selectedSyllabus.gradingPolicy || "",
                  policies: selectedSyllabus.policies || "",
                  status:
                    selectedSyllabus.status === "Approved" ||
                    selectedSyllabus.status === "Published"
                      ? "Draft" // Reset to draft if somehow editing approved/published
                      : selectedSyllabus.status,
                }
              : {
                  status: "Draft",
                }
          }
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
