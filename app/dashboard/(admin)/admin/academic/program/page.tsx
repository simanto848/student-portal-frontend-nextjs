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
  Department,
  Program,
  AcademicApiError,
} from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { notifySuccess, notifyError } from "@/components/toast";
import { GraduationCap } from "lucide-react";

const getDepartmentName = (prog: Program): string => {
  if (typeof prog.departmentId === "object" && prog.departmentId?.name)
    return prog.departmentId.name;
  return "N/A";
};

const getDepartmentId = (prog: Program): string => {
  if (typeof prog.departmentId === "string") return prog.departmentId;
  if (typeof prog.departmentId === "object" && prog.departmentId?.id)
    return prog.departmentId.id;
  return "";
};

export default function ProgramManagementPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<Program>[] = [
    { header: "Program Name", accessorKey: "name" },
    { header: "Short Name", accessorKey: "shortName" },
    {
      header: "Department",
      accessorKey: "departmentId",
      cell: (item) => getDepartmentName(item),
    },
    {
      header: "Duration",
      accessorKey: "duration",
      cell: (item) => `${item.duration} Year${item.duration > 1 ? "s" : ""}`,
    },
    {
      header: "Credits",
      accessorKey: "totalCredits",
      cell: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#a3b18a]/30 text-[#344e41]">
          {item.totalCredits}
        </span>
      ),
    },
    {
      header: "Batches",
      accessorKey: "batchesCount",
      cell: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#588157]/20 text-[#344e41]">
          {item.batchesCount || 0}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge
          variant={item.status ? "default" : "destructive"}
          className={
            item.status
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {item.status ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Program Name",
        type: "text",
        required: true,
        placeholder: "e.g. Bachelor of Science in Computer Science",
      },
      {
        name: "shortName",
        label: "Short Name",
        type: "text",
        required: true,
        placeholder: "e.g. BSC-CSE",
      },
      {
        name: "departmentId",
        label: "Department",
        type: "select",
        required: true,
        placeholder: "Select a department",
        options: Array.isArray(departments)
          ? departments
              .filter((d) => d.status)
              .map((d) => ({
                label: `${d.name} (${d.shortName})`,
                value: d.id,
              }))
          : [],
      },
      {
        name: "duration",
        label: "Duration (Years)",
        type: "number",
        required: true,
        placeholder: "e.g. 4",
      },
      {
        name: "totalCredits",
        label: "Total Credits",
        type: "number",
        required: true,
        placeholder: "e.g. 160",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Brief description of the program...",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [departments],
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [programsData, deptsData] = await Promise.all([
        academicService.getAllPrograms(),
        academicService.getAllDepartments(),
      ]);
      setPrograms(Array.isArray(programsData) ? programsData : []);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to load data";
      notifyError(message);
      setPrograms([]);
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProgram(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (prog: Program) => {
    setSelectedProgram(prog);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (prog: Program) => {
    setSelectedProgram(prog);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgram) return;
    setIsDeleting(true);
    try {
      await academicService.deleteProgram(selectedProgram.id);
      notifySuccess("Program deleted successfully");
      fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to delete program";
      notifyError(message);
    } finally {
      setIsDeleting(false);
      setSelectedProgram(null);
    }
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      if (!data.name || data.name.trim().length < 3) {
        notifyError("Program name must be at least 3 characters");
        setIsSubmitting(false);
        return;
      }

      if (!data.shortName || data.shortName.trim().length < 2) {
        notifyError("Short name must be at least 2 characters");
        setIsSubmitting(false);
        return;
      }

      if (!data.departmentId) {
        notifyError("Please select a department");
        setIsSubmitting(false);
        return;
      }

      const duration = Number(data.duration);
      if (!duration || duration < 1 || duration > 10) {
        notifyError("Duration must be between 1 and 10 years");
        setIsSubmitting(false);
        return;
      }

      const totalCredits = Number(data.totalCredits);
      if (!totalCredits || totalCredits < 1 || totalCredits > 300) {
        notifyError("Total credits must be between 1 and 300");
        setIsSubmitting(false);
        return;
      }

      if (data.description && data.description.length > 1000) {
        notifyError("Description must not exceed 1000 characters");
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        name: data.name.trim(),
        shortName: data.shortName.trim().toUpperCase(),
        departmentId: data.departmentId,
        duration: duration,
        totalCredits: totalCredits,
        description: data.description?.trim() || undefined,
        status: data.status === "true",
      };

      if (selectedProgram) {
        await academicService.updateProgram(selectedProgram.id, submitData);
        notifySuccess("Program updated successfully");
      } else {
        await academicService.createProgram(submitData);
        notifySuccess("Program created successfully");
      }
      fetchData();
      setIsFormModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to save program";
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Program Management"
          subtitle="Manage academic programs and degrees"
          actionLabel="Add New Program"
          onAction={handleCreate}
          icon={GraduationCap}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
          </div>
        ) : (
          <DataTable
            data={programs}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search program by name..."
            onView={(item) =>
              router.push(`/dashboard/admin/academic/program/${item.id}`)
            }
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Program"
          description={`Are you sure you want to delete "${selectedProgram?.name}"? This action cannot be undone. Note: Programs with active batches cannot be deleted.`}
          isDeleting={isDeleting}
        />

        <GenericFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={selectedProgram ? "Edit Program" : "Add New Program"}
          description={
            selectedProgram
              ? "Update program information"
              : "Create a new academic program"
          }
          fields={formFields}
          initialData={
            selectedProgram
              ? {
                  name: selectedProgram.name,
                  shortName: selectedProgram.shortName,
                  departmentId: getDepartmentId(selectedProgram),
                  duration: String(selectedProgram.duration),
                  totalCredits: String(selectedProgram.totalCredits),
                  description: selectedProgram.description || "",
                  status: selectedProgram.status ? "true" : "false",
                }
              : { status: "true", duration: "4", totalCredits: "160" }
          }
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
