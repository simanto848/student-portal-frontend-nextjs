
import { studentService } from "@/services/user/student.service";
import { batchService } from "@/services/academic/batch.service";
import { departmentService } from "@/services/academic/department.service";
import { EnrollmentCreateClient } from "../fragments/EnrollmentCreateClient";
import { Metadata } from "next";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata: Metadata = {
    title: "Intel Induction | Guardian Intelligence",
    description: "Initiate student induction into academic streams and presence lifecycle.",
};

export default async function CreateEnrollmentPage() {
    await requireUser('/login', [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    // Initial data fetching on server
    const [studentsResponse, batchesData, departmentsData] = await Promise.all([
        studentService.getAll(),
        batchService.getAllBatches(),
        departmentService.getAllDepartments()
    ]);

    return (
        <EnrollmentCreateClient
            students={studentsResponse.students || []}
            batches={batchesData || []}
            departments={departmentsData || []}
        />
    );
}
