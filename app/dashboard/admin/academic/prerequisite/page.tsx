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
  CoursePrerequisite,
  Course,
  AcademicApiError,
} from "@/services/academic.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { GitMerge } from "lucide-react";

const getId = (item: unknown): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null && "id" in item)
    return (item as Record<string, string>).id;
  return "";
};

interface CoursePrerequisiteWithNames extends CoursePrerequisite {
  courseName: string;
  prerequisiteName: string;
}

export default function CoursePrerequisiteManagementPage() {
  const router = useRouter();
  const [prerequisites, setPrerequisites] = useState<CoursePrerequisite[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedPrerequisite, setSelectedPrerequisite] =
    useState<CoursePrerequisite | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<CoursePrerequisiteWithNames>[] = [
    {
      header: "Course",
      accessorKey: "courseName",
    },
    {
      header: "Prerequisite Course",
      accessorKey: "prerequisiteName",
    },
  ];

  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "courseId",
        label: "Course",
        type: "searchable-select",
        required: true,
        placeholder: "Select a course",
        options: Array.isArray(courses)
          ? courses
              .filter((c) => c.status)
              .map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))
          : [],
      },
      {
        name: "prerequisiteId",
        label: "Prerequisite Course",
        type: "searchable-select",
        required: true,
        placeholder: "Select a prerequisite course",
        options: Array.isArray(courses)
          ? courses
              .filter((c) => c.status)
              .map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))
          : [],
      },
    ],
    [courses],
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prereqData, coursesData] = await Promise.all([
        academicService.getAllPrerequisites(),
        academicService.getAllCourses(),
      ]);
      setPrerequisites(Array.isArray(prereqData) ? prereqData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to load data";
      notifyError(message);
      setPrerequisites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPrerequisite(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (prereq: CoursePrerequisiteWithNames) => {
    setSelectedPrerequisite(prereq);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (prereq: CoursePrerequisiteWithNames) => {
    setSelectedPrerequisite(prereq);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPrerequisite) return;
    setIsDeleting(true);
    try {
      await academicService.deletePrerequisite(selectedPrerequisite.id);
      notifySuccess("Prerequisite deleted successfully");
      fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to delete prerequisite";
      notifyError(message);
    } finally {
      setIsDeleting(false);
      setSelectedPrerequisite(null);
    }
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      if (!data.courseId || !data.prerequisiteId) {
        notifyError("Course and Prerequisite Course are required");
        setIsSubmitting(false);
        return;
      }

      if (data.courseId === data.prerequisiteId) {
        notifyError("Course cannot be its own prerequisite");
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        courseId: data.courseId,
        prerequisiteId: data.prerequisiteId,
      };

      if (selectedPrerequisite) {
        await academicService.updatePrerequisite(
          selectedPrerequisite.id,
          submitData,
        );
        notifySuccess("Prerequisite updated successfully");
      } else {
        await academicService.createPrerequisite(submitData);
        notifySuccess("Prerequisite created successfully");
      }
      fetchData();
      setIsFormModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to save prerequisite";
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Course Prerequisite Management"
          subtitle="Manage course dependencies"
          actionLabel="Add Prerequisite"
          onAction={handleCreate}
          icon={GitMerge}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
          </div>
        ) : (
          <DataTable
            data={prerequisites.map((p) => ({
              ...p,
              courseName:
                typeof p.courseId === "object" && p.courseId
                  ? (p.courseId as { name: string }).name
                  : "N/A",
              prerequisiteName:
                typeof p.prerequisiteId === "object" && p.prerequisiteId
                  ? (p.prerequisiteId as { name: string }).name
                  : "N/A",
            }))}
            columns={columns}
            searchKey="courseName"
            searchPlaceholder="Search by course name..."
            onView={(item) =>
              router.push(`/dashboard/admin/academic/prerequisite/${item.id}`)
            }
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Prerequisite"
          description="Are you sure you want to delete this prerequisite? This action cannot be undone."
          isDeleting={isDeleting}
        />

        <GenericFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={
            selectedPrerequisite ? "Edit Prerequisite" : "Add Prerequisite"
          }
          description={
            selectedPrerequisite
              ? "Update prerequisite information"
              : "Add a new course prerequisite"
          }
          fields={formFields}
          initialData={
            selectedPrerequisite
              ? {
                  courseId: getId(selectedPrerequisite.courseId),
                  prerequisiteId: getId(selectedPrerequisite.prerequisiteId),
                }
              : {}
          }
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
