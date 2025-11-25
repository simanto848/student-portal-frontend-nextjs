"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, Faculty, Department, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building } from "lucide-react";

// Helper to get faculty name from department
const getFacultyName = (dept: Department): string => {
    if (typeof dept.facultyId === 'object' && dept.facultyId?.name) return dept.facultyId.name;
    return "N/A";
};

// Helper to get faculty ID from department
const getFacultyId = (dept: Department): string => {
    if (typeof dept.facultyId === 'string') return dept.facultyId;
    if (typeof dept.facultyId === 'object' && dept.facultyId?.id) return dept.facultyId.id;
    return '';
};

export default function DepartmentManagementPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<Department>[] = [
        { header: "Department Name", accessorKey: "name" },
        { header: "Short Name", accessorKey: "shortName" },
        {
            header: "Faculty",
            accessorKey: "facultyId",
            cell: (item) => getFacultyName(item)
        },
        {
            header: "Head",
            accessorKey: "departmentHeadId",
            cell: (item) => {
                if (item.departmentHead?.fullName) {
                    return (
                        <span>
                            {item.departmentHead.fullName}
                            {item.isActingHead && (
                                <span className="ml-1 text-xs text-[#588157]">(Acting)</span>
                            )}
                        </span>
                    );
                }
                return <span className="text-[#344e41]/50 italic">Not Assigned</span>;
            }
        },
        {
            header: "Programs",
            accessorKey: "programsCount",
            cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#588157]/20 text-[#344e41]">
                    {item.programsCount || 0}
                </span>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge 
                    variant={item.status ? "default" : "destructive"} 
                    className={item.status 
                        ? "bg-green-100 text-green-800 hover:bg-green-200" 
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                >
                    {item.status ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ];

    // Generate form fields dynamically based on faculties state
    const formFields: FormField[] = useMemo(() => [
        { 
            name: "name", 
            label: "Department Name", 
            type: "text", 
            required: true, 
            placeholder: "e.g. Computer Science and Engineering" 
        },
        { 
            name: "shortName", 
            label: "Short Name", 
            type: "text", 
            required: true, 
            placeholder: "e.g. CSE" 
        },
        { 
            name: "email", 
            label: "Email", 
            type: "email", 
            required: true, 
            placeholder: "dept@university.edu" 
        },
        { 
            name: "phone", 
            label: "Phone", 
            type: "text", 
            placeholder: "+880 1XXX-XXXXXX" 
        },
        {
            name: "facultyId",
            label: "Faculty",
            type: "select",
            required: true,
            placeholder: "Select a faculty",
            options: Array.isArray(faculties) 
                ? faculties
                    .filter(f => f.status) // Only show active faculties
                    .map(f => ({ label: f.name, value: f.id })) 
                : []
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" }
            ]
        },
    ], [faculties]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [deptsData, facultiesData] = await Promise.all([
                academicService.getAllDepartments(),
                academicService.getAllFaculties()
            ]);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
            setFaculties(Array.isArray(facultiesData) ? facultiesData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError 
                ? error.message 
                : "Failed to load data";
            toast.error(message);
            setDepartments([]);
            setFaculties([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedDepartment(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDepartment) return;
        setIsDeleting(true);
        try {
            await academicService.deleteDepartment(selectedDepartment.id);
            toast.success("Department deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError 
                ? error.message 
                : "Failed to delete department";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedDepartment(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            // Validate required fields
            if (!data.name || data.name.trim().length < 3) {
                toast.error("Department name must be at least 3 characters");
                setIsSubmitting(false);
                return;
            }

            if (!data.shortName || data.shortName.trim().length < 2) {
                toast.error("Short name must be at least 2 characters");
                setIsSubmitting(false);
                return;
            }

            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                toast.error("Please enter a valid email address");
                setIsSubmitting(false);
                return;
            }

            if (data.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(data.phone)) {
                toast.error("Please enter a valid phone number");
                setIsSubmitting(false);
                return;
            }

            if (!data.facultyId) {
                toast.error("Please select a faculty");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                name: data.name.trim(),
                shortName: data.shortName.trim().toUpperCase(),
                email: data.email.toLowerCase().trim(),
                phone: data.phone?.trim() || undefined,
                facultyId: data.facultyId,
                status: data.status === "true"
            };

            if (selectedDepartment) {
                await academicService.updateDepartment(selectedDepartment.id, submitData);
                toast.success("Department updated successfully");
            } else {
                await academicService.createDepartment(submitData);
                toast.success("Department created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError 
                ? error.message 
                : "Failed to save department";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
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
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Department"
                    description={`Are you sure you want to delete "${selectedDepartment?.name}"? This action cannot be undone. Note: Departments with active programs cannot be deleted.`}
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedDepartment ? "Edit Department" : "Add New Department"}
                    description={selectedDepartment ? "Update department information" : "Create a new department"}
                    fields={formFields}
                    initialData={selectedDepartment ? {
                        name: selectedDepartment.name,
                        shortName: selectedDepartment.shortName,
                        email: selectedDepartment.email,
                        phone: selectedDepartment.phone || "",
                        facultyId: getFacultyId(selectedDepartment),
                        status: selectedDepartment.status ? "true" : "false"
                    } : { status: "true" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
