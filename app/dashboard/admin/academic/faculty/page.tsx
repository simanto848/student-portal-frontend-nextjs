"use client";

import { useEffect, useMemo } from "react";
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
import { Building2 } from "lucide-react";

// Hooks
import { useCrudOperations } from "@/hooks/useCrudOperations";
import {
  useFaculties,
  useCreateFaculty,
  useUpdateFaculty,
  useDeleteFaculty,
  useAssignDean,
} from "@/hooks/queries/useAcademicQueries";

// Services & Types
import { Faculty } from "@/services/academic/types";
import { teacherService, Teacher } from "@/services/teacher.service";

// Validation
import { facultySchema, validateForm } from "@/lib/validations/academic";
import { ApiError } from "@/types/api";
import { useState } from "react";

export default function FacultyManagementPage() {
  // React Query hooks
  const { data: faculties = [], isLoading, refetch } = useFaculties();
  const createFacultyMutation = useCreateFaculty();
  const updateFacultyMutation = useUpdateFaculty();
  const deleteFacultyMutation = useDeleteFaculty();
  const assignDeanMutation = useAssignDean();

  // Local state for teachers (for dean assignment)
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // CRUD operations state
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignDeanModalOpen, setIsAssignDeanModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch teachers for dean assignment
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await teacherService.getAllTeachers();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  // Get dean name helper
  const getDeanName = (deanId?: string) => {
    if (!deanId) return null;
    const teacher = teachers.find((t) => t.id === deanId);
    return teacher ? teacher.fullName : "Unknown Dean";
  };

  // Table columns definition
  const columns: Column<Faculty>[] = useMemo(
    () => [
      { header: "Faculty Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      {
        header: "Dean",
        accessorKey: "deanId",
        cell: (item) => {
          const deanName = getDeanName(item.deanId);
          return (
            deanName || (
              <span className="text-[#344e41]/50 italic">Not Assigned</span>
            )
          );
        },
      },
      {
        header: "Departments",
        accessorKey: "departmentsCount",
        cell: (item) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#588157]/20 text-[#344e41]">
            {item.departmentsCount || 0}
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
      {
        header: "Actions",
        accessorKey: "id",
        cell: (item) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                (window.location.href = `/dashboard/admin/academic/faculty/${item.id}`)
              }
              className="text-xs px-2 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
            >
              View
            </button>
            <button
              onClick={() => handleAssignDeanClick(item)}
              className="text-xs px-2 py-1 rounded border border-[#588157] text-[#588157] hover:bg-[#588157] hover:text-white transition-colors"
            >
              Assign Dean
            </button>
          </div>
        ),
      },
    ],
    [teachers],
  );

  // Form fields definition
  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Faculty Name",
        type: "text",
        required: true,
        placeholder: "e.g. School of Engineering",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "faculty@university.edu",
      },
      {
        name: "phone",
        label: "Phone",
        type: "text",
        placeholder: "+880 1XXX-XXXXXX",
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
    [],
  );

  // Assign dean form fields
  const assignDeanFields: FormField[] = useMemo(
    () => [
      {
        name: "deanId",
        label: "Select Dean",
        type: "searchable-select",
        required: true,
        placeholder: "Search for a teacher...",
        options: teachers.map((t) => ({
          label: `${t.fullName} (${t.email})`,
          value: t.id,
        })),
      },
    ],
    [teachers],
  );

  // Handlers
  const handleCreate = () => {
    setSelectedFaculty(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsFormModalOpen(true);
  };

  const handleAssignDeanClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsAssignDeanModalOpen(true);
  };

  const handleDeleteClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFaculty) return;

    setIsDeleting(true);
    try {
      await deleteFacultyMutation.mutateAsync(selectedFaculty.id);
      toast.success("Faculty deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedFaculty(null);
    } catch (error) {
      const message = ApiError.isApiError(error)
        ? error.message
        : "Failed to delete faculty";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);

    try {
      // Validate using Zod schema
      const validation = validateForm(facultySchema, data);

      if (!validation.success) {
        // Show first validation error
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        name: validation.data.name,
        email: validation.data.email,
        phone: data.phone?.trim() || undefined,
        status: validation.data.status,
      };

      if (selectedFaculty) {
        await updateFacultyMutation.mutateAsync({
          id: selectedFaculty.id,
          data: submitData,
        });
        toast.success("Faculty updated successfully");
      } else {
        await createFacultyMutation.mutateAsync(submitData);
        toast.success("Faculty created successfully");
      }

      setIsFormModalOpen(false);
      setSelectedFaculty(null);
    } catch (error) {
      const message = ApiError.isApiError(error)
        ? error.message
        : "Failed to save faculty";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDeanSubmit = async (data: Record<string, string>) => {
    if (!selectedFaculty) return;

    setIsSubmitting(true);
    try {
      await assignDeanMutation.mutateAsync({
        facultyId: selectedFaculty.id,
        deanId: data.deanId,
      });
      toast.success("Dean assigned successfully");
      setIsAssignDeanModalOpen(false);
      setSelectedFaculty(null);
    } catch (error) {
      const message = ApiError.isApiError(error)
        ? error.message
        : "Failed to assign dean";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Faculty Management"
          subtitle="Manage university faculties and schools"
          actionLabel="Add New Faculty"
          onAction={handleCreate}
          icon={Building2}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
          </div>
        ) : (
          <DataTable
            data={faculties}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search faculty by name..."
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Faculty"
          description={`Are you sure you want to delete "${selectedFaculty?.name}"? This action cannot be undone. Note: Faculties with active departments cannot be deleted.`}
          isDeleting={isDeleting}
        />

        {/* Create/Edit Form Modal */}
        <GenericFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={selectedFaculty ? "Edit Faculty" : "Add New Faculty"}
          description={
            selectedFaculty
              ? "Update faculty information"
              : "Create a new faculty"
          }
          fields={formFields}
          initialData={
            selectedFaculty
              ? {
                  name: selectedFaculty.name,
                  email: selectedFaculty.email,
                  phone: selectedFaculty.phone || "",
                  status: selectedFaculty.status ? "true" : "false",
                }
              : { status: "true" }
          }
          isSubmitting={isSubmitting}
        />

        {/* Assign Dean Modal */}
        <GenericFormModal
          isOpen={isAssignDeanModalOpen}
          onClose={() => setIsAssignDeanModalOpen(false)}
          onSubmit={handleAssignDeanSubmit}
          title="Assign Dean"
          description={`Assign a dean to ${selectedFaculty?.name}`}
          fields={assignDeanFields}
          initialData={{ deanId: selectedFaculty?.deanId || "" }}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
