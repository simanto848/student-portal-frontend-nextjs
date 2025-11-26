"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, Classroom, Department, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.name) return item.name;
    return "N/A";
};

const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.id) return item.id;
    return "";
};

interface ClassroomWithDetails extends Classroom {
    departmentName: string;
}

export default function ClassroomManagementPage() {
    const router = useRouter();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<ClassroomWithDetails>[] = [
        {
            header: "Room Number",
            accessorKey: "roomNumber",
        },
        {
            header: "Building",
            accessorKey: "buildingName",
        },
        {
            header: "Type",
            accessorKey: "roomType",
        },
        {
            header: "Capacity",
            accessorKey: "capacity",
        },
        {
            header: "Floor",
            accessorKey: "floor",
            cell: (item) => item.floor?.toString() || "N/A",
        },
        {
            header: "Department",
            accessorKey: "departmentName",
        },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "roomNumber",
            label: "Room Number",
            type: "text",
            required: true,
            placeholder: "e.g. 101",
        },
        {
            name: "buildingName",
            label: "Building Name",
            type: "text",
            required: true,
            placeholder: "e.g. Academic Building 1",
        },
        {
            name: "floor",
            label: "Floor",
            type: "number",
            required: false,
            placeholder: "e.g. 1",
        },
        {
            name: "capacity",
            label: "Capacity",
            type: "number",
            required: true,
            placeholder: "e.g. 50",
        },
        {
            name: "roomType",
            label: "Room Type",
            type: "select",
            required: true,
            options: [
                { label: "Lecture Hall", value: "Lecture Hall" },
                { label: "Laboratory", value: "Laboratory" },
                { label: "Seminar Room", value: "Seminar Room" },
                { label: "Computer Lab", value: "Computer Lab" },
                { label: "Conference Room", value: "Conference Room" },
                { label: "Virtual", value: "Virtual" },
                { label: "Other", value: "Other" },
            ],
        },
        {
            name: "departmentId",
            label: "Department",
            type: "searchable-select",
            required: false,
            placeholder: "Select a department (optional)",
            options: departments.filter(d => d.status).map(d => ({ label: d.name, value: d.id })),
        },
        {
            name: "facilities",
            label: "Facilities",
            type: "text",
            required: false,
            placeholder: "e.g. Projector, Whiteboard (comma separated)",
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
            ],
        },
        {
            name: "isUnderMaintenance",
            label: "Maintenance",
            type: "select",
            required: true,
            options: [
                { label: "No", value: "false" },
                { label: "Yes", value: "true" },
            ],
        },
        {
            name: "maintenanceNotes",
            label: "Maintenance Notes",
            type: "textarea",
            required: false,
            placeholder: "Details about maintenance...",
        },
    ], [departments]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [classroomsData, deptsData] = await Promise.all([
                academicService.getAllClassrooms(),
                academicService.getAllDepartments(),
            ]);
            setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load data";
            toast.error(message);
            setClassrooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedClassroom(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (classroom: ClassroomWithDetails) => {
        setSelectedClassroom(classroom);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (classroom: ClassroomWithDetails) => {
        setSelectedClassroom(classroom);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedClassroom) return;
        setIsDeleting(true);
        try {
            await academicService.deleteClassroom(selectedClassroom.id);
            toast.success("Classroom deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to delete classroom";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedClassroom(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            const submitData = {
                roomNumber: data.roomNumber,
                buildingName: data.buildingName,
                floor: data.floor ? parseInt(data.floor) : undefined,
                capacity: parseInt(data.capacity),
                roomType: data.roomType as any,
                departmentId: data.departmentId || undefined,
                facilities: data.facilities ? data.facilities.split(',').map(f => f.trim()) : [],
                isActive: data.isActive === "true",
                isUnderMaintenance: data.isUnderMaintenance === "true",
                maintenanceNotes: data.maintenanceNotes || undefined,
            };

            if (selectedClassroom) {
                await academicService.updateClassroom(selectedClassroom.id, submitData);
                toast.success("Classroom updated successfully");
            } else {
                await academicService.createClassroom(submitData);
                toast.success("Classroom created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to save classroom";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Classroom Management"
                    subtitle="Manage classrooms and facilities"
                    actionLabel="Add Classroom"
                    onAction={handleCreate}
                    icon={Building2}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={classrooms.map(c => ({
                            ...c,
                            departmentName: c.departmentId ? (c.departmentId as any).name : 'N/A',
                        }))}
                        columns={columns}
                        searchKey="roomNumber"
                        searchPlaceholder="Search by room number..."
                        onView={(item) => router.push(`/dashboard/admin/academic/classroom/${item.id}`)}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Classroom"
                    description="Are you sure you want to delete this classroom? This action cannot be undone."
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedClassroom ? "Edit Classroom" : "Add Classroom"}
                    description={selectedClassroom ? "Update classroom information" : "Create a new classroom"}
                    fields={formFields}
                    initialData={selectedClassroom ? {
                        roomNumber: selectedClassroom.roomNumber,
                        buildingName: selectedClassroom.buildingName,
                        floor: selectedClassroom.floor?.toString() || "",
                        capacity: selectedClassroom.capacity.toString(),
                        roomType: selectedClassroom.roomType,
                        departmentId: getId(selectedClassroom.departmentId),
                        facilities: selectedClassroom.facilities.join(', '),
                        isActive: selectedClassroom.isActive.toString(),
                        isUnderMaintenance: selectedClassroom.isUnderMaintenance.toString(),
                        maintenanceNotes: selectedClassroom.maintenanceNotes || "",
                    } : {
                        isActive: "true",
                        isUnderMaintenance: "false",
                    }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
