"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, Classroom, Department, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Monitor } from "lucide-react";

// Helper to get name from object or string
const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.name) return item.name;
    return "N/A";
};

// Helper to get ID from object or string
const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.id) return item.id;
    return "";
};

export default function ClassroomManagementPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<Classroom>[] = [
        { header: "Room Number", accessorKey: "roomNumber" },
        { header: "Building", accessorKey: "buildingName" },
        { header: "Capacity", accessorKey: "capacity" },
        { header: "Type", accessorKey: "roomType" },
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (item) => getName(item.departmentId)
        },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (item) => (
                <Badge
                    variant={item.isActive ? "default" : "destructive"}
                    className={item.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                >
                    {item.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "roomNumber",
            label: "Room Number",
            type: "text",
            required: true,
            placeholder: "e.g. 101"
        },
        {
            name: "buildingName",
            label: "Building Name",
            type: "text",
            required: true,
            placeholder: "e.g. Academic Building 1"
        },
        {
            name: "floor",
            label: "Floor",
            type: "number",
            placeholder: "e.g. 1"
        },
        {
            name: "capacity",
            label: "Capacity",
            type: "number",
            required: true,
            placeholder: "e.g. 60"
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
            ]
        },
        {
            name: "departmentId",
            label: "Department (Optional)",
            type: "select",
            placeholder: "Select a department",
            options: Array.isArray(departments)
                ? departments
                    .filter(d => d.status)
                    .map(d => ({ label: `${d.name} (${d.shortName})`, value: d.id }))
                : []
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" }
            ]
        },
        {
            name: "isUnderMaintenance",
            label: "Under Maintenance",
            type: "select",
            options: [
                { label: "Yes", value: "true" },
                { label: "No", value: "false" }
            ]
        },
        {
            name: "maintenanceNotes",
            label: "Maintenance Notes",
            type: "textarea",
            placeholder: "Details about maintenance..."
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
                academicService.getAllDepartments()
            ]);
            setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load data";
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

    const handleEdit = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (classroom: Classroom) => {
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
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to delete classroom";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedClassroom(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.roomNumber || !data.buildingName) {
                toast.error("Room number and building name are required");
                setIsSubmitting(false);
                return;
            }

            const capacity = Number(data.capacity);
            if (!capacity || capacity < 1) {
                toast.error("Capacity must be at least 1");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                roomNumber: data.roomNumber.trim(),
                buildingName: data.buildingName.trim(),
                floor: data.floor ? Number(data.floor) : undefined,
                capacity: capacity,
                roomType: data.roomType as any,
                departmentId: data.departmentId || undefined,
                isActive: data.isActive === "true",
                isUnderMaintenance: data.isUnderMaintenance === "true",
                maintenanceNotes: data.maintenanceNotes?.trim() || undefined,
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
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save classroom";
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
                    actionLabel="Add New Classroom"
                    onAction={handleCreate}
                    icon={Monitor}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={classrooms}
                        columns={columns}
                        searchKey="roomNumber"
                        searchPlaceholder="Search by room number..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Classroom"
                    description={`Are you sure you want to delete room "${selectedClassroom?.roomNumber}"? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedClassroom ? "Edit Classroom" : "Add New Classroom"}
                    description={selectedClassroom ? "Update classroom information" : "Create a new classroom"}
                    fields={formFields}
                    initialData={selectedClassroom ? {
                        roomNumber: selectedClassroom.roomNumber,
                        buildingName: selectedClassroom.buildingName,
                        floor: String(selectedClassroom.floor || ""),
                        capacity: String(selectedClassroom.capacity),
                        roomType: selectedClassroom.roomType,
                        departmentId: getId(selectedClassroom.departmentId),
                        isActive: selectedClassroom.isActive ? "true" : "false",
                        isUnderMaintenance: selectedClassroom.isUnderMaintenance ? "true" : "false",
                        maintenanceNotes: selectedClassroom.maintenanceNotes || "",
                    } : { isActive: "true", isUnderMaintenance: "false", roomType: "Lecture Hall" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
