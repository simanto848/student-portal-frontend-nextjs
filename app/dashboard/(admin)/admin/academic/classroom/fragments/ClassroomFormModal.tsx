"use client";

import { useMemo } from "react";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { Classroom, Department, getId } from "@/services/academic.service";

interface ClassroomFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => Promise<void>;
    selectedClassroom: Classroom | null;
    departments: Department[];
    isSubmitting: boolean;
}

export function ClassroomFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedClassroom,
    departments,
    isSubmitting,
}: ClassroomFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
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
                options: departments
                    .filter((d) => d.status)
                    .map((d) => ({ label: d.name, value: d.id })),
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
        ],
        [departments]
    );

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedClassroom ? "Edit Classroom" : "Add Classroom"}
            description={
                selectedClassroom
                    ? "Update classroom information"
                    : "Create a new classroom"
            }
            fields={formFields}
            initialData={
                selectedClassroom
                    ? {
                        roomNumber: selectedClassroom.roomNumber,
                        buildingName: selectedClassroom.buildingName,
                        floor: selectedClassroom.floor?.toString() || "",
                        capacity: selectedClassroom.capacity.toString(),
                        roomType: selectedClassroom.roomType,
                        departmentId: getId(selectedClassroom.departmentId),
                        facilities: Array.isArray(selectedClassroom.facilities)
                            ? selectedClassroom.facilities.join(", ")
                            : "",
                        isActive: selectedClassroom.isActive.toString(),
                        isUnderMaintenance: selectedClassroom.isUnderMaintenance.toString(),
                        maintenanceNotes: selectedClassroom.maintenanceNotes || "",
                    }
                    : {
                        isActive: "true",
                        isUnderMaintenance: "false",
                    }
            }
            isSubmitting={isSubmitting}
        />
    );
}
