/* eslint-disable @typescript-eslint/no-unused-vars */
import { studentService } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { StudentManagementClient } from "./fragments/StudentManagementClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Student Management",
  description: "Manage the scholars within the academic arena.",
};


export default async function StudentsPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  const [studentsResult, deletedStudents, departments, programs, batches, sessions] = await Promise.all([
    studentService.getAll({ limit: 50 }).catch((error) => {
      return { students: [], pagination: undefined };
    }),
    studentService.getDeleted().catch((error) => {
      return [];
    }),
    departmentService.getAllDepartments().catch((error) => {
      return [];
    }),
    programService.getAllPrograms().catch((error) => {
      return [];
    }),
    batchService.getAllBatches().catch((error) => {
      return [];
    }),
    sessionService.getAllSessions().catch((error) => {
      return [];
    }),
  ]);

  return (
    <StudentManagementClient
      initialStudents={studentsResult.students || []}
      deletedStudents={deletedStudents}
      departments={Array.isArray(departments) ? departments : []}
      programs={Array.isArray(programs) ? programs : []}
      batches={Array.isArray(batches) ? batches : []}
      sessions={Array.isArray(sessions) ? sessions : []}
    />
  );
}
