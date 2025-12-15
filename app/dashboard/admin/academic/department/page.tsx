"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import {
  GenericFormModal,
  FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building } from "lucide-react";

// React Query hooks
import {
  useDepartments,
  useFaculties,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/queries/useAcademicQueries";

// Services & Types
import { Department, Faculty } from "@/services/academic/types";
import { teacherService, Teacher } from "@/services/teacher.service";

// Validation
import { departmentSchema, validateForm } from "@/lib/validations/academic";
import { ApiError } from "@/types/api";

// Helper functions
const getFacultyName = (dept: Department): string => {
  if (typeof dept.facultyId === "object" && dept.facultyId?.name) {
    return dept.facultyId.name;
  }
  return "N/A";
};

const getFacultyId = (dept: Department): string => {
  if (typeof dept.facultyId === "string") return dept.facultyId;
  if (typeof dept.facultyId === "object" && dept.facultyId?.id) {
    return dept.facultyId.id;
  }
  return "";
};

export default function DepartmentManagementPage() {
  const router = useRouter();

  // React Query hooks
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useDepartments();
  const { data: faculties = [], isLoading: isFacultiesLoading } =
    useFaculties();
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  // Local state for teachers
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isTeachersLoading, setIsTeachersLoading] = useState(true);

  // Modal states
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Combined loading state
  const isLoading = isDepartmentsLoading || isFacultiesLoading;

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsTeachersLoading(true);
      try {
        const data = await teacherService.getAllTeachers();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load teachers:", error);
        setTeachers([]);
      } finally {
        setIsTeachersLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Table columns definition
  const columns: Column<Department>[] = useMemo(
    () => [
      { header: "Department Name", accessorKey: "name" },
      { header: "Short Name", accessorKey: "shortName" },
      {
        header: "Faculty",
        accessorKey: "facultyId",
        cell: (item) => getFacultyName(item),
      },
      {
        header: "Head",
        accessorKey: "departmentHeadId",
        cell: (item) => {
          if (item.departmentHeadId) {
            const head = teachers.find((t) => t.id === item.departmentHeadId);
            if (head) {
              return (
                <span>
                  {head.fullName}
                  {item.isActingHead && (
                    <span className="ml-1 text-xs text-[#588157]">
                      (Acting)
                    </span>
                  )}
                </span>
              );
            }
          }
          return <span className="text-[#344e41]/50 italic">Not Assigned</span>;
        },
      },
      {
        header: "Programs",
        accessorKey: "programsCount",
        cell: (item) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#588157]/20 text-[#344e41]">
            {item.programsCount || 0}
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
    ],
    [teachers],
  );

  // Form fields definition with dynamic options
  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Department Name",
        type: "text",
        required: true,
        placeholder: "e.g. Computer Science and Engineering",
      },
      {
        name: "shortName",
        label: "Short Name",
        type: "text",
        required: true,
        placeholder: "e.g. CSE",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "dept@university.edu",
      },
      {
        name: "phone",
        label: "Phone",
        type: "text",
        placeholder: "+880 1XXX-XXXXXX",
      },
      {
        name: "facultyId",
        label: "Faculty",
        type: "searchable-select",
        required: true,
        placeholder: "Select a faculty",
        options: faculties
          .filter((f) => f.status)
          .map((f) => ({ label: f.name, value: f.id })),
      },
      {
        name: "departmentHeadId",
        label: "Department Head",
        type: "searchable-select",
        placeholder: "Select a department head",
        options: teachers.map((t) => ({
          label: `${t.fullName} (${t.designation || "N/A"})`,
          value: t.id,
        })),
      },
      {
        name: "isActingHead",
        label: "Is Acting Head?",
        type: "select",
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
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
    [faculties, teachers],
  );

  // Handlers
  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsFormModalOpen(true);
  };

  const handleView = (dept: Department) => {
    router.push(`/dashboard/admin/academic/department/${dept.id}`);
  };

  const handleDeleteClick = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;

    setIsDeleting(true);
    try {
      await deleteDepartmentMutation.mutateAsync(selectedDepartment.id);
      toast.success("Department deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      const message = ApiError.isApiError(error)
        ? error.message
        : "Failed to delete department";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);

    try {
      // Validate using Zod schema
      const validation = validateForm(departmentSchema, data);

      if (!validation.success) {
        // Show first validation error
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        name: validation.data.name,
        shortName: validation.data.shortName,
        email: validation.data.email,
        phone: data.phone?.trim() || undefined,
        facultyId: validation.data.facultyId,
        departmentHeadId: data.departmentHeadId || undefined,
        isActingHead: validation.data.isActingHead,
        status: validation.data.status,
      };

      if (selectedDepartment) {
        await updateDepartmentMutation.mutateAsync({
          id: selectedDepartment.id,
          data: submitData,
        });
        toast.success("Department updated successfully");
      } else {
        await createDepartmentMutation.mutateAsync(submitData);
        toast.success("Department created successfully");
      }

      setIsFormModalOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      const message = ApiError.isApiError(error)
        ? error.message
        : "Failed to save department";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initial form data for editing
  const getInitialData = () => {
    if (!selectedDepartment) {
      return { status: "true", isActingHead: "false" };
    }

    return {
      name: selectedDepartment.name,
      shortName: selectedDepartment.shortName,
      email: selectedDepartment.email,
      phone: selectedDepartment.phone || "",
      facultyId: getFacultyId(selectedDepartment),
      departmentHeadId: selectedDepartment.departmentHeadId || "",
      isActingHead: selectedDepartment.isActingHead ? "true" : "false",
      status: selectedDepartment.status ? "true" : "false",
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Department Management"
          subtitle="Manage university departments"
          actionLabel="Add New Department"
          onAction={handleCreate}
          icon={Building}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
          </div>
        ) : (
          <DataTable
            data={departments}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search department by name..."
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Department"
          description={`Are you sure you want to delete "${selectedDepartment?.name}"? This action cannot be undone. Note: Departments with active programs cannot be deleted.`}
          isDeleting={isDeleting}
        />

        {/* Create/Edit Form Modal */}
        <GenericFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={selectedDepartment ? "Edit Department" : "Add New Department"}
          description={
            selectedDepartment
              ? "Update department information"
              : "Create a new department"
          }
          fields={formFields}
          initialData={getInitialData()}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
